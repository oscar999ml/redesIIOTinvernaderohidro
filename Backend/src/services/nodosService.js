// src/services/nodosService.js
import { LecturaModel } from '../models/Lectura.js';
import { NodoModel } from '../models/Nodo.js';
import { evaluarAlarmas } from './alarmasService.js';
import { emit } from '../websocket/wsEmitter.js';
import { WS_EVENTS } from '../config/constants.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Procesa un mensaje JSON recibido del ESP32 (o del simulador).
 * Guarda la lectura, evalúa alarmas y emite al frontend.
 */
export function procesarMensaje(msg) {
  const { nodo_id, datos } = msg;

  // Guardar lectura en DB
  try {
    LecturaModel.insert({ nodo_id, ...datos });
  } catch (err) {
    logger.error(`Error guardando lectura nodo ${nodo_id}: ${err.message}`);
  }

  // Evaluar umbrales y disparar alarmas si corresponde
  evaluarAlarmas(nodo_id, datos);

  // Emitir estado al frontend en tiempo real
  emit(WS_EVENTS.NODO_ESTADO, {
    nodo_id,
    sede_id: env.SEDE_ID,
    timestamp: new Date().toISOString(),
    datos,
  });
}
