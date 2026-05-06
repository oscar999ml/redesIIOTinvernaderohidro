// src/serial/serialManager.js
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { emit } from '../websocket/wsEmitter.js';
import { WS_EVENTS } from '../config/constants.js';
import { parsearMensaje } from './serialParser.js';
import { procesarMensaje } from '../services/nodosService.js';

let _port = null;

export function abrirPuerto() {
  try {
    _port = new SerialPort({
      path: env.SERIAL_PORT,
      baudRate: env.SERIAL_BAUD,
      autoOpen: false,
    });

    const parser = _port.pipe(new ReadlineParser({ delimiter: '\n' }));

    _port.open((err) => {
      if (err) {
        logger.error(`No se pudo abrir ${env.SERIAL_PORT}: ${err.message}`);
        emit(WS_EVENTS.SISTEMA_SERIAL, { conectado: false, puerto: env.SERIAL_PORT, error: err.message });
        setTimeout(abrirPuerto, 5000);
        return;
      }
      logger.info(`Puerto serial abierto: ${env.SERIAL_PORT} @ ${env.SERIAL_BAUD}`);
      emit(WS_EVENTS.SISTEMA_SERIAL, { conectado: true, puerto: env.SERIAL_PORT });
    });

    parser.on('data', (linea) => {
      const msg = parsearMensaje(linea.trim());
      if (msg) procesarMensaje(msg);
    });

    _port.on('close', () => {
      logger.warn(`Puerto serial cerrado. Reintentando en 5s...`);
      emit(WS_EVENTS.SISTEMA_SERIAL, { conectado: false, puerto: env.SERIAL_PORT });
      setTimeout(abrirPuerto, 5000);
    });

    _port.on('error', (err) => {
      logger.error(`Error serial: ${err.message}`);
    });

  } catch (err) {
    logger.error(`Error iniciando serial: ${err.message}`);
    setTimeout(abrirPuerto, 5000);
  }
}

/**
 * Envía un comando JSON al ESP32 vía Serial.
 */
export function enviarComando(comando) {
  if (!_port || !_port.isOpen) {
    logger.warn('Puerto serial no disponible para enviar comando');
    return false;
  }
  _port.write(JSON.stringify(comando) + '\n', (err) => {
    if (err) logger.error(`Error escribiendo al serial: ${err.message}`);
  });
  return true;
}
