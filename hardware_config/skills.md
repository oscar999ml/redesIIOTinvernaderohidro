# Skills del Proyecto - Invernadero Hidropónico IoT

Conocimientos y habilidades técnicas organizadas por área para el desarrollo del sistema HMI/SCADA distribuido.

---

## 1. Firmware y Programación de Microcontroladores

### ESP32 - Centralizador Maestro
- Entorno de desarrollo: **PlatformIO + VS Code**
- Framework: **Arduino** (o ESP-IDF para funciones avanzadas)
- Comunicación USB-Serial con PC (siempre activa)
- Modo **WiFi Access Point (AP)**: levantar red interna propia
- Servidor TCP/UDP para recibir datos de los nodos
- Gestión de múltiples clientes simultáneos (ESP8266)
- Parser de mensajes JSON
- Gestión de alarmas y eventos globales
- Reenvío de datos al SCADA en PC

### ESP8266 - Nodos PLC
- Entorno de desarrollo: **PlatformIO + VS Code**
- Framework: **Arduino**
- Modo **WiFi Station**: conectarse al AP del ESP32
- Comunicación TCP/UDP con el maestro
- Lógica de control local autónoma (funciona sin maestro)
- Control de salidas digitales (LED, relés, motores)
- Lectura de entradas digitales (botones, sensores digitales)
- Lectura de sensores analógicos (temperatura, humedad, pH)
- Manejo de interrupciones para botones físicos
- Watchdog y reconexión automática

---

## 2. Redes y Comunicaciones

### Fase 1-2: WiFi (TCP/IP)
- Configuración de WiFi AP en ESP32 (SSID, contraseña, canal)
- Conexión de ESP8266 como cliente WiFi
- Protocolo de mensajes **JSON** sobre TCP
- Estructura de mensaje recomendada:
  ```json
  {
    "nodo_id": 1,
    "tipo": "estado",
    "datos": {
      "led": true,
      "boton": false,
      "temperatura": 24.5
    }
  }
  ```
- Manejo de reconexiones y timeouts
- Medición de latencia y estabilidad

### Fase 3-4: RS485 / Modbus RTU (Cable Físico)
- Módulos **MAX485** en cada nodo (ESP32 y ESP8266)
- Topología: **bus RS485** (todos en el mismo par trenzado)
- Velocidad: 9600 a 115200 baud (ajustable)
- Distancia: hasta 1200 metros
- Protocolo: **Modbus RTU** (estándar industrial)
- Terminación de bus con resistencia de 120Ω en extremos
- Protección EMI: cable de par trenzado apantallado (STP)
- Librería recomendada: `ModbusMaster` / `ArduinoModbus`

### Alternativa CAN Bus
- Módulos **MCP2515** con transceptor **TJA1050**
- Distancia: hasta 500 metros a 125kbps
- Alta velocidad: hasta 1Mbps a distancias cortas
- Librería recomendada: `mcp_can`

---

## 3. HMI / SCADA

### HMI Local por Nodo (ESP8266)
- Display **OLED 0.96" (SSD1306)** via I2C
- Librería: `Adafruit SSD1306` + `Adafruit GFX`
- Mostrar: estado de actuadores, lecturas de sensores, alarmas
- Botones físicos para navegación de menú
- Indicadores LED de estado (operando, alarma, sin conexión)

### SCADA Central (PC)
- Interfaz en PC conectada por USB al ESP32
- Opciones de software SCADA:
  - **Node-RED** (recomendado para prototipo rápido)
  - **Python + PySerial + Dashboard web**
  - **Ignition / WinCC** (producción industrial)
- Visualización en tiempo real de todos los nodos
- Control remoto de actuadores
- Registro de históricos y alarmas
- Comunicación con ESP32 via **Serial (USB)**

---

## 4. Control de Actuadores

### Motores DC
- Driver **L298N** (hasta 2A por canal)
- Driver **L293D** (cargas menores)
- Control de velocidad con PWM
- Control de dirección con señales IN1/IN2

### Bombas de Riego
- Control via **relé** (5V o 12V)
- Relé de estado sólido (SSR) para mayor vida útil
- Protección con diodo flyback

### Válvulas Solenoide
- Control via relé
- Tiempo de apertura/cierre controlado por software

### Iluminación
- Control de LEDs de cultivo via MOSFET o relé
- Dimmer con PWM para ajuste de intensidad

---

## 5. Sensores

| Sensor | Variable | Interfaz | Librería |
|--------|----------|----------|----------|
| DHT22 | Temperatura y Humedad | Digital 1-Wire | `DHT sensor library` |
| DS18B20 | Temperatura agua | 1-Wire | `OneWire` + `DallasTemperature` |
| pH analógico | pH del agua | Analógico (ADC) | Sin librería |
| HC-SR04 | Nivel de agua | Digital (echo) | `NewPing` |
| YL-83 | Humedad suelo | Analógico (ADC) | Sin librería |
| BMP280 | Presión / Temp | I2C | `Adafruit BMP280` |

---

## 6. Electrónica de Potencia

### Protecciones Eléctricas
- **Fusibles** en líneas de alimentación de potencia
- **Varistores (MOV)** contra picos de tensión
- **Optoacopladores** para aislar lógica de potencia (PC817)
- **Diodos flyback** en cargas inductivas (motores, relés)

### Alimentación
- Fuente 5V para lógica (ESP32, ESP8266, sensores)
- Fuente 12V/24V para actuadores (motores, bombas, válvulas)
- Separación de tierras: tierra lógica / tierra de potencia

### Relés y Contactores
- Módulos de relé de 5V con optoacoplador integrado
- Contactores para cargas de alta potencia (>10A)
- Montaje en riel DIN para organización en gabinete

---

## 7. Infraestructura de Red y Cableado

### Cableado Cat6
- Categoría 6 para red estructurada (hasta 10 Gbps a 55m, 1 Gbps a 100m)
- Cálculo de metraje por topología
- Conectores RJ45 Cat6 + crimpadora
- Patch panel para organización en gabinete

### Topologías de Red

| Topología | Ventajas | Desventajas | Uso recomendado |
|-----------|----------|-------------|-----------------|
| **Estrella** | Fácil diagnóstico, fallo aislado | Más cable, switch necesario | Oficinas, control centralizado |
| **Bus** | Menos cable, simple | Fallo afecta toda la red | RS485, distancias largas |
| **Árbol** | Escalable, jerárquico | Complejidad media | Instalaciones grandes |

### Switch Industrial
- Switch **gestionable** (managed) para redes industriales
- Puertos PoE si se necesita alimentar dispositivos por cable
- Rango de temperatura extendido (-40°C a 75°C)
- Montaje en riel DIN
- Marcas recomendadas: Cisco IE, Siemens SCALANCE, Phoenix Contact

### Gabinetes Eléctricos
- Gabinete metálico IP65 (protección polvo y agua)
- Riel DIN 35mm para montaje de módulos
- Canaletas para organización de cables
- Etiquetado de cables y bornes

---

## 8. Herramientas de Desarrollo

| Herramienta | Uso |
|-------------|-----|
| VS Code + PlatformIO | Desarrollo de firmware |
| Node-RED | Dashboard SCADA prototipo |
| Fritzing | Diagramas de conexión |
| KiCad | Diseño de PCB (fases avanzadas) |
| Git | Control de versiones del código |
| Serial Monitor | Depuración por puerto serial |
| Wireshark | Análisis de tráfico de red |
| Modbus Poll | Pruebas de protocolo Modbus |

---

## Estructura de Carpetas del Proyecto

```
hardware_config/
├── agents.md               ← Descripción de agentes y fases
├── skills.md               ← Este archivo
├── esp32_maestro/          ← Proyecto PlatformIO del ESP32
│   ├── src/
│   │   ├── main.cpp        ← solo setup() y loop()
│   │   ├── wifi_ap.cpp
│   │   ├── wifi_ap.h
│   │   ├── serial_scada.cpp
│   │   ├── serial_scada.h
│   │   ├── gestor_nodos.cpp
│   │   ├── gestor_nodos.h
│   │   ├── alarmas.cpp
│   │   └── alarmas.h
│   └── platformio.ini
├── esp8266_nodo_01/        ← Proyecto PlatformIO Nodo 1
│   ├── src/
│   │   ├── main.cpp        ← solo setup() y loop()
│   │   ├── wifi_cliente.cpp
│   │   ├── wifi_cliente.h
│   │   ├── sensores.cpp
│   │   ├── sensores.h
│   │   ├── actuadores.cpp
│   │   ├── actuadores.h
│   │   ├── hmi_local.cpp
│   │   ├── hmi_local.h
│   │   ├── protocolo.cpp
│   │   └── protocolo.h
│   └── platformio.ini
├── esp8266_nodo_02/        ← Proyecto PlatformIO Nodo 2
│   └── (misma estructura modular)
└── docs/                   ← Diagramas, planos, cálculos
    ├── diagramas/
    ├── calculos_cableado/
    └── topologias/
```

---

## 9. Reglas de Organización Modular del Código

- **NUNCA** hacer código monolítico en un solo `main.cpp`
- `main.cpp` solo contiene `setup()` y `loop()`
- Cada responsabilidad tiene su propio par `.cpp` + `.h`
- El `.h` declara (firmas de funciones, structs, constantes)
- El `.cpp` implementa (código real)
- Cualquier `.cpp` puede incluir el `.h` de otro módulo
- PlatformIO compila automáticamente todos los `.cpp` en `src/`
- Usar `#pragma once` en todos los `.h` para evitar inclusiones duplicadas
