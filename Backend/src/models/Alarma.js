// src/models/Alarma.js
import { getDb } from '../db/database.js';

export const AlarmaModel = {
  insert({ nodo_id, variable, valor, umbral, tipo }) {
    return getDb().prepare(`
      INSERT INTO alarmas (nodo_id, variable, valor, umbral, tipo)
      VALUES (?, ?, ?, ?, ?)
    `).run(nodo_id, variable, valor, umbral, tipo);
  },

  findActivas(nodo_id) {
    const db = getDb();
    if (nodo_id != null) {
      return db.prepare(`
        SELECT a.*, n.nombre as nodo_nombre
        FROM alarmas a JOIN nodos n ON n.id = a.nodo_id
        WHERE a.activa = 1 AND a.nodo_id = ? ORDER BY a.timestamp DESC
      `).all(nodo_id);
    }
    return db.prepare(`
      SELECT a.*, n.nombre as nodo_nombre
      FROM alarmas a JOIN nodos n ON n.id = a.nodo_id
      WHERE a.activa = 1 ORDER BY a.timestamp DESC
    `).all();
  },

  findAll({ limit = 100, offset = 0 } = {}) {
    return getDb().prepare(`
      SELECT a.*, n.nombre as nodo_nombre
      FROM alarmas a JOIN nodos n ON n.id = a.nodo_id
      ORDER BY a.timestamp DESC LIMIT ? OFFSET ?
    `).all(limit, offset);
  },

  reconocer(id) {
    getDb().prepare('UPDATE alarmas SET reconocida = 1 WHERE id = ?').run(id);
  },

  resolver(id) {
    getDb().prepare('UPDATE alarmas SET activa = 0, reconocida = 1 WHERE id = ?').run(id);
  },

  existeActiva(nodo_id, variable, tipo) {
    return getDb().prepare(`
      SELECT id FROM alarmas WHERE nodo_id=? AND variable=? AND tipo=? AND activa=1
    `).get(nodo_id, variable, tipo);
  },
};
