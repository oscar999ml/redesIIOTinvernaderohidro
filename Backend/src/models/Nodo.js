import { getDb } from '../db/database.js';

export const NodoModel = {
  findAll() {
    return getDb().prepare('SELECT * FROM nodos WHERE activo = 1 ORDER BY id').all();
  },
  findById(id) {
    return getDb().prepare('SELECT * FROM nodos WHERE id = ?').get(id);
  },
  upsert({ id, nombre, ubicacion = '', tipo = 'esp8266', sede_id = 'central', sucursal = 'Central', invernadero = 'A', hardware = 'ESP32', version = '1.0' }) {
    getDb().prepare(`
      INSERT INTO nodos (id, nombre, ubicacion, tipo, sede_id, sucursal, invernadero, hardware, version)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET nombre=excluded.nombre,
        ubicacion=excluded.ubicacion, tipo=excluded.tipo,
        sucursal=excluded.sucursal, invernadero=excluded.invernadero,
        hardware=excluded.hardware, version=excluded.version
    `).run(id, nombre, ubicacion, tipo, sede_id, sucursal, invernadero, hardware, version);
  },
  deactivate(id) {
    getDb().prepare('UPDATE nodos SET activo = 0 WHERE id = ?').run(id);
  },
};
