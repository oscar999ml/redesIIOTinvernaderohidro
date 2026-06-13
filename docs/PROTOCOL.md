# Protocolo Estandar SCADA-IoT v1

## 1. Filosofia

Cada dispositivo ESP que se conecta al SCADA se presenta declarando
que sensores y actuadores tiene. El SCADA se adapta automaticamente.

ESP32/8266 --TCP :4002--> SCADA Backend
  [Registro] Hola, soy Nodo 5, tengo...
  [Estado]   temp=25.3, humedad=68, bomba=true
  [Comando]  SCADA -> bomba_riego = false

## 2. Jerarquia

Sucursal / Planta: La Paz, Cochabamba, Santa Cruz
  +-- Invernadero / Zona: A, B, Tanques, Secador
      +-- Nodo (ESP): nodo_id=1 Control Principal
          +-- Sensores: temp, humedad, pH, nivel_agua
          +-- Actuadores: bomba, valvula, ventilador, led

## 3. Tipos de Mensaje

| tipo | Direccion | Frecuencia | Descripcion |
| registro | ESP -> SCADA | 1 vez al conectar | Declara identidad + capacidades |
| estado | ESP -> SCADA | Cada 1-5s | Reporte periodico |
| alarma | ESP -> SCADA | Cuando ocurre | Condicion anormal |
| comando | SCADA -> ESP | Cuando el usuario actua | Orden a un actuador |

## 4. Mensajes Detallados

### 4.1 Registro (ESP -> SCADA, 1 vez al conectar)

{
  "tipo": "registro",
  "nodo_id": 2,
  "version": "1.0",
  "sucursal": "La Paz",
  "invernadero": "A",
  "nombre": "Control Principal",
  "hardware": "ESP32",
  "stats": { "uptime": 3600, "wifi_signal": -65, "free_heap": 120000 },
  "sensores": {
    "temp": { "label": "Temperatura", "tipo": "gauge", "unidad": "C", "min": 0, "max": 50 },
    "humedad": { "label": "Humedad", "tipo": "gauge", "unidad": "%", "min": 0, "max": 100 }
  },
  "actuadores": {
    "bomba_riego": { "label": "Bomba de Riego", "tipo": "toggle" },
    "ventilador": { "label": "Ventilador", "tipo": "slider", "unidad": "%", "min": 0, "max": 100 },
    "modo": { "label": "Modo", "tipo": "selector", "opciones": ["Auto","Manual"] },
    "estado_sistema": { "label": "Estado", "tipo": "indicador" }
  }
}


### 4.2 Estado (ESP -> SCADA, cada 1-5s)

{
  "tipo": "estado",
  "nodo_id": 2,
  "datos": {
    "temp": 25.3,
    "humedad": 68.0,
    "bomba_riego": true,
    "ventilador": 45,
    "modo": "Auto",
    "estado_sistema": "ok"
  }
}

### 4.3 Comando (SCADA -> ESP)

{
  "tipo": "comando",
  "id_comando": "cmd-abc-123",
  "nodo_id": 2,
  "target": "bomba_riego",
  "valor": true
}

### 4.4 Comando Respuesta (ESP -> SCADA)

{
  "tipo": "comando_respuesta",
  "id_comando": "cmd-abc-123",
  "nodo_id": 2,
  "status": "ok"
}

### 4.5 Alarma (ESP -> SCADA)

{
  "tipo": "alarma",
  "nodo_id": 2,
  "severidad": "critica",
  "variable": "temp",
  "valor": 48.2,
  "umbral": 40.0,
  "mensaje": "Temperatura critica"
}

### 4.6 Evento (ESP -> SCADA)

{
  "tipo": "evento",
  "nodo_id": 2,
  "evento": "boton_emergencia",
  "valor": true,
  "mensaje": "Boton de emergencia presionado"
}


## 5. Tipos de Control (Visual en Dashboard)

| tipo | Visual | Ejemplo |
| gauge | Barra/circulo con valor | 25.3 C  ----+---- |
| toggle | Boton ON/OFF | [ON] [OFF] |
| slider | Barra deslizante | [---+----] 45% |
| number_input | Input numerico +/- | [-] 25 [+] C |
| selector | Grupo de botones modo | [Auto] [Manual] |
| indicador | Luz piloto multi-estado | OK Verde, FALLA Rojo |

### Estados del indicador

| valor | Color | Significado |
| ok | Verde | Funcionando normal |
| off | Gris | Apagado |
| falla | Rojo | Falla / Error |
| alarma | Amarillo | Alarma / Advertencia |
| mantenimiento | Azul | En mantenimiento |


## 6. Transporte

| Modo | Medio | Puerto | Formato |
| TCP directo | WiFi -> Internet | 4002 | JSON + \n |
| Serial (local) | USB | COM3 @ 115200 | JSON + \n |

Formato: UTF-8, delimitador \\n, max 4KB por mensaje

## 7. Dashboard - Organizacion

Niveles de navegacion:1. Sucursal (pestana superior): La Paz, Cochabamba...2. Invernadero (sub-pestana): A, B, Tanques...3. Nodo (card): cada ESP es una tarjeta tipo Netflix4. Sensor/Actuador (widget): control visual en la card

## 8. API Reference

| Endpoint | Metodo | Descripcion |
| /api/nodos | GET | Lista todos los nodos |
| /api/nodos/:id/capacidades | GET | Sensores y actuadores del nodo |
| /api/grupos | GET | Lista sucursales e invernaderos |
| /api/comandos | POST | Enviar comando a un nodo |
| /health | GET | Estado del backend |