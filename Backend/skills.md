# skills.md - Backend SCADA | Invernadero Hidropónico IoT

Conocimientos técnicos, patrones y referencias que debe dominar el agente de backend
para construir el sistema SCADA de forma robusta y escalable.

---

## 1. Stack Tecnológico

| Capa | Tecnología | Razón |
|------|-----------|-------|
| Runtime | **Node.js 20 LTS** | Non-blocking I/O ideal para Serial + WebSocket simultáneo |
| Framework HTTP | **Express 4** | Maduro, simple, amplio ecosistema |
| WebSocket | **Socket.io** | Reconexión automática, rooms por nodo, compatible con Next.js |
| Serial | **serialport** (npm) | Librería oficial para Node.js, soporta todos los OS |
| Base de datos | **SQLite + better-sqlite3** | Sin servidor, perfecto para Fase 1-2 |
| ORM | **Drizzle ORM** | Type-safe, liviano, soporte SQLite y PostgreSQL |
| Validación | **zod** | Validación de esquemas de mensajes JSON |
| Logger | **winston** | Niveles de log, archivo + consola |
| Variables de entorno | **dotenv** | Estándar de la industria |
| Testing | **vitest** | Rápido, compatible con ESM |

---

## 2. Comunicación Serial con ESP32

### Librería `serialport`
```js
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

const port = new SerialPort({ path: 'COM3', baudRate: 115200 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

parser.on('data', (line) => {
  const msg = JSON.parse(line);
  // { nodo_id: 1, tipo: 'estado', datos: { led: true, ... } }
});

// Enviar comando al ESP32
port.write(JSON.stringify({ nodo_id: 1, accion: 'set_led', valor: true }) + '\n');
```

### Reglas de la comunicación serial
- Cada mensaje termina en `\n` (newline) — es el delimitador
- El ESP32 envía JSON en una sola línea seguida de `\n`
- El backend responde con JSON en una sola línea seguida de `\n`
- Si el puerto se cierra, reintentar cada 5 segundos (reconexión automática)
- Nunca bloquear el event loop esperando respuesta serial

### Reconexión automática
```js
port.on('close', () => {
  logger.warn('Puerto serial cerrado. Reintentando en 5s...');
  setTimeout(() => abrirPuerto(), 5000);
});
```

---

## 3. API REST con Express

### Estructura de rutas
```
GET    /api/nodos              → listar todos los nodos
GET    /api/nodos/:id          → obtener un nodo
POST   /api/nodos              → registrar nuevo nodo
PUT    /api/nodos/:id          → actualizar configuración de nodo
DELETE /api/nodos/:id          → eliminar nodo

GET    /api/lecturas           → histórico (con ?nodo_id=1&desde=...&hasta=...)
GET    /api/lecturas/ultimo    → última lectura de cada nodo

GET    /api/alarmas            → listar alarmas activas/históricas
POST   /api/alarmas/:id/reconocer → marcar alarma como reconocida

POST   /api/comandos           → enviar comando a un nodo
```

### Patrón Controller → Service → Model
```js
// routes/nodos.routes.js
router.get('/', nodosController.listar);

// controllers/nodosController.js
export const listar = async (req, res) => {
  const nodos = await nodosService.obtenerTodos();
  res.json(nodos);
};

// services/nodosService.js
export const obtenerTodos = async () => {
  return NodoModel.findAll();
};

// models/Nodo.js
export const findAll = () => db.prepare('SELECT * FROM nodos').all();
```

---

## 4. WebSocket con Socket.io

### Inicialización
```js
import { Server } from 'socket.io';
const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] }
});
```

### Emisión de eventos al frontend
```js
// Cuando llega dato de un nodo desde serial
io.emit('nodo:estado', {
  nodo_id: 1,
  timestamp: new Date().toISOString(),
  datos: { led: true, temperatura: 24.5 }
});

// Alarma nueva
io.emit('alarma:nueva', { nodo_id: 1, variable: 'temperatura', valor: 38.5 });

// Estado del sistema
io.emit('sistema:serial', { conectado: true, puerto: 'COM3' });
```

### Rooms por nodo (para escalar)
```js
// Cliente se suscribe a un nodo específico
socket.on('suscribir:nodo', (nodo_id) => {
  socket.join(`nodo:${nodo_id}`);
});

// Emitir solo a suscriptores de ese nodo
io.to(`nodo:${nodo_id}`).emit('nodo:estado', datos);
```

---

## 5. Base de Datos — SQLite (única por ahora, migrable a PostgreSQL)

### Decisión de DB
- **Motor actual**: SQLite con `better-sqlite3`
- **Sin servidor**: archivo `.db` local, cero configuración, funciona en cualquier PC
- **Un archivo por sede**: `data/sede_central.db`, `data/sede_2.db`, `data/sede_3.db`
- **Migración futura**: los modelos usan SQL estándar compatible con PostgreSQL.
  Cuando se migre, solo se cambia el adaptador en `db/database.js`.
  No usar `AUTOINCREMENT` con semántica PostgreSQL ni tipos exclusivos de cada motor.
- **No usar** ORMs pesados ni features exclusivas de PG hasta migrar.

## 5b. Base de Datos (SQLite con better-sqlite3)

### Esquema de tablas
```sql
-- Nodos registrados en el sistema
CREATE TABLE nodos (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  ubicacion TEXT,
  tipo TEXT DEFAULT 'esp8266',
  activo INTEGER DEFAULT 1,
  creado_en TEXT DEFAULT (datetime('now'))
);

-- Lecturas de sensores (serie de tiempo)
CREATE TABLE lecturas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nodo_id INTEGER NOT NULL,
  timestamp TEXT DEFAULT (datetime('now')),
  led INTEGER,
  boton INTEGER,
  temperatura REAL,
  humedad REAL,
  ph REAL,
  nivel_agua REAL,
  humedad_suelo REAL,
  FOREIGN KEY (nodo_id) REFERENCES nodos(id)
);

-- Alarmas
CREATE TABLE alarmas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nodo_id INTEGER NOT NULL,
  variable TEXT NOT NULL,
  valor REAL NOT NULL,
  umbral REAL NOT NULL,
  tipo TEXT CHECK(tipo IN ('max','min')),
  activa INTEGER DEFAULT 1,
  reconocida INTEGER DEFAULT 0,
  timestamp TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (nodo_id) REFERENCES nodos(id)
);

-- Configuración de umbrales por nodo y variable
CREATE TABLE umbrales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nodo_id INTEGER NOT NULL,
  variable TEXT NOT NULL,
  umbral_max REAL,
  umbral_min REAL,
  UNIQUE(nodo_id, variable),
  FOREIGN KEY (nodo_id) REFERENCES nodos(id)
);
```

### Consultas comunes
```js
// Últimas 100 lecturas de un nodo
db.prepare(`
  SELECT * FROM lecturas
  WHERE nodo_id = ?
  ORDER BY timestamp DESC
  LIMIT 100
`).all(nodo_id);

// Alarmas activas
db.prepare(`
  SELECT a.*, n.nombre as nodo_nombre
  FROM alarmas a
  JOIN nodos n ON n.id = a.nodo_id
  WHERE a.activa = 1
  ORDER BY a.timestamp DESC
`).all();
```

---

## 6. Motor de Alarmas

### Lógica de evaluación
```js
// services/alarmasService.js
export const evaluarLectura = async (nodo_id, datos) => {
  const umbrales = obtenerUmbrales(nodo_id); // desde DB
  for (const [variable, valor] of Object.entries(datos)) {
    const umbral = umbrales.find(u => u.variable === variable);
    if (!umbral) continue;
    if (umbral.umbral_max !== null && valor > umbral.umbral_max) {
      crearAlarma(nodo_id, variable, valor, umbral.umbral_max, 'max');
    }
    if (umbral.umbral_min !== null && valor < umbral.umbral_min) {
      crearAlarma(nodo_id, variable, valor, umbral.umbral_min, 'min');
    }
  }
};
```

---

## 7. Simulador de Nodos (Modo Desarrollo)

Cuando `SIMULATE=true`, no se abre el puerto serial.
En su lugar, un timer genera datos falsos de N nodos:

```js
// services/simulador.js
export const iniciarSimulador = (io, nodos = 3) => {
  setInterval(() => {
    for (let i = 1; i <= nodos; i++) {
      const datos = {
        nodo_id: i,
        tipo: 'estado',
        datos: {
          led: Math.random() > 0.5,
          temperatura: 20 + Math.random() * 15,
          humedad: 50 + Math.random() * 40,
          ph: 5.5 + Math.random() * 2,
          nivel_agua: Math.random() * 100
        }
      };
      procesarMensaje(datos, io);
    }
  }, 2000);
};
```

---

## 8. Reglas de Seguridad y Calidad

- **Nunca** exponer el puerto serial directamente al frontend (solo backend lo maneja)
- Validar **toda** entrada con `zod` antes de procesarla
- Sanitizar datos del ESP32: si el JSON es inválido, loggear y descartar
- Los errores de la API deben devolver un formato consistente:
  ```json
  { "error": true, "mensaje": "Descripción del error", "codigo": 400 }
  ```
- Usar `try/catch` en todas las funciones async
- Logs con nivel: `debug` (desarrollo), `info` (producción), `error` (siempre)

---

## 9. Scripts de package.json

```json
{
  "scripts": {
    "dev": "node --watch src/index.js",
    "dev:sim": "SIMULATE=true node --watch src/index.js",
    "start": "node src/index.js",
    "test": "vitest",
    "lint": "eslint src/"
  }
}
```

---

## 10. Dependencias

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "socket.io": "^4.7.0",
    "serialport": "^12.0.0",
    "@serialport/parser-readline": "^12.0.0",
    "better-sqlite3": "^9.0.0",
    "zod": "^3.22.0",
    "winston": "^3.11.0",
    "dotenv": "^16.3.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "eslint": "^8.0.0"
  }
}
```
