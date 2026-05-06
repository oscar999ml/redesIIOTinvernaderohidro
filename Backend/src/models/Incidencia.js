// src/models/Incidencia.js
import { getDb } from '../db/database.js';

export const Incidencia = {
  findAll({ estado, invernadero_id } = {}) {
    let q = `
      SELECT inc.*, i.nombre AS invernadero_nombre, u.nombre AS usuario_nombre
      FROM incidencias inc
      LEFT JOIN invernaderos i ON inc.invernadero_id = i.id
      LEFT JOIN usuarios u ON inc.usuario_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (estado)         { q += ' AND inc.estado = ?';          params.push(estado); }
    if (invernadero_id) { q += ' AND inc.invernadero_id = ?';  params.push(invernadero_id); }
    q += ' ORDER BY inc.timestamp DESC';
    return getDb().prepare(q).all(...params);
  },

  findById(id) {
    return getDb().prepare(`
      SELECT inc.*, i.nombre AS invernadero_nombre, u.nombre AS usuario_nombre
      FROM incidencias inc
      LEFT JOIN invernaderos i ON inc.invernadero_id = i.id
      LEFT JOIN usuarios u ON inc.usuario_id = u.id
      WHERE inc.id = ?
    `).get(id);
  },

  create({ invernadero_id, nodo_id, usuario_id, descripcion }) {
    const res = getDb().prepare(`
      INSERT INTO incidencias (invernadero_id, nodo_id, usuario_id, descripcion)
      VALUES (?, ?, ?, ?)
    `).run(invernadero_id ?? null, nodo_id ?? null, usuario_id, descripcion);
    return this.findById(res.lastInsertRowid);
  },

  update(id, { estado }) {
    getDb().prepare('UPDATE incidencias SET estado = ? WHERE id = ?').run(estado, id);
    return this.findById(id);
  },

  delete(id) {
    return getDb().prepare('DELETE FROM incidencias WHERE id = ?').run(id);
  },
};
