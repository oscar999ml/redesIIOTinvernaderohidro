// src/models/Comando.js
import { getDb } from '../db/database.js';

export const ComandoModel = {
  insert({ nodo_id, usuario_id, accion, valor }) {
    return getDb().prepare(`
      INSERT INTO comandos (nodo_id, usuario_id, accion, valor)
      VALUES (?, ?, ?, ?)
    `).run(nodo_id, usuario_id ?? null, accion, valor !== undefined ? String(valor) : null);
  },
  findRecientes(limit = 50) {
    return getDb().prepare(`
      SELECT c.*, n.nombre as nodo_nombre, u.nombre as usuario_nombre
      FROM comandos c
      LEFT JOIN nodos n ON n.id = c.nodo_id
      LEFT JOIN usuarios u ON u.id = c.usuario_id
      ORDER BY c.timestamp DESC LIMIT ?
    `).all(limit);
  },
};
