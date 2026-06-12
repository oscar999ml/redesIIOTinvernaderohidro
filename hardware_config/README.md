# Hardware ↔ SCADA — Puente de Comunicación

## Dos Sistemas, Un Objetivo

Este repositorio contiene **dos proyectos independientes** que trabajan juntos:

| Sistema | Ubicación | Tecnología | IA a cargo |
|---------|-----------|------------|------------|
| **Firmware (Microcontroladores)** | `hardware_config/` | PlatformIO (C++ Arduino) | IA de Firmware |
| **SCADA (Servidor + Dashboard)** | `Backend/` + `Frontend/` | Node.js + Next.js | IA de SCADA |

El README de cada sistema explica su arquitectura interna. Este README documenta **cómo se comunican entre sí**.

---

## Proyectos PlatformIO (carpetas `esp*`/`Esp*`)

Cada carpeta con prefijo `esp` o `Esp` es un proyecto independiente que se abre con **PlatformIO** en VS Code.

| Carpeta | Placa | Rol | Puerto Serial |
|---------|-------|-----|---------------|
| `Esp32PLC/` | upesy_wroom (ESP32) | Maestro centralizador | COM3 (USB a PC) |
| `esp8266uno/` | esp12e (ESP8266) | Nodo esclavo 1 | N/A |
| `esp8266dos/` | esp12e (ESP8266) | Nodo esclavo 2 | N/A |
| `esp8266tres/` | esp12e (ESP8266) | Nodo esclavo 3 | N/A |

Cada proyecto contiene:
- `platformio.ini` → configuración de plataforma, board, framework
- `src/main.cpp` → punto de entrada (`setup()` + `loop()`)
- `src/` → módulos `.cpp` + `.h` organizados por función

---

## Arquitectura de Comunicación

```
[SCADA - Backend/Frontend]
       ▲
       │ WebSocket (Socket.io)
       ▼
[Backend Node.js :3001]
       ▲
       │ USB Serial (COM3, 115200 baud)
       ▼
[ESP32 Maestro]  ←───  WiFi AP / RS485  ───→  [ESP8266 Nodo 1]
                                                  [ESP8266 Nodo 2]
                                                  [ESP8266 Nodo 3]
```

### Flujo de datos
1. **ESP8266 Nodos** envían lecturas al **ESP32 Maestro** (WiFi TCP en Fase 1-2, RS485/Modbus en Fase 3+)
2. **ESP32 Maestro** centraliza y reenvía al **Backend** por **Serial USB** (JSON)
3. **Backend** procesa, almacena en SQLite y distribuye por **WebSocket** al **Frontend**
4. **Backend** también envía comandos al ESP32 por Serial (ej: activar bomba, encender LED)

---

## Protocolo JSON (Fase 1-2)

La comunicación entre el ESP32 y el Backend es **líneas JSON separadas por `\n`** a 115200 baud.

### ESP32 → Backend (lecturas, eventos)
```json
{"nodo_id":1,"tipo":"lectura","datos":{"temperatura":25.5,"humedad":80,"led_estado":true}}
```

Campos validados por el Backend (Zod):
- `nodo_id`: entero positivo (1, 2, 3...)
- `tipo`: string (`"lectura"`, `"evento"`, `"alarma"`, `"status"`)
- `datos`: objeto con valores numéricos, booleanos o strings

### Backend → ESP32 (comandos)
```json
{"nodo_id":1,"accion":"led","valor":true}
```

Campos:
- `nodo_id`: entero positivo
- `accion`: string (`"led"`, `"bomba"`, `"motor"`, etc.)
- `valor`: booleano, número o string (opcional)

### Ejemplo de sesión serial
```
← {"nodo_id":1,"tipo":"lectura","datos":{"temperatura":25.5,"humedad":80}}
← {"nodo_id":2,"tipo":"status","datos":{"conectado":true,"rssi":-45}}
→ {"nodo_id":1,"accion":"led","valor":true}
← {"nodo_id":1,"tipo":"evento","datos":{"led":true,"estado":"ok"}}
```

> **Nota:** Las flechas `←` son datos del ESP32 al Backend, `→` son comandos del Backend al ESP32.

---

## Flujo Local → VPS

### Local (pruebas)
```
ESP32 ──USB──> Backend (localhost:3001) ──WebSocket──> Frontend (localhost:4000)
```
- Puerto serial configurable: `SERIAL_PORT=COM3` en `Backend/.env`
- Velocidad: `SERIAL_BAUD=115200`

### VPS / Producción (futuro)
```
ESP32 ──WiFi/TCP──> Backend (vps:3001) ──WebSocket──> Frontend (vps:4000)
```
- El ESP32 se conecta por TCP/WiFi directamente al Backend en la VPS
- O el Backend sigue recibiendo por serial desde una PC que retransmite

---

## Contrato entre IAs

### IA de Firmware (microcontroladores)
Debe emitir JSON por serial con la estructura:
```json
{"nodo_id":<int>,"tipo":"<string>","datos":{...}}
```

### IA de SCADA (Backend + Frontend)
Debe parsear y validar ese mismo JSON, y responder con comandos:
```json
{"nodo_id":<int>,"accion":"<string>","valor":<opcional>}
```

**El contrato se negocia aquí:** si el firmware cambia el formato, el backend debe actualizar su validador (`Backend/src/utils/validators.js`), y viceversa.

---

## Estado Actual — Prueba 1 Superada

El ESP32 (`Esp32PLC`) ya está operativo:

| Funcionalidad | Estado |
|---------------|--------|
| LED onboard (GPIO2) parpadea cada 1s | ✅ |
| LED externo (GPIO12) parpadea sincronizado | ✅ |
| Botón BOOT (GPIO0) cambia estado de LEDs | ✅ |
| Reporte JSON por serial cada 5s | ✅ |
| Escucha comandos JSON desde el Backend | ✅ |

### Mensajes que envía el ESP32 ahora

**Cada 5 segundos:**
```json
{"nodo_id":1,"tipo":"lectura","datos":{"led_onboard":true,"led_gpio12":false,"btn_boot":false}}
```

**Al presionar el botón:**
```json
{"nodo_id":1,"tipo":"evento","datos":{"boton":"BOOT","presionado":true,"leds":false}}
```

---

## Siguiente Paso — IA de SCADA: Conectar al Backend

El ESP32 ya está conectado por USB y escuchando comandos. **La IA de SCADA debe:**

### 1. Verificar que el Backend recibe los mensajes seriales
- Configurar `SERIAL_PORT=COM3` y `SERIAL_BAUD=115200` en `Backend/.env`
- Iniciar el Backend y verificar que `serialManager.js` abre el puerto
- Confirmar que los JSON del ESP32 aparecen en los logs del Backend

### 2. Implementar control manual de LEDs desde el Dashboard
- El Frontend debe tener un botón/interruptor para encender/apagar LEDs
- Ese botón llama a la API REST del Backend (`POST /api/comandos`)
- El Backend envía por serial: `{"nodo_id":1,"accion":"led","valor":true}`
- El ESP32 lo recibe, ejecuta y responde con un evento de confirmación

### 3. Comandos soportados por el firmware actual

| Comando | Efecto |
|---------|--------|
| `{"nodo_id":1,"accion":"led","valor":true}` | Enciende ambos LEDs |
| `{"nodo_id":1,"accion":"led","valor":false}` | Apaga ambos LEDs |

> El ESP32 responde a cada comando con un evento JSON de confirmación indicando el estado resultante de cada LED.
