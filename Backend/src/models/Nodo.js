// src/models/Nodo.js
import { getDb } from '../db/database.js';

export const NodoModel = {
  findAll() {
    return getDb().prepare('SELECT * FROM nodos WHERE activo = 1 ORDER BY id').all();
  },
  findById(id) {
    return getDb().prepare('SELECT * FROM nodos WHERE id = ?').get(id);
  },
  upsert({ id, nombre, ubicacion = '', tipo = 'esp8266', sede_id = 'central' }) {
    getDb().prepare(`
      INSERT INTO nodos (id, nombre, ubicacion, tipo, sede_id)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET nombre=excluded.nombre,
        ubicacion=excluded.ubicacion, tipo=excluded.tipo
    `).run(id, nombre, ubicacion, tipo, sede_id);
  },
  deactivate(id) {
    getDb().prepare('UPDATE nodos SET activo = 0 WHERE id = ?').run(id);
  },
};
