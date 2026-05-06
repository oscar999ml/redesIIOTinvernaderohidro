// src/websocket/wsServer.js
import { Server } from 'socket.io';
import { logger } from '../utils/logger.js';

let _io = null;

export function initWs(httpServer) {
  _io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  _io.on('connection', (socket) => {
    logger.debug(`WS cliente conectado: ${socket.id}`);

    // El frontend puede suscribirse a un nodo específico (room)
    socket.on('suscribir:nodo', (nodo_id) => {
      socket.join(`nodo:${nodo_id}`);
    });

    socket.on('disconnect', () => {
      logger.debug(`WS cliente desconectado: ${socket.id}`);
    });
  });

  logger.info('WebSocket (Socket.io) iniciado');
  return _io;
}

export function getIo() {
  return _io;
}
