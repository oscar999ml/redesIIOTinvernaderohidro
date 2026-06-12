import { WebSocketServer } from 'ws';
import { logger } from '../utils/logger.js';
import { parsearMensaje } from '../serial/serialParser.js';
import { procesarMensaje } from '../services/nodosService.js';

const _conexiones = new Map();
const WS_PATH = '/ws/nodos';

export function initWsNodos(httpServer) {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url, 'http://localhost');
    if (url.pathname === WS_PATH) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws, req) => {
    const remote = req.socket.remoteAddress;
    logger.info(`ESP32 conectado vía WebSocket desde ${remote}`);
    let nodoId = null;

    ws.on('message', (raw) => {
      try {
        const msg = parsearMensaje(raw.toString().trim());
        if (!msg) return;
        nodoId = msg.nodo_id;
        _conexiones.set(nodoId, ws);
        procesarMensaje(msg);
      } catch (err) {
        logger.warn(`Mensaje inválido de ESP32: ${err.message}`);
      }
    });

    ws.on('close', () => {
      if (nodoId) {
        _conexiones.delete(nodoId);
        logger.info(`ESP32 nodo ${nodoId} desconectado`);
      }
    });

    ws.on('error', (err) => {
      logger.error(`Error WebSocket ESP32: ${err.message}`);
    });
  });

  logger.info(`WebSocket (raw) para ESP32 iniciado en ${WS_PATH}`);
  return wss;
}

export function enviarComandoWs(comando) {
  const ws = _conexiones.get(comando.nodo_id);
  if (!ws || ws.readyState !== 1) {
    logger.warn(`ESP32 nodo ${comando.nodo_id} no conectado`);
    return false;
  }
  ws.send(JSON.stringify(comando));
  return true;
}
