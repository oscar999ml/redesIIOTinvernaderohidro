# Documentación de Funcionamiento — LED Toggle ESP32 + SCADA

## 1. Arquitectura del Pipeline

### Conexión por WiFi + WebSocket (Actual)

```
[Usuario] → click en Frontend (Prueba Rápida)
    ↓ POST /api/comandos { nodo_id:1, accion:"set_led", valor:true }
[Backend Node.js] → recibe, guarda en SQLite
    ↓ WebSocket (/ws/nodos) 
[ESP32] → conectado a WiFi "perroLobo" → recibe por WebSocket, cambia GPIO12/GPIO2
    ↓ reporta nuevo estado por WebSocket
[Backend] → parsea JSON, actualiza DB, emite WebSocket (Socket.io)
    ↓ evento "nodo:estado"
[Frontend] → actualiza visualización del LED
```

### Conexión por Serial USB (Original — reemplazada)

```
[ESP32] ← → USB-Serial (COM3) ← → [Backend]
```

> El ESP32 ahora se conecta vía WiFi + WebSocket al backend.
> El puerto Serial (USB) solo se usa para debug y upload del firmware.

## 2. Componentes y su Rol

### ESP32 (Firmware)
Archivo: `hardware_config/Esp32PLC/src/main.cpp`
- Se conecta a WiFi SSID: `perroLobo` / password: `perroloba123`
- Se conecta vía WebSocket al backend en `ws://<IP_BACKEND>:4001/ws/nodos`
- Recibe comandos JSON: `{"nodo_id":1,"accion":"set_led","valor":true}`
- Controla GPIO12 y GPIO2 (LED)
- Botón GPIO0 (BOOT) hace toggle local del LED
- Reporta estado cada 2s: `{"nodo_id":1,"tipo":"estado","datos":{"led":true,"boton":false}}`
- Usa librería: `links2004/WebSockets`

### Backend Node.js
Archivos clave: `index.js`, `ws/wsNodosManager.js`, `serial/serialParser.js`, `api/comandos.routes.js`
- Escucha en puerto 4001
- **Dos servidores WebSocket en el mismo puerto:**
  - Socket.io (`/`) → Frontend web (eventos en tiempo real)
  - Raw WebSocket (`/ws/nodos`) → ESP32 (mensajes JSON)
- Cuando un comando llega por REST, intenta enviarlo por WebSocket al ESP32
- Si el ESP32 no está conectado por WiFi, cae a Serial (USB) como fallback
- Auth bypass: en `NODE_ENV=development`, cualquier request es admin

### Frontend Next.js
Archivo: `Frontend/src/app/prueba-rapida/page.tsx`
- `http://localhost:4000/prueba-rapida`
- WebSocket (Socket.io) para estado en tiempo real
- REST POST `/api/comandos` para enviar comandos

## 3. Cómo se Logró

### Fase 1: Serial USB (original)
- Firmware ESP32 escuchaba Serial, backend abría COM3
- Se eliminó porque el usuario pidió comunicación solo por WiFi

### Fase 2: WiFi + WebSocket (actual)
1. Se instaló `npm install ws` en el Backend
2. Se creó `Backend/src/ws/wsNodosManager.js`:
   - `WebSocketServer` en ruta `/ws/nodos` (mismo puerto HTTP)
   - Recibe conexiones de ESP32, identifica por `nodo_id`
   - Reusa `parsearMensaje()` + `procesarMensaje()` del pipeline Serial
   - Mantiene un Map de `nodo_id → WebSocket` para enviar comandos
3. Se modificó `comandos.routes.js`:
   - Intenta WebSocket primero, fallback a Serial si no hay conexión WiFi
4. Se reescribió el firmware ESP32:
   - Conexión WiFi a "perroLobo"
   - `WebSocketsClient` conecta al backend
   - Misma lógica GPIO, ahora sobre WebSocket en vez de Serial
5. Se actualizó `platformio.ini` con `links2004/WebSockets`

## 4. Flujo de Datos Detallado

### ESP32 → Backend (reporte de estado)
```
ESP32: webSocket.sendTXT('{"nodo_id":1,"tipo":"estado","datos":{"led":true,"boton":false}}')
  → Backend: ws.on('message') → parsearMensaje() → procesarMensaje()
    → guarda en SQLite + evalúa alarmas + Socket.io.emit('nodo:estado', ...)
      → Frontend recibe y actualiza UI
```

### Backend → ESP32 (comando)
```
Frontend: api.post('/comandos', { nodo_id:1, accion:'set_led', valor:true })
  → Backend: POST /api/comandos → valida → guarda en DB
    → enviarComandoWs({ nodo_id:1, accion:'set_led', valor:true })
      → ESP32 recibe → procesarComando() → cambia GPIO → envía estado actualizado
```

## 5. Problemas Resueltos

| Problema | Causa | Solución |
|---|---|---|
| 401 Unauthorized | Auth middleware pedía JWT en dev | Bypass completo si `NODE_ENV=development` |
| Backend no arranca en hardware | `npm run dev` corre en modo simulación | Usar `npm run start` (o `node src/index.js` directo) |
| DB corrupta / schema viejo | Seed con schema desactualizado | Borrar `.db` y regenerar con nueva migración |
| Dos backends en mismo puerto | `npm run dev` + `Start-Process` compiten | `taskkill /F /T /PID` |
| ESP32 no responde | COM3 ocupado al hacer upload | Detener backend antes de subir firmware |
| Hydration mismatch React | Extensión Console Ninja | Solo warning visual, no afecta funcionalidad |
| ESP32 necesita IP del backend | La PC tiene IP dinámica por DHCP | Configurar `WS_HOST` en `main.cpp` con la IP del PC en la red "perroLobo" |

## 6. Cómo Reproducir

```bash
# 0. Asegurar que tanto PC como ESP32 estén en la red "perroLobo"
#    En PC: Conectarse a WiFi "perroLobo" (password: perroloba123)
#    Sacar IP del PC: en cmd → ipconfig → IPv4 (ej: 192.168.1.100)

# 1. Configurar WS_HOST en el firmware
#    Editar hardware_config/Esp32PLC/src/main.cpp
#    Cambiar: const char* WS_HOST = "192.168.1.100";  # ← IP de tu PC

# 2. Subir firmware al ESP32
cd hardware_config/Esp32PLC
pio run --target upload

# 3. Iniciar backend
cd Backend
node --experimental-sqlite src/index.js
# Debe mostrar: "Modo: HARDWARE" y "WebSocket para ESP32 iniciado en /ws/nodos"

# 4. Iniciar frontend (otra terminal)
cd Frontend
npm run dev

# 5. Abrir navegador
http://localhost:4000/prueba-rapida

# 6. Click en el foco para toggle LED
#    El ESP32 debe estar conectado a "perroLobo" y encendido
```

## 7. Archivos Clave

| Archivo | Propósito |
|---|---|
| `hardware_config/Esp32PLC/src/main.cpp` | Firmware ESP32 (WiFi + WebSocket) |
| `hardware_config/Esp32PLC/platformio.ini` | Config PlatformIO con lib WebSockets |
| `Backend/.env` | Config: SIMULATE=false, SERIAL_PORT=COM3 |
| `Backend/src/index.js` | Entry point backend |
| `Backend/src/ws/wsNodosManager.js` | Servidor WebSocket para ESP32 |
| `Backend/src/serial/serialParser.js` | Parseo JSON (reusado por WS y Serial) |
| `Backend/src/api/comandos.routes.js` | API de comandos (WS + Serial fallback) |
| `Backend/src/middleware/auth.middleware.js` | Auth bypass en desarrollo |
| `Backend/src/websocket/wsEmitter.js` | Emisión Socket.io al frontend |
| `Backend/src/services/nodosService.js` | Procesamiento de mensajes |
| `Frontend/src/app/prueba-rapida/page.tsx` | Página de prueba rápida |
| `Frontend/src/store/nodosStore.js` | Estado global de nodos (Zustand) |
| `PROTOCOLO_COMUNICACION.md` | Contrato JSON firmware ↔ backend |

## 8. Comandos Útiles

```bash
# Health check del backend
curl http://localhost:4001/health
# → {"simulate":false} significa HARDWARE

# Enviar comando manual
curl -X POST http://localhost:4001/api/comandos ^
  -H "Content-Type: application/json" ^
  -d '{"nodo_id":1,"accion":"set_led","valor":true}'

# Ver lecturas del ESP32 en DB
node --experimental-sqlite -e "
import { getDb } from './src/db/database.js';
const rows = getDb().prepare('SELECT id, timestamp, led, boton FROM lecturas WHERE nodo_id = 1 ORDER BY id DESC LIMIT 5').all();
console.log(JSON.stringify(rows, null, 2));
"

# Saber IP de tu PC (para WS_HOST en firmware)
ipconfig
# Buscar "Dirección IPv4" en tu adaptador WiFi

# Matar backends conflictivos
taskkill /F /T /PID <PID_del_npm_run_dev>
```

## 9. Variables de Entorno (Backend/.env)

```env
SIMULATE=false          # false = modo HARDWARE
SERIAL_PORT=COM3        # Solo para debug/upload, no para comunicación
SERIAL_BAUD=115200
NODE_ENV=development    # development = auth bypass
PORT=4001               # Puerto del backend
```

## 10. Configurar IP del Backend en el Firmware

El ESP32 necesita saber la IP de la PC en la red "perroLobo":

```cpp
// En hardware_config/Esp32PLC/src/main.cpp
const char* WS_HOST = "192.168.1.100";  // ← Cambiar por la IP de tu PC
```

Para encontrar la IP:
1. Conéctate a WiFi "perroLobo"
2. Abre cmd.exe
3. Ejecuta `ipconfig`
4. Busca la línea "Dirección IPv4" en el adaptador WiFi
5. Copia esa IP en `WS_HOST`
