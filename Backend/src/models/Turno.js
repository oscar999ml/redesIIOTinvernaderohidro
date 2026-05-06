// src/models/Turno.js
import { getDb } from '../db/database.js';

export const Turno = {
  findAll() {
    return getDb().prepare(`
      SELECT t.*, u.nombre AS usuario_nombre, n.nombre AS nodo_nombre
      FROM turnos t
      LEFT JOIN usuarios u ON t.usuario_id = u.id
      LEFT JOIN nodos n ON t.nodo_id = n.id
      ORDER BY t.inicio DESC
    `).all();
  },

  findById(id) {
    return getDb().prepare(`
      SELECT t.*, u.nombre AS usuario_nombre, n.nombre AS nodo_nombre
      FROM turnos t
      LEFT JOIN usuarios u ON t.usuario_id = u.id
      LEFT JOIN nodos n ON t.nodo_id = n.id
      WHERE t.id = ?
    `).get(id);
  },

  findActivos() {
    return getDb().prepare(`
      SELECT t.*, u.nombre AS usuario_nombre
      FROM turnos t
      LEFT JOIN usuarios u ON t.usuario_id = u.id
      WHERE t.fin IS NULL
      ORDER BY t.inicio DESC
    `).all();
  },

  create({ usuario_id, nodo_id, inicio }) {
    const res = getDb().prepare(`
      INSERT INTO turnos (usuario_id, nodo_id, inicio)
      VALUES (?, ?, ?)
    `).run(usuario_id, nodo_id ?? null, inicio ?? new Date().toISOString());
    return this.findById(res.lastInsertRowid);
  },

  cerrar(id) {
    getDb().prepare(`UPDATE turnos SET fin = datetime('now') WHERE id = ?`).run(id);
    return this.findById(id);
  },

  delete(id) {
    return getDb().prepare('DELETE FROM turnos WHERE id = ?').run(id);
  },
};
