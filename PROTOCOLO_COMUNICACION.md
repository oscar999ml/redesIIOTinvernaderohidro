# Protocolo de Comunicación Firmware ↔ SCADA

## 1. Identidad de las 2 IAs

| Rol | IA | Responsabilidad | Directorio |
|---|---|---|---|
| **IA Firmware** | Tú | ESP32 (maestro) + ESP8266 (nodos) — PlatformIO | `hardware_config/` |
| **IA SCADA** | Yo | Backend Node.js + Frontend Next.js | `Backend/` + `Frontend/` |

> **Regla de oro:** El firmware (IA Hardware) **produce** datos de sensores y **ejecuta** comandos.
> El SCADA (IA Backend) **consume** datos, **evalúa** alarmas, **persiste** históricos y **envía** comandos.

---

## 2. Arquitectura del Sistema

### Fase 1: Local — ESP32 directo por USB (ACTUAL)

```
[PC / Backend SCADA + Frontend]
        │  USB-Serial (115200 baud)
        ▼
[ESP32]  ←  Nodo 1 con LED + botón
```

El ESP32 se conecta directo por USB al backend.
Sin WiFi, sin ESP8266. Control básico de LED.

### Fase 2: VPS / Internet

```
[Frontend Web] ─── REST + WebSocket ───┐
                                        ▼
[VPS / Backend SCADA]  ←─── WebSocket ───┼─── (futuro: autenticación con JWT)
        │                                │
        ▼                                ▼
[ESP32 Maestro]  ←  WiFi Station    [ESP8266 Nodo remoto]
  (en invernadero)    se conecta      (directo a VPS, opcional)
                      directo al VPS
```

> **Nota:** En VPS, el ESP32 ya no usa USB-Serial. Se conecta directo al backend vía WebSocket.
> El backend expone un endpoint WebSocket en el mismo puerto que REST.

---

## 3. Formato de Mensajes (EL IDIOMA COMÚN)

### 3.1 Lectura de sensores + estado actuadores (ESP8266 → Backend)

**Ruta:** ESP8266 → WiFi/TCP → ESP32 → USB-Serial → Backend

```json
{
  "nodo_id": 1,
  "tipo": "estado",
  "datos": {
    "temperatura": 24.5,
    "humedad": 65.2,
    "ph": 6.8,
    "led": true,
    "bomba_riego": false,
    "boton": false
  }
}
```

**Reglas:**
- `nodo_id`: entero positivo, único por nodo (1, 2, 3...)
- `tipo`: siempre `"estado"` por ahora
- `datos`: objeto con variables. Solo incluir las que cambiaron o todas.
- Se envía **línea por línea** separado por `\n` (Newline delimited JSON)

### 3.2 Comando a actuador (Backend → ESP8266)

**Ruta:** Frontend → REST POST /api/comandos → Backend → USB-Serial → ESP32 → WiFi/TCP → ESP8266

```json
{
  "nodo_id": 1,
  "accion": "set_led",
  "valor": true
}
```

**Acciones válidas:**

| accion | valor esperado | actuador |
|---|---|---|
| `set_led` | boolean | LED indicador |
| `set_bomba_riego` | boolean | Bomba de riego |
| `set_ventilador` | boolean | Ventilador |
| `set_bomba_nutrientes` | boolean | Bomba nutrientes |
| `set_calefactor` | boolean | Calefactor |
| `set_iluminacion` | boolean | Iluminación cultivo |
| `set_valvula_agua` | boolean | Válvula solenoide |

---

## 4. Diccionario de Variables

| Variable | Tipo | Unidad | Rango típico | Descripción |
|---|---|---|---|---|
| `temperatura` | number | °C | 18-38 | Temperatura ambiente |
| `humedad` | number | % RH | 40-95 | Humedad relativa |
| `co2` | number | ppm | 400-1600 | CO₂ ambiental |
| `luminosidad` | number | lux | 5000-85000 | Luz ambiental |
| `ph` | number | — | 5.0-8.0 | pH solución nutritiva |
| `ec` | number | mS/cm | 0.4-3.8 | Conductividad eléctrica |
| `temp_agua` | number | °C | 16-28 | Temperatura del agua |
| `nivel_agua` | number | % | 10-100 | Nivel tanque agua |
| `humedad_suelo` | number | % | 20-90 | Humedad del sustrato |
| `presion_agua` | number | bar | 0.3-4.5 | Presión de agua |
| `led` | boolean | — | 0/1 | LED (actuador) |
| `bomba_riego` | boolean | — | 0/1 | Bomba de riego |
| `ventilador` | boolean | — | 0/1 | Ventilador |
| `bomba_nutrientes` | boolean | — | 0/1 | Bomba nutrientes |
| `calefactor` | boolean | — | 0/1 | Calefactor |
| `iluminacion` | boolean | — | 0/1 | Iluminación |
| `valvula_agua` | boolean | — | 0/1 | Válvula de agua |
| `boton` | boolean | — | 0/1 | Botón físico (solo lectura) |

---

## 5. PRUEBA INICIAL: LED On/Off

### Objetivo
Encender y apagar un LED del ESP8266 #1 desde el Frontend SCADA.

### Pipeline completo

```
1. Frontend → click toggle LED
2. POST /api/comandos  →  { nodo_id: 1, accion: "set_led", valor: true/false }
3. Backend recibe, guarda en DB, envía por Serial al ESP32
4. ESP32 recibe por Serial, reenvía por WiFi TCP al ESP8266 #1
5. ESP8266 #1 recibe, cambia estado del pin GPIO del LED
6. ESP8266 #1 reporta nuevo estado: { nodo_id: 1, tipo: "estado", datos: { led: true, ... } }
7. ESP32 reenvía al Backend por Serial
8. Backend actualiza DB y emite WebSocket al Frontend
9. Frontend muestra LED encendido
```

### Código mínimo en ESP8266

```cpp
void loop() {
  // Escuchar comandos del ESP32 (WiFi TCP)
  // Si llega {"accion":"set_led","valor":true} → digitalWrite(PIN_LED, HIGH)
  // Responder con estado actualizado
}
```

### Código mínimo en ESP32

```cpp
void loop() {
  // Leer Serial desde PC
  // Reenviar a ESP8266 destino por WiFi TCP
  // Leer WiFi TCP desde ESP8266
  // Reenviar a PC por Serial
}
```

---

## 6. Modos de Conexión

### 6.1 LOCAL (fase actual)

| Componente | Medio | Puerto/Baud | Formato |
|---|---|---|---|
| ESP32 ↔ PC Backend | USB-Serial | COM3 @ 115200 baud | JSON + `\n` |
| ESP32 ↔ ESP8266 | WiFi (AP/Station) | TCP 3333 (ejemplo) | JSON + `\n` |

- ESP32 crea red WiFi AP interna (ej: SSID `"InvernaderoNet"`, pass `"control123"`)
- ESP8266 se conectan como Station al AP del ESP32
- ESP32 asigna IPs fijas a los ESP8266 para enrutar comandos

### 6.2 VPS / Internet (futuro)

| Componente | Medio | URL | Protocolo |
|---|---|---|---|
| ESP32 ↔ Backend | WiFi → Internet | `wss://tudominio.com/ws` | WebSocket |
| Frontend ↔ Backend | Internet | `https://tudominio.com` | REST + WebSocket |
| ESP8266 ↔ Backend | WiFi → Internet | `wss://tudominio.com/ws` | WebSocket (opcional) |

- El ESP32 usa WiFi en modo Station para conectarse a internet
- Se autentica con JWT al backend
- Envía lecturas por WebSocket en el mismo formato JSON
- Recibe comandos por WebSocket

---

## 7. Eventos WebSocket (Backend ↔ Frontend)

El backend emite estos eventos para que el frontend (y eventualmente el ESP32 en VPS) los reciban en tiempo real:

| Evento | Dirección | Datos |
|---|---|---|
| `nodo:estado` | Backend → Frontend | `{ nodo_id, sede_id, timestamp, datos }` |
| `alarma:nueva` | Backend → Frontend | `{ id, nodo_id, variable, valor, umbral, tipo }` |
| `alarma:resuelta` | Backend → Frontend | `{ id, nodo_id }` |
| `sistema:serial` | Backend → Frontend | `{ conectado: bool, puerto: string }` |
| `sistema:error` | Backend → Frontend | `{ mensaje: string }` |

---

## Apéndice: Instrucciones para la IA de Hardware (Firmware)

### Firmware ya escrito (por mí, IA SCADA)

| Dispositivo | Archivo | nodo_id | Rol |
|---|---|---|---|
| ESP32 | `hardware_config/Esp32PLC/src/main.cpp` | 1 | Nodo directo por USB-Serial |

> ⚠️ Los proyectos `esp8266uno`, `esp8266dos`, `esp8266tres` son solo templates.
> La IA de hardware los implementará cuando se agreguen más nodos en fases siguientes.

### Lo que hace el ESP32
- nodo_id = 1 (coincide con la base de datos del SCADA)
- Se conecta directo por USB-Serial (115200 baud)
- LED en GPIO2 (LED_BUILTIN)
- Botón en GPIO0 (BOOT, INPUT_PULLUP)
- Recibe comandos: `{"nodo_id":1,"accion":"set_led","valor":true/false}`
- Reporta estado: `{"nodo_id":1,"tipo":"estado","datos":{"led":true/false,"boton":true/false}}`
- Botón físico hace toggle del LED localmente

### Pipeline completo

```
[Frontend Prueba Rápida] → click toggle LED
  → POST /api/comandos {nodo_id:1, accion:"set_led", valor:true}
    → Backend recibe, guarda en DB
      → SerialPort.write() al ESP32
        → ESP32 recibe por USB, cambia GPIO2, responde estado
          → Backend parsea, guarda lectura, emite WebSocket
            → Frontend actualiza el LED visualmente
```

### Para compilar y subir (PlatformIO)

```bash
cd hardware_config/Esp32PLC
pio run --target upload
```

### Notas importantes
- El backend debe estar DETENIDO para usar el puerto COM en PlatformIO
- Después de subir, iniciar backend con: `npm run start`
- Si el LED no parpadea, revisar el pin GPIO2 en tu modelo de ESP32

## 8. Reglas para las 2 IAs

### IA Hardware (firmware):
- Trabaja dentro de `hardware_config/`
- Cada ESP8266 es un proyecto PlatformIO separado (`esp8266uno/`, `esp8266dos/`, etc.)
- El ESP32 es el gateway: reenvía mensajes entre Serial (PC) y WiFi (ESP8266) **sin modificar el JSON**
- Usa el formato JSON exacto definido en la sección 3
- El LED de prueba va en GPIO2 (D4) del ESP8266

### IA SCADA (backend + frontend):
- Trabaja dentro de `Backend/` y `Frontend/`
- El backend escucha en COM3 @ 115200 baud (configurable en `.env`)
- El backend también tiene modo simulación (`SIMULATE=true`) para probar sin hardware
- Los comandos llegan por REST POST `/api/comandos` y se reenvían por Serial
- El frontend se conecta vía WebSocket para datos en tiempo real

---

## 9. Checklist de Fase 1

- [x] ESP32 firmware escrito (nodo_id=1, LED GPIO2, botón GPIO0)
- [ ] ESP32 conectado por USB a PC (COM3)
- [ ] Firmware subido al ESP32 via PlatformIO
- [ ] Backend iniciado en modo hardware: `npm run start`
- [ ] ESP32 reporta estado: `{"nodo_id":1,"tipo":"estado","datos":{"led":false,"boton":false}}`
- [ ] Backend recibe por Serial y muestra en consola
- [ ] Frontend Prueba Rápida muestra el LED y permite toggle
- [ ] Botón físico del ESP32 enciende/apaga LED localmente
- [ ] Pipeline completo: Frontend → Backend → Serial → ESP32 → LED
