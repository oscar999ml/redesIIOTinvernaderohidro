// src/models/Tarea.js
import { getDb } from '../db/database.js';

export const Tarea = {
  findAll({ estado, asignado_a, invernadero_id } = {}) {
    let q = `
      SELECT t.*, i.nombre AS invernadero_nombre, u.nombre AS asignado_nombre
      FROM tareas t
      LEFT JOIN invernaderos i ON t.invernadero_id = i.id
      LEFT JOIN usuarios u ON t.asignado_a = u.id
      WHERE 1=1
    `;
    const params = [];
    if (estado)        { q += ' AND t.estado = ?';          params.push(estado); }
    if (asignado_a)    { q += ' AND t.asignado_a = ?';      params.push(asignado_a); }
    if (invernadero_id){ q += ' AND t.invernadero_id = ?';  params.push(invernadero_id); }
    q += ' ORDER BY t.creado_en DESC';
    return getDb().prepare(q).all(...params);
  },

  findById(id) {
    return getDb().prepare(`
      SELECT t.*, i.nombre AS invernadero_nombre, u.nombre AS asignado_nombre
      FROM tareas t
      LEFT JOIN invernaderos i ON t.invernadero_id = i.id
      LEFT JOIN usuarios u ON t.asignado_a = u.id
      WHERE t.id = ?
    `).get(id);
  },

  create({ titulo, descripcion, invernadero_id, nodo_id, asignado_a, prioridad }) {
    const res = getDb().prepare(`
      INSERT INTO tareas (titulo, descripcion, invernadero_id, nodo_id, asignado_a, prioridad)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(titulo, descripcion ?? null, invernadero_id ?? null, nodo_id ?? null, asignado_a ?? null, prioridad ?? 'normal');
    return this.findById(res.lastInsertRowid);
  },

  update(id, fields) {
    const allowed = ['titulo', 'descripcion', 'estado', 'prioridad', 'asignado_a', 'completado_en'];
    const sets = allowed.filter(k => fields[k] !== undefined).map(k => `${k} = ?`).join(', ');
    if (!sets) return this.findById(id);
    const vals = allowed.filter(k => fields[k] !== undefined).map(k => fields[k]);
    getDb().prepare(`UPDATE tareas SET ${sets} WHERE id = ?`).run(...vals, id);
    return this.findById(id);
  },

  delete(id) {
    return getDb().prepare('DELETE FROM tareas WHERE id = ?').run(id);
  },
};
