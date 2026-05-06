// src/serial/serialParser.js
import { MensajeSerialSchema } from '../utils/validators.js';
import { logger } from '../utils/logger.js';

/**
 * Parsea y valida una línea de texto JSON recibida del ESP32.
 * Retorna el objeto si es válido, null si no.
 */
export function parsearMensaje(linea) {
  if (!linea) return null;
  try {
    const json = JSON.parse(linea);
    const result = MensajeSerialSchema.safeParse(json);
    if (!result.success) {
      logger.warn(`Mensaje serial inválido: ${linea}`);
      return null;
    }
    return result.data;
  } catch {
    logger.warn(`JSON inválido del serial: ${linea}`);
    return null;
  }
}
