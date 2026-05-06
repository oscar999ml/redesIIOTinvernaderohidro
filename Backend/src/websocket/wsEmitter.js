// src/websocket/wsEmitter.js
import { getIo } from './wsServer.js';

/**
 * Emite un evento a todos los clientes conectados.
 * Si no hay clientes, no hace nada (no falla).
 */
export function emit(event, data) {
  const io = getIo();
  if (io) io.emit(event, data);
}

/**
 * Emite a los suscriptores de un nodo específico (room).
 */
export function emitToNodo(nodo_id, event, data) {
  const io = getIo();
  if (io) io.to(`nodo:${nodo_id}`).emit(event, data);
}
