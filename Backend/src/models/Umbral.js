// src/models/Umbral.js
import { getDb } from '../db/database.js';

export const UmbralModel = {
  findByNodo(nodo_id) {
    return getDb().prepare('SELECT * FROM umbrales WHERE nodo_id = ?').all(nodo_id);
  },
  upsert({ nodo_id, variable, umbral_max, umbral_min }) {
    getDb().prepare(`
      INSERT INTO umbrales (nodo_id, variable, umbral_max, umbral_min)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(nodo_id, variable) DO UPDATE SET
        umbral_max=excluded.umbral_max, umbral_min=excluded.umbral_min
    `).run(nodo_id, variable, umbral_max ?? null, umbral_min ?? null);
  },
};
