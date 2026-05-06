// src/models/Invernadero.js
import { getDb } from '../db/database.js';

export const InvernaderoModel = {
  findAll() {
    const db = getDb();
    return db.prepare('SELECT * FROM invernaderos WHERE activo = 1 ORDER BY codigo').all();
  },

  findById(id) {
    const db = getDb();
    return db.prepare('SELECT * FROM invernaderos WHERE id = ? AND activo = 1').get(id);
  },

  findNodos(invernadero_id) {
    const db = getDb();
    return db.prepare('SELECT * FROM nodos WHERE invernadero_id = ? AND activo = 1').all(invernadero_id);
  },

  update(id, datos) {
    const db = getDb();
    const { nombre, descripcion, cultivo, area_m2 } = datos;
    return db.prepare(`
      UPDATE invernaderos SET nombre=?, descripcion=?, cultivo=?, area_m2=?
      WHERE id = ?
    `).run(nombre, descripcion, cultivo, area_m2, id);
  },
};
