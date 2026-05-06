// src/db/seed.js — Datos iniciales para desarrollo
import { getDb, migrate } from './database.js';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger.js';

migrate();
const db = getDb();

// ── Usuarios ──────────────────────────────────────────────────
const usuarios = [
  { usuario: 'admin',      password: 'admin123',  nombre: 'Administrador',    rol: 'admin',      sede_id: 'central' },
  { usuario: 'supervisor', password: 'super123',  nombre: 'Supervisor Alpha', rol: 'supervisor', sede_id: 'central' },
  { usuario: 'operario1',  password: 'op123',     nombre: 'Operario Juan',    rol: 'operario',   sede_id: 'central' },
];

const stmtUsuario = db.prepare(`
  INSERT OR IGNORE INTO usuarios (usuario, password, nombre, rol, sede_id)
  VALUES (?, ?, ?, ?, ?)
`);
for (const u of usuarios) {
  stmtUsuario.run(u.usuario, bcrypt.hashSync(u.password, 10), u.nombre, u.rol, u.sede_id);
}
logger.info('Usuarios creados: admin/admin123 | supervisor/super123 | operario1/op123');

// ── Invernaderos A, B, C ──────────────────────────────────────
const invernaderos = [
  { id: 1, codigo: 'A', nombre: 'Invernadero A', descripcion: 'Nave principal de producción',     cultivo: 'Lechuga hidropónica', area_m2: 200, sede_id: 'central' },
  { id: 2, codigo: 'B', nombre: 'Invernadero B', descripcion: 'Nave secundaria',                  cultivo: 'Tomate cherry',       area_m2: 150, sede_id: 'central' },
  { id: 3, codigo: 'C', nombre: 'Invernadero C', descripcion: 'Sala hidropónica de germinación',  cultivo: 'Albahaca y hierbas',  area_m2: 80,  sede_id: 'central' },
];

const stmtInv = db.prepare(`
  INSERT OR IGNORE INTO invernaderos (id, codigo, nombre, descripcion, cultivo, area_m2, sede_id)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);
for (const inv of invernaderos) {
  stmtInv.run(inv.id, inv.codigo, inv.nombre, inv.descripcion, inv.cultivo, inv.area_m2, inv.sede_id);
}
logger.info('Invernaderos creados: A, B, C');

// ── Nodos ESP8266 (uno por invernadero) ───────────────────────
const nodos = [
  { id: 1, nombre: 'Nodo A-1',  ubicacion: 'Zona norte — Invernadero A', tipo: 'esp8266', sede_id: 'central', invernadero_id: 1 },
  { id: 2, nombre: 'Nodo B-1',  ubicacion: 'Zona sur — Invernadero B',   tipo: 'esp8266', sede_id: 'central', invernadero_id: 2 },
  { id: 3, nombre: 'Nodo C-1',  ubicacion: 'Sala central — Invernadero C', tipo: 'esp8266', sede_id: 'central', invernadero_id: 3 },
];

const stmtNodo = db.prepare(`
  INSERT OR IGNORE INTO nodos (id, nombre, ubicacion, tipo, sede_id, invernadero_id)
  VALUES (?, ?, ?, ?, ?, ?)
`);
for (const n of nodos) stmtNodo.run(n.id, n.nombre, n.ubicacion, n.tipo, n.sede_id, n.invernadero_id);
logger.info('Nodos creados: Nodo A-1, Nodo B-1, Nodo C-1');

// ── Umbrales por defecto (todos los sensores) ─────────────────
const umbrales = [
  // nodo_id, variable,         max,   min
  [1, 'temperatura',             35,    10  ],
  [1, 'humedad',                 90,    30  ],
  [1, 'co2',                   1500,   400  ],
  [1, 'luminosidad',           80000,  null ],
  [1, 'ph',                      7.5,   5.5 ],
  [1, 'ec',                      3.5,   0.5 ],
  [1, 'nivel_agua',             null,   20  ],
  [1, 'presion_agua',            4.0,   0.5 ],
  [2, 'temperatura',             35,    10  ],
  [2, 'humedad',                 90,    30  ],
  [2, 'co2',                   1500,   400  ],
  [2, 'ph',                      7.5,   5.5 ],
  [2, 'ec',                      3.5,   0.5 ],
  [2, 'nivel_agua',             null,   20  ],
  [3, 'temperatura',             32,    15  ],
  [3, 'ph',                      7.0,   5.8 ],
  [3, 'ec',                      2.5,   0.8 ],
  [3, 'co2',                   1200,   400  ],
  [3, 'nivel_agua',             null,   25  ],
];

const stmtUmbral = db.prepare(`
  INSERT OR IGNORE INTO umbrales (nodo_id, variable, umbral_max, umbral_min)
  VALUES (?, ?, ?, ?)
`);
for (const [nodo_id, variable, max, min] of umbrales) {
  stmtUmbral.run(nodo_id, variable, max ?? null, min ?? null);
}
logger.info('Umbrales creados para todos los sensores');

// ── Lotes de producción ───────────────────────────────────────
const lotes = [
  { codigo: 'LOTE-A-001', cultivo: 'Lechuga hidropónica', invernadero_id: 1, nodo_id: 1, fecha_inicio: '2026-03-01', estado: 'activo',    notas: 'Variedad Batavia. Ciclo 45 días.' },
  { codigo: 'LOTE-A-002', cultivo: 'Espinaca',            invernadero_id: 1, nodo_id: 1, fecha_inicio: '2026-01-10', estado: 'cosechado', fecha_cosecha: '2026-02-20', kg_cosechados: 38.5, notas: 'Cosecha exitosa.' },
  { codigo: 'LOTE-B-001', cultivo: 'Tomate cherry',       invernadero_id: 2, nodo_id: 2, fecha_inicio: '2026-02-15', estado: 'activo',    notas: 'Variedad Supersweet 100.' },
  { codigo: 'LOTE-C-001', cultivo: 'Albahaca',            invernadero_id: 3, nodo_id: 3, fecha_inicio: '2026-04-01', estado: 'activo',    notas: 'Germinación acelerada.' },
  { codigo: 'LOTE-C-000', cultivo: 'Cilantro',            invernadero_id: 3, nodo_id: 3, fecha_inicio: '2026-01-05', estado: 'perdido',   notas: 'Plagas de trips. Se perdió el 90%.' },
];

const stmtLote = db.prepare(`
  INSERT OR IGNORE INTO lotes (codigo, cultivo, invernadero_id, nodo_id, fecha_inicio, estado, fecha_cosecha, kg_cosechados, notas)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
for (const l of lotes) {
  stmtLote.run(l.codigo, l.cultivo, l.invernadero_id, l.nodo_id, l.fecha_inicio, l.estado, l.fecha_cosecha ?? null, l.kg_cosechados ?? null, l.notas ?? null);
}
logger.info('Lotes de producción creados');

// ── Tareas de ejemplo ─────────────────────────────────────────
const tareas = [
  { titulo: 'Revisar pH Invernadero A',   descripcion: 'Tomar muestra manual y calibrar sensor',       invernadero_id: 1, asignado_a: 3, prioridad: 'alta',   estado: 'pendiente' },
  { titulo: 'Limpieza bomba de riego B',  descripcion: 'Limpiar filtros y revisar presión',             invernadero_id: 2, asignado_a: 3, prioridad: 'normal', estado: 'en_curso'  },
  { titulo: 'Reposición de nutrientes A', descripcion: 'Agregar solución A+B al depósito principal',   invernadero_id: 1, asignado_a: 2, prioridad: 'alta',   estado: 'pendiente' },
  { titulo: 'Inspección plagas C',        descripcion: 'Revisión visual de hojas y tallos',             invernadero_id: 3, asignado_a: 3, prioridad: 'critica',estado: 'pendiente' },
  { titulo: 'Mantenimiento ventiladores', descripcion: 'Lubricar motores y verificar velocidad',       invernadero_id: null, asignado_a: 2, prioridad: 'baja', estado: 'completada', completado_en: '2026-04-28T14:00:00' },
];

const stmtTarea = db.prepare(`
  INSERT OR IGNORE INTO tareas (titulo, descripcion, invernadero_id, asignado_a, prioridad, estado, completado_en)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);
for (const t of tareas) {
  stmtTarea.run(t.titulo, t.descripcion, t.invernadero_id ?? null, t.asignado_a, t.prioridad, t.estado, t.completado_en ?? null);
}
logger.info('Tareas de ejemplo creadas');

// ── Turnos de ejemplo ─────────────────────────────────────────
const turnos = [
  { usuario_id: 3, nodo_id: 1, inicio: '2026-05-06T08:00:00', fin: null },
  { usuario_id: 2, nodo_id: 2, inicio: '2026-05-06T07:00:00', fin: null },
];

const stmtTurno = db.prepare(`
  INSERT OR IGNORE INTO turnos (usuario_id, nodo_id, inicio, fin)
  VALUES (?, ?, ?, ?)
`);
for (const t of turnos) {
  stmtTurno.run(t.usuario_id, t.nodo_id, t.inicio, t.fin ?? null);
}
logger.info('Turnos de ejemplo creados');

// ── Incidencias de ejemplo ────────────────────────────────────
const incidencias = [
  { invernadero_id: 3, nodo_id: 3, usuario_id: 3, descripcion: 'Se detectaron insectos blancos en hojas de albahaca. Posible mosca blanca.', estado: 'abierta' },
  { invernadero_id: 1, nodo_id: 1, usuario_id: 2, descripcion: 'Sensor de pH sin respuesta por 15 minutos. Se reinició el nodo.', estado: 'resuelta' },
];

const stmtInc = db.prepare(`
  INSERT OR IGNORE INTO incidencias (invernadero_id, nodo_id, usuario_id, descripcion, estado)
  VALUES (?, ?, ?, ?, ?)
`);
for (const i of incidencias) {
  stmtInc.run(i.invernadero_id, i.nodo_id, i.usuario_id, i.descripcion, i.estado);
}
logger.info('Incidencias de ejemplo creadas');

logger.info('Seed completado.');
