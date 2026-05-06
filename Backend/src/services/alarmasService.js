// src/services/alarmasService.js
import { AlarmaModel } from '../models/Alarma.js';
import { UmbralModel } from '../models/Umbral.js';
import { emit } from '../websocket/wsEmitter.js';
import { WS_EVENTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

/**
 * Evalúa los datos de una lectura contra los umbrales configurados.
 * Si supera un umbral y no hay alarma activa del mismo tipo, la crea y emite el evento.
 */
export function evaluarAlarmas(nodo_id, datos) {
  const umbrales = UmbralModel.findByNodo(nodo_id);

  for (const umbral of umbrales) {
    const valor = datos[umbral.variable];
    if (valor === undefined || valor === null) continue;

    if (umbral.umbral_max !== null && valor > umbral.umbral_max) {
      _dispararAlarma(nodo_id, umbral.variable, valor, umbral.umbral_max, 'max');
    }
    if (umbral.umbral_min !== null && valor < umbral.umbral_min) {
      _dispararAlarma(nodo_id, umbral.variable, valor, umbral.umbral_min, 'min');
    }
  }
}

function _dispararAlarma(nodo_id, variable, valor, umbral, tipo) {
  // Evitar duplicar alarmas activas del mismo tipo
  if (AlarmaModel.existeActiva(nodo_id, variable, tipo)) return;

  const result = AlarmaModel.insert({ nodo_id, variable, valor, umbral, tipo });
  const alarma = {
    id: result.lastInsertRowid,
    nodo_id, variable, valor, umbral, tipo,
    timestamp: new Date().toISOString(),
  };

  logger.warn(`ALARMA [Nodo ${nodo_id}] ${variable}=${valor} supera ${tipo}=${umbral}`);
  emit(WS_EVENTS.ALARMA_NUEVA, alarma);
}
