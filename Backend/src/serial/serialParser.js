// src/serial/serialParser.js
import { MensajeSerialSchema, RegistroSchema } from '../utils/validators.js';
import { logger } from '../utils/logger.js';

export function parsearMensaje(linea) {
  if (!linea) return null;
  try {
    const json = JSON.parse(linea);
    if (json.tipo === 'registro') {
      const result = RegistroSchema.safeParse(json);
      if (!result.success) {
        logger.warn('Registro invalido'.linea);
        return null;
      }
      return result.data;
    }
    const result = MensajeSerialSchema.safeParse(json);
    if (!result.success) {
      logger.warn('Mensaje serial invalido:' + linea);
      return null;
    }
    return result.data;
  } catch {
    logger.warn('JSON invalido del serial:' + linea);
    return null;
  }
}
