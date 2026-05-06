# Agentes del Sistema - Invernadero Hidropónico IoT

## Descripción General del Proyecto

Sistema de automatización industrial para empresa de cultivos con invernaderos hidropónicos.
Simula un entorno HMI/SCADA distribuido donde cada microcontrolador actúa como una PLC independiente
con su propia lógica de control, comunicándose con un centralizador maestro.

---

## Arquitectura del Sistema

```
[PC / SCADA Central]
        |
     (USB - Cable físico obligatorio)
        |
    [ESP32 - Maestro/Centralizador]
        |
   (Fase 1: WiFi AP interno)
   (Fase 3: Cable RS485/CAN Bus)
        |
   _____|_____
  |           |
[ESP8266]  [ESP8266]  ...  [ESP8266]
 Nodo 1     Nodo 2          Nodo N
 (PLC)      (PLC)           (PLC)
```

---

## Roles de los Agentes

### ESP32 - Centralizador Maestro
- Conectado **siempre por cable USB** a la PC (obligatorio en todas las fases)
- Levanta red WiFi AP interna para comunicación con nodos ESP8266 (Fase 1 y 2)
- En Fase 3+: actúa como maestro en protocolo de cable físico (RS485/Modbus o CAN Bus)
- Recibe y centraliza datos de todos los nodos
- Expone interfaz hacia el SCADA en la PC
- Gestiona alarmas y eventos del sistema global

### ESP8266 - Nodos PLC Esclavos
- Cada nodo controla una sección del invernadero
- Lógica de control autónoma (no depende del maestro para funcionar localmente)
- HMI local propia por nodo (display, botones, indicadores)
- Control de: motores, bombas, válvulas, sensores, iluminación
- Reporta estado al ESP32 maestro
- Recibe comandos del SCADA a través del ESP32

---

## Fases del Proyecto

### Fase 1 - Pruebas Básicas (ACTUAL)
**Objetivo:** Verificar comunicación y control elemental

- [ ] ESP32 conectado por USB a PC
- [ ] ESP32 levanta red WiFi AP interna
- [ ] ESP8266 se conecta al WiFi del ESP32
- [ ] Control de LED encendido/apagado desde PC
- [ ] Lectura de botón físico desde PC
- [ ] Comunicación bidireccional ESP32 ↔ ESP8266
- [ ] Validar latencia y estabilidad de la red WiFi interna

**Hardware mínimo por nodo:**
- 1x LED + resistencia
- 1x botón pulsador
- Alimentación 3.3V/5V

---

### Fase 2 - Control de Actuadores y HMI Local
**Objetivo:** Control real de hardware de invernadero

- [ ] Control de motores DC con driver (L298N o similar)
- [ ] Control de bombas de riego
- [ ] Sensores: temperatura, humedad, pH, nivel de agua
- [ ] HMI local por nodo (OLED/LCD + botones)
- [ ] Dashboard SCADA básico en PC
- [ ] Lógica de control automático por nodo (sin depender del maestro)
- [ ] Alarmas locales y remotas

**Hardware por nodo:**
- Driver de motor
- Sensores ambientales (DHT22, DS18B20, etc.)
- Display OLED 0.96"
- Relés para cargas de potencia

---

### Fase 3 - Escalado Industrial con Cable Físico
**Objetivo:** Comunicación robusta, anti-ruido, larga distancia

- [ ] Migrar comunicación ESP32 ↔ ESP8266 a protocolo cableado
- [ ] Protocolo seleccionado: **RS485 + Modbus RTU** (hasta 1200m, anti-ruido, estándar industrial)
- [ ] Módulos MAX485 por cada nodo
- [ ] Topología de red definida (bus RS485)
- [ ] Distancia objetivo: mínimo 100 metros
- [ ] Protección contra interferencias electromagnéticas (EMI)
- [ ] Cableado estructurado con cable de par trenzado

---

### Fase 4 - Electrónica de Potencia e Infraestructura
**Objetivo:** Sistema listo para producción industrial

- [ ] Electrónica de potencia: relés, contactores, drivers de alta corriente
- [ ] Protecciones eléctricas: fusibles, varistores, optoacopladores
- [ ] Cálculo y diseño de cableado Cat6
- [ ] Diseño de topología de red: estrella, bus, árbol
- [ ] Dimensionamiento de switch industrial
- [ ] Gabinetes eléctricos y montaje en riel DIN
- [ ] Documentación técnica completa (diagramas, planos)

---

## Protocolo de Comunicación por Fases

| Fase | Protocolo | Medio | Distancia | Velocidad |
|------|-----------|-------|-----------|-----------|
| 1-2  | TCP/IP (WiFi) | Inalámbrico | ~50m | Alta |
| 3-4  | RS485 / Modbus RTU | Par trenzado | ~1200m | Media-Alta |
| 3-4  | CAN Bus (alternativo) | Par trenzado | ~500m | Alta |

---

## Convenciones del Proyecto

- Cada nodo ESP8266 tiene un **ID único** asignado
- Mensajes en formato **JSON** para Fase 1-2
- Mensajes en formato **Modbus RTU** para Fase 3-4
- Logs centralizados en el ESP32
- Código organizado por nodo en carpetas separadas dentro de `/hardware_config`

---

## Estructura de Código - Organización Modular

El código de cada microcontrolador **NO debe ser monolítico**. Se divide en módulos `.cpp` + `.h` desde el inicio.

### Regla general
- `main.cpp` → solo contiene `setup()` y `loop()`, importa módulos
- Cada módulo tiene su `.h` (declaraciones) y su `.cpp` (implementación)
- Cualquier `.cpp` puede incluir cualquier `.h` de otro módulo

### Estructura modular por proyecto

```
esp32_maestro/src/
├── main.cpp           ← solo setup() y loop()
├── wifi_ap.cpp        ← levantar red WiFi AP
├── wifi_ap.h
├── serial_scada.cpp   ← comunicación USB con PC/SCADA
├── serial_scada.h
├── gestor_nodos.cpp   ← recibir/enviar datos a los ESP8266
├── gestor_nodos.h
├── alarmas.cpp        ← lógica de alarmas globales
└── alarmas.h

esp8266_nodo_XX/src/
├── main.cpp           ← solo setup() y loop()
├── wifi_cliente.cpp   ← conexión al AP del ESP32
├── wifi_cliente.h
├── sensores.cpp       ← lectura de sensores
├── sensores.h
├── actuadores.cpp     ← control de motores, bombas, válvulas
├── actuadores.h
├── hmi_local.cpp      ← pantalla OLED y botones físicos
├── hmi_local.h
├── protocolo.cpp      ← formato y parsing de mensajes JSON
└── protocolo.h
```

### Ejemplo de relación entre archivos
```cpp
// sensores.h  → declara funciones
float leerTemperatura();
float leerHumedad();

// sensores.cpp → implementa funciones
#include "sensores.h"
float leerTemperatura() { ... }

// actuadores.cpp → puede usar sensores
#include "actuadores.h"
#include "sensores.h"
void controlBomba() {
    if (leerNivelAgua() < 20.0) activarBomba();
}

// main.cpp → solo orquesta
#include "sensores.h"
#include "actuadores.h"
#include "hmi_local.h"
void loop() {
    float t = leerTemperatura();
    controlBomba();
    mostrarPantalla(t);
}
```
