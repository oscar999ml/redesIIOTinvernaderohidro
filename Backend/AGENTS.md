# AGENTS.md - Backend SCADA | Invernadero Hidropónico IoT

## Rol del Backend en el Sistema

El backend es el **núcleo lógico del SCADA**. Es el intermediario entre el hardware
(ESP32 vía USB-Serial) y el frontend web. Gestiona comunicación en tiempo real,
persiste datos históricos, administra alarmas, personal, producción y expone
una API REST + WebSocket para el frontend.

Soporta **3 sedes** (1 central grande + 2 pequeñas remotas). Cada sede tiene su
propio backend local; el **Backend Central** los unifica y el frontend lo consume todo.

---

## Arquitectura Multi-Sede

```
[Sede 2 - Backend local :3002] ─── playit.gg/ngrok ──┐
[Sede 3 - Backend local :3003] ─── playit.gg/ngrok ──┤
                                                       ▼
[Sede Central - Backend :3001] ←── agrega las 3 sedes ┘
         |
    WebSocket + REST
         |
[Frontend Next.js :3000]
```

### Fase de prueba (sin hardware, sin internet)
Las 3 sedes corren en la misma PC con puertos distintos.
El modo `SIMULATE=true` genera datos falsos de N nodos por sede.
playit.gg expone el backend central al mundo cuando se necesite acceso externo.

---

## Base de Datos

**Motor actual: SQLite** (`better-sqlite3`)
- Sin servidor, archivo local, cero configuración
- Un archivo `.db` por sede: `data/sede_central.db`, `data/sede_2.db`, `data/sede_3.db`
- **Migración futura a PostgreSQL**: los modelos están escritos con Drizzle ORM,
  cambiar de SQLite a PostgreSQL es solo cambiar el adaptador en `db/database.js`
- NO usar features exclusivas de PostgreSQL hasta que se migre

---

## Módulos del Sistema (7 en total)

| # | Módulo | Fase | Estado |
|---|--------|------|--------|
| 1 | SCADA Core (serial + WebSocket + nodos) | 1 | Construyendo |
| 2 | Multi-sede (unificar 3 backends) | 1 | Construyendo |
| 3 | Auth y Roles (JWT, 3 roles) | 1 | Construyendo |
| 4 | Producción (lotes, ciclos, KPIs) | 2 | Pendiente |
| 5 | Personal (turnos, tareas, incidencias) | 2 | Pendiente |
| 6 | Analytics (gráficas, correlaciones, CSV/PDF) | 2 | Pendiente |
| 7 | Notificaciones (PWA push, Telegram, PDF diario) | 3 | Pendiente |

---

## Roles de Usuario

| Rol | Acceso |
|-----|--------|
| `admin` | Todo: KPIs, reportes, configuración, personal, todas las sedes |
| `supervisor` | Su sede: SCADA completo, tareas, incidencias, personal de su turno |
| `operario` | Su zona: ver sensores, confirmar tareas, reportar incidencias |

---

## Estructura de Carpetas

```
Backend/
├── AGENTS.md
├── skills.md
├── package.json
├── .env.example
├── data/                          ← Archivos SQLite (gitignore)
│   ├── sede_central.db
│   ├── sede_2.db
│   └── sede_3.db
└── src/
    ├── index.js                   ← Entry point
    ├── config/
    │   ├── env.js                 ← Variables de entorno parseadas
    │   └── constants.js           ← Constantes globales
    ├── db/
    │   ├── database.js            ← Conexión SQLite (better-sqlite3)
    │   ├── migrate.js             ← Crea tablas si no existen
    │   └── schema.sql             ← Definición completa del esquema
    ├── serial/
    │   ├── serialManager.js       ← Abre/cierra/reconecta puerto COM
    │   └── serialParser.js        ← Parsea JSON del ESP32
    ├── websocket/
    │   ├── wsServer.js            ← Inicializa Socket.io
    │   └── wsEmitter.js           ← Funciones emit centralizadas
    ├── api/
    │   ├── router.js              ← Registra todas las rutas
    │   ├── auth.routes.js         ← POST /login, POST /refresh
    │   ├── nodos.routes.js        ← CRUD nodos
    │   ├── lecturas.routes.js     ← Histórico de lecturas
    │   ├── alarmas.routes.js      ← Alarmas: listar, reconocer
    │   ├── comandos.routes.js     ← Enviar comandos a nodos
    │   ├── sedes.routes.js        ← Estado de todas las sedes
    │   ├── lotes.routes.js        ← Lotes de producción (Fase 2)
    │   ├── personal.routes.js     ← Turnos y tareas (Fase 2)
    │   └── reportes.routes.js     ← PDF y analytics (Fase 2)
    ├── middleware/
    │   ├── auth.middleware.js     ← Verifica JWT, inyecta req.user
    │   └── role.middleware.js     ← Verifica rol mínimo requerido
    ├── services/
    │   ├── alarmasService.js      ← Evalúa umbrales, dispara alarmas
    │   ├── nodosService.js        ← Lógica de nodos
    │   ├── authService.js         ← Login, generación de JWT
    │   ├── sedesService.js        ← Consulta backends remotos de sedes
    │   └── simulador.js           ← Genera datos falsos (modo dev)
    ├── models/
    │   ├── Nodo.js
    │   ├── Lectura.js
    │   ├── Alarma.js
    │   ├── Umbral.js
    │   ├── Usuario.js
    │   ├── Lote.js                ← Fase 2
    │   └── Tarea.js               ← Fase 2
    └── utils/
        ├── logger.js              ← Winston logger
        └── validators.js          ← Zod schemas
```

---

## Protocolo de Mensajes

### ESP32 → Backend (Serial, JSON + \n)
```json
{ "nodo_id": 1, "tipo": "estado",
  "datos": { "led": true, "temperatura": 24.5, "humedad": 65.2, "ph": 6.8 } }
```

### Backend → Frontend (WebSocket)
```json
{ "nodo_id": 1, "sede_id": "central", "timestamp": "2026-05-05T10:30:00Z",
  "datos": { "led": true, "temperatura": 24.5 } }
```

### Frontend → Backend (REST POST /api/comandos)
```json
{ "nodo_id": 1, "accion": "set_led", "valor": true }
```

---

## Variables de Entorno

```env
# Sede de este backend (central | sede2 | sede3)
SEDE_ID=central
SEDE_NOMBRE=Sede Central

# Serial
SERIAL_PORT=COM3
SERIAL_BAUD=115200

# Servidor
PORT=3001
HOST=localhost

# DB SQLite (futuro: cambiar a DB_URL para PostgreSQL)
DB_PATH=./data/sede_central.db

# Auth
JWT_SECRET=cambia_esto_en_produccion
JWT_EXPIRES_IN=8h

# URLs de sedes remotas (para el backend central)
SEDE2_URL=http://localhost:3002
SEDE3_URL=http://localhost:3003

# Desarrollo
NODE_ENV=development
SIMULATE=false
SIMULATE_NODOS=3
```
