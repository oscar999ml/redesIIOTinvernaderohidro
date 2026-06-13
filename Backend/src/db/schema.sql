-- src/db/schema.sql
-- Esquema SQLite — compatible con PostgreSQL para migración futura
-- Usar solo tipos: INTEGER, REAL, TEXT, BLOB

-- Usuarios del sistema (admin, supervisor, operario)
CREATE TABLE IF NOT EXISTS usuarios (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario   TEXT    NOT NULL UNIQUE,
  password  TEXT    NOT NULL,
  nombre    TEXT    NOT NULL,
  rol       TEXT    NOT NULL CHECK(rol IN ('admin','supervisor','operario')),
  sede_id   TEXT    NOT NULL DEFAULT 'central',
  activo    INTEGER NOT NULL DEFAULT 1,
  creado_en TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Invernaderos físicos (A, B, C por sede)
CREATE TABLE IF NOT EXISTS invernaderos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo      TEXT    NOT NULL,          -- 'A', 'B', 'C'
  nombre      TEXT    NOT NULL,          -- 'Invernadero A'
  descripcion TEXT,
  cultivo     TEXT,                      -- cultivo actual
  area_m2     REAL,                      -- área en m²
  sede_id     TEXT    NOT NULL DEFAULT 'central',
  activo      INTEGER NOT NULL DEFAULT 1,
  creado_en   TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE(codigo, sede_id)
);

-- Nodos ESP8266 registrados (asociados a un invernadero)
CREATE TABLE IF NOT EXISTS nodos (
  id              INTEGER PRIMARY KEY,
  nombre          TEXT    NOT NULL,
  ubicacion       TEXT,
  tipo            TEXT    NOT NULL DEFAULT 'esp8266',
  sede_id         TEXT    NOT NULL DEFAULT 'central',
  invernadero_id  INTEGER,
  activo          INTEGER NOT NULL DEFAULT 1,
  creado_en       TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (invernadero_id) REFERENCES invernaderos(id)
);

-- Lecturas de sensores (serie de tiempo — todos los sensores posibles)
CREATE TABLE IF NOT EXISTS lecturas (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  nodo_id          INTEGER NOT NULL,
  timestamp        TEXT    NOT NULL DEFAULT (datetime('now')),
  -- Sensores ambientales
  temperatura      REAL,    -- °C aire
  humedad          REAL,    -- % humedad relativa
  co2              REAL,    -- ppm CO2
  luminosidad      REAL,    -- lux
  -- Sensores solución/agua
  ph               REAL,    -- pH 0-14
  ec               REAL,    -- mS/cm conductividad eléctrica
  temp_agua        REAL,    -- °C temperatura agua
  nivel_agua       REAL,    -- % nivel depósito
  humedad_suelo    REAL,    -- % humedad sustrato
  presion_agua     REAL,    -- bar presión sistema riego
  -- Estado actuadores
  led              INTEGER, -- 0/1
  bomba_riego      INTEGER, -- 0/1
  ventilador       INTEGER, -- 0/1
  bomba_nutrientes INTEGER, -- 0/1
  calefactor       INTEGER, -- 0/1
  iluminacion      INTEGER, -- 0/1
  valvula_agua     INTEGER, -- 0/1
  boton            INTEGER, -- 0/1
  FOREIGN KEY (nodo_id) REFERENCES nodos(id)
);

-- Índice para consultas históricas rápidas
CREATE INDEX IF NOT EXISTS idx_lecturas_nodo_ts ON lecturas(nodo_id, timestamp);

-- Alarmas disparadas
CREATE TABLE IF NOT EXISTS alarmas (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nodo_id     INTEGER NOT NULL,
  variable    TEXT    NOT NULL,
  valor       REAL    NOT NULL,
  umbral      REAL    NOT NULL,
  tipo        TEXT    NOT NULL CHECK(tipo IN ('max','min')),
  activa      INTEGER NOT NULL DEFAULT 1,
  reconocida  INTEGER NOT NULL DEFAULT 0,
  timestamp   TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (nodo_id) REFERENCES nodos(id)
);

-- Umbrales de alarma configurables por nodo y variable
CREATE TABLE IF NOT EXISTS umbrales (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nodo_id     INTEGER NOT NULL,
  variable    TEXT    NOT NULL,
  umbral_max  REAL,
  umbral_min  REAL,
  UNIQUE(nodo_id, variable),
  FOREIGN KEY (nodo_id) REFERENCES nodos(id)
);

-- Comandos enviados a nodos (auditoría)
CREATE TABLE IF NOT EXISTS comandos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nodo_id     INTEGER NOT NULL,
  usuario_id  INTEGER,
  accion      TEXT    NOT NULL,
  valor       TEXT,
  timestamp   TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (nodo_id) REFERENCES nodos(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Lotes de producción (Fase 2)
CREATE TABLE IF NOT EXISTS lotes (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo          TEXT    NOT NULL UNIQUE,
  cultivo         TEXT    NOT NULL,
  invernadero_id  INTEGER,
  nodo_id         INTEGER NOT NULL,
  fecha_inicio    TEXT    NOT NULL DEFAULT (date('now')),
  fecha_cosecha   TEXT,
  kg_cosechados   REAL,
  estado          TEXT    NOT NULL DEFAULT 'activo' CHECK(estado IN ('activo','cosechado','perdido')),
  notas           TEXT,
  FOREIGN KEY (invernadero_id) REFERENCES invernaderos(id),
  FOREIGN KEY (nodo_id) REFERENCES nodos(id)
);

-- Turnos de personal (Fase 2)
CREATE TABLE IF NOT EXISTS turnos (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id   INTEGER NOT NULL,
  nodo_id      INTEGER,
  inicio       TEXT    NOT NULL,
  fin          TEXT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (nodo_id) REFERENCES nodos(id)
);

-- Tareas asignadas (Fase 2)
CREATE TABLE IF NOT EXISTS tareas (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo        TEXT    NOT NULL,
  descripcion   TEXT,
  invernadero_id INTEGER,
  nodo_id       INTEGER,
  asignado_a    INTEGER,
  estado        TEXT    NOT NULL DEFAULT 'pendiente' CHECK(estado IN ('pendiente','en_curso','completada','cancelada')),
  prioridad     TEXT    NOT NULL DEFAULT 'normal' CHECK(prioridad IN ('baja','normal','alta','critica')),
  creado_en     TEXT    NOT NULL DEFAULT (datetime('now')),
  completado_en TEXT,
  FOREIGN KEY (invernadero_id) REFERENCES invernaderos(id),
  FOREIGN KEY (nodo_id) REFERENCES nodos(id),
  FOREIGN KEY (asignado_a) REFERENCES usuarios(id)
);

-- Incidencias reportadas por operarios (Fase 2)
CREATE TABLE IF NOT EXISTS incidencias (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  invernadero_id  INTEGER,
  nodo_id         INTEGER,
  usuario_id      INTEGER NOT NULL,
  descripcion     TEXT    NOT NULL,
  estado          TEXT    NOT NULL DEFAULT 'abierta' CHECK(estado IN ('abierta','en_revision','resuelta')),
  timestamp       TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (invernadero_id) REFERENCES invernaderos(id),
  FOREIGN KEY (nodo_id) REFERENCES nodos(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);


# -- Nodo capacidades (auto-registry v2) --
# Guarda que Sensores y actuadores declarados por cada esp
z diccionario de variables y tipos de control

CREATE TABLE IF NOT EXISTS nodo_sensores (
  nodo_id    INTEGER NOT NULL,
  sensor_id  TEXT NOT NULL,  -- ej: temp, humedad, ph
  label      TEXT NOT NULL,  -- ej: Temperatura
  tipo       TEXT NOT NULL,  -- gauge, toggle, slider
  unidad     TEXT,
  config     TEXT,
  PRIMARY KEY (nodo_id, sensor_id),
  FOREIGN KEY (nodo_id) REFERENCES nodos(id)
);


CREATE TABLE IF NOT EXISTS nodo_actuadores (
  nodo_id     INTEGER NOT NULL,
  actuador_id TEXT NOT NULL,
  label       TEXT NOT NULL,
  tipo       TEXT NOT NULL,
  unidad     TEXT,
  config      TEXT,
  PRIMARY KEY (nodo_id, actuador_id),
  FOREIGN KEY (nodo_id) REFERENCES nodos(id)
);
