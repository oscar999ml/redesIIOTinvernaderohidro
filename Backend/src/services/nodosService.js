import { LecturaModel } from '../models/Lectura.js';
import { NodoModel } from '../models/Nodo.js';
import { evaluarAlarmas } from './alarmasService.js';
import { emit } from '../websocket/wsEmitter.js';
import { WS_EVENTS } from '../config/constants.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { getDb } from '../db/database.js';

export function procesarMensaje(msg) {
  const { nodo_id, datos } = msg;
  try { LecturaModel.insert({ nodo_id, ...datos }); } catch (err) { logger.error('Error guardando lectura ' + nodo_id + ': ' + err); }
  evaluarAlarmas(nodo_id, datos);
  emit(WS_EVENTS.NODO_ESTADO, { nodo_id, sede_id: env.SEDE_ID, timestamp: new Date().toISOString(), datos });
}

export function procesarRegistro(msg) {
  const db = getDb();
  const { nodo_id, nombre, sucursal, invernadero, hardware, version, stats, sensores, actuadores } = msg;

  NodoModel.upsert({ id: nodo_id, nombre, sucursal: sucursal || 'Central', invernadero: invernadero || 'A', hardware: hardware || 'ESP32', version: version || '1.0' });

  if (sensores) {
    const stmt = db.prepare('INSERT OR REPLACE INTO nodo_sensores (nodo_id, sensor_id, label, tipo, unidad, config) VALUES (?, ?, ?, ?, ?, ?)');
    for (const [key, value] of Object.entries(sensores)) {
      stmt.run(nodo_id, key, value.label, value.tipo, value.unidad || null, JSON.stringify({ min: value.min, max: value.max, opciones: value.opciones || [] }));
    }
  }

  if (actuadores) {
    const stmt = db.prepare('INSERT OR REPLACE INTO nodo_actuadores (nodo_id, actuador_id, label, tipo, unidad, config) VALUES (?, ?, ?, ?, ?, ?)');
    for (const [key, value] of Object.entries(actuadores)) {
      stmt.run(nodo_id, key, value.label, value.tipo, value.unidad || null, JSON.stringify({ min: value.min, max: value.max, opciones: value.opciones || [] }));
    }
  }

  if (stats) {
    db.exec('UPDATE nodos SET uptime = ?, wifi_signal = ? WHERE id = ?', stats.uptime || 0, stats.wifi_signal || 0, nodo_id);
  }

  logger.info('Nodo ' + nodo_id + ' registrado: ' + nombre);
  emit('nodo:registrado', { nodo_id, nombre, sucursal, invernadero });
}
