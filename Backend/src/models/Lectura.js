// src/models/Lectura.js
import { getDb } from '../db/database.js';

export const LecturaModel = {
  insert({ nodo_id, led, boton, temperatura, humedad, ph, nivel_agua, humedad_suelo, temp_agua,
           co2, ec, luminosidad, presion_agua, temp_agua: tw, bomba_riego, ventilador,
           bomba_nutrientes, calefactor, iluminacion, valvula_agua }) {
    // Normalize booleans/numbers
    const b = (v) => v != null ? (v ? 1 : 0) : null;
    const n = (v) => v ?? null;
    getDb().prepare(`
      INSERT INTO lecturas (
        nodo_id,
        led, boton, bomba_riego, ventilador, bomba_nutrientes, calefactor, iluminacion, valvula_agua,
        temperatura, humedad, co2, luminosidad,
        ph, ec, temp_agua, nivel_agua, humedad_suelo, presion_agua
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      nodo_id,
      b(led), b(boton), b(bomba_riego), b(ventilador), b(bomba_nutrientes), b(calefactor), b(iluminacion), b(valvula_agua),
      n(temperatura), n(humedad), n(co2), n(luminosidad),
      n(ph), n(ec), n(temp_agua ?? tw), n(nivel_agua), n(humedad_suelo), n(presion_agua)
    );
  },

  findByNodo(nodo_id, limit = 200) {
    return getDb().prepare(`
      SELECT * FROM lecturas WHERE nodo_id = ?
      ORDER BY timestamp DESC LIMIT ?
    `).all(nodo_id, limit);
  },

  findByNodoRango(nodo_id, desde, hasta) {
    return getDb().prepare(`
      SELECT * FROM lecturas
      WHERE nodo_id = ? AND timestamp BETWEEN ? AND ?
      ORDER BY timestamp ASC
    `).all(nodo_id, desde, hasta);
  },

  ultimaPorNodo() {
    return getDb().prepare(`
      SELECT l.* FROM lecturas l
      INNER JOIN (
        SELECT nodo_id, MAX(timestamp) as ts FROM lecturas GROUP BY nodo_id
      ) latest ON l.nodo_id = latest.nodo_id AND l.timestamp = latest.ts
    `).all();
  },
};
