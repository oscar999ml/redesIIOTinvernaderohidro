// src/models/Lote.js
import { getDb } from '../db/database.js';

export const Lote = {
  findAll() {
    return getDb().prepare(`
      SELECT l.*, i.nombre AS invernadero_nombre, n.nombre AS nodo_nombre
      FROM lotes l
      LEFT JOIN invernaderos i ON l.invernadero_id = i.id
      LEFT JOIN nodos n ON l.nodo_id = n.id
      ORDER BY l.fecha_inicio DESC
    `).all();
  },

  findById(id) {
    return getDb().prepare(`
      SELECT l.*, i.nombre AS invernadero_nombre, n.nombre AS nodo_nombre
      FROM lotes l
      LEFT JOIN invernaderos i ON l.invernadero_id = i.id
      LEFT JOIN nodos n ON l.nodo_id = n.id
      WHERE l.id = ?
    `).get(id);
  },

  findByInvernadero(invernadero_id) {
    return getDb().prepare(`
      SELECT l.*, i.nombre AS invernadero_nombre, n.nombre AS nodo_nombre
      FROM lotes l
      LEFT JOIN invernaderos i ON l.invernadero_id = i.id
      LEFT JOIN nodos n ON l.nodo_id = n.id
      WHERE l.invernadero_id = ?
      ORDER BY l.fecha_inicio DESC
    `).all(invernadero_id);
  },

  create({ codigo, cultivo, invernadero_id, nodo_id, fecha_inicio, fecha_cosecha, notas }) {
    const res = getDb().prepare(`
      INSERT INTO lotes (codigo, cultivo, invernadero_id, nodo_id, fecha_inicio, fecha_cosecha, notas)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(codigo, cultivo, invernadero_id ?? null, nodo_id, fecha_inicio ?? null, fecha_cosecha ?? null, notas ?? null);
    return this.findById(res.lastInsertRowid);
  },

  update(id, fields) {
    const allowed = ['cultivo', 'estado', 'fecha_cosecha', 'kg_cosechados', 'notas'];
    const sets = allowed.filter(k => fields[k] !== undefined).map(k => `${k} = ?`).join(', ');
    if (!sets) return this.findById(id);
    const vals = allowed.filter(k => fields[k] !== undefined).map(k => fields[k]);
    getDb().prepare(`UPDATE lotes SET ${sets} WHERE id = ?`).run(...vals, id);
    return this.findById(id);
  },

  delete(id) {
    return getDb().prepare('DELETE FROM lotes WHERE id = ?').run(id);
  },
};
