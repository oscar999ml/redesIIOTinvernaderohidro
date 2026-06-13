import net from 'net';
import { logger } from '../utils/logger.js';
import { parsearMensaje } from '../serial/serialParser.js';
import { procesarMensaje, procesarRegistro } from '../services/nodosService.js';

const _conexiones = new Map();
const TCP_PORT = 4002;

export function initTcpNodos() {
  const server = net.createServer((socket) => {
    const remote = `socket.remoteAddress:${socket.remotePort}`;
    logger.info(`ESP32 conectado via TCP desde ${remote}`);
    let nodoId = null;
    let buffer = '';

    socket.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const msg = parsearMensaje(trimmed);
          if (!msg) continue;
          nodoId = msg.nodo_id;
          _conexiones.set(nodoId, socket);
          if (msg.tipo === 'registro') {
            procesarRegistro(msg);
            socket.write(JSON.stringify({ status: 'ok', nodo_id: nodoId }) + '\n');
          } else {
            procesarMensaje(msg);
          }
        } catch (err) {
          logger.warn(`Se perdio el mensaje: ${err.message}`);
        }
      }
    });

    socket.on('close', () => {
      if (nodoId) { _conexiones.delete(nodoId); logger.info(`ESP32 nodo ${nodoId} desconectado`); }
    });

    socket.on('error', (err) => {
      logger.error(`Error TCP ESP32: ${err.message}`);
    });
  });

  server.listen(TCP_PORT, '0.0.0.0', () => {
    logger.info(`Servidor TCP para ESP32 en puerto ${TCP_PORT}`);
  });

  return server;
}

export function enviarComandoTcp(comando) {
  const socket = _conexiones.get(comando.nodo_id);
  if (!socket || socket.destroyed) {
    logger.warn(`ESP32 nodo ${comando.nodo_id} no conectado via TCP`);
    return false;
  }
  socket.write(JSON.stringify(comando) + '\n');
  return true;
}
