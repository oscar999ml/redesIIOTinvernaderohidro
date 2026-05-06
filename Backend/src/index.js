// src/index.js — Entry point del Backend SCADA
import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { migrate } from './db/database.js';
import { initWs } from './websocket/wsServer.js';
import apiRouter from './api/router.js';
import { abrirPuerto } from './serial/serialManager.js';
import { iniciarSimulador } from './services/simulador.js';

// ── Inicializar Express ────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// Health check (sin auth)
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    sede: env.SEDE_ID,
    nombre: env.SEDE_NOMBRE,
    simulate: env.SIMULATE,
    ts: new Date().toISOString(),
  });
});

// Todas las rutas API bajo /api
app.use('/api', apiRouter);

// ── Crear servidor HTTP + WebSocket ────────────────────────────────────────
const server = http.createServer(app);
initWs(server);

// ── Base de datos ──────────────────────────────────────────────────────────
migrate();

// ── Serial o Simulador ────────────────────────────────────────────────────
if (env.SIMULATE) {
  iniciarSimulador();
} else {
  abrirPuerto();
}

// ── Arrancar ──────────────────────────────────────────────────────────────
server.listen(env.PORT, env.HOST, () => {
  logger.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  logger.info(` SCADA Backend — ${env.SEDE_NOMBRE}`);
  logger.info(` URL: http://${env.HOST}:${env.PORT}`);
  logger.info(` Modo: ${env.SIMULATE ? 'SIMULADOR' : 'HARDWARE'}`);
  logger.info(` DB:   ${env.DB_PATH}`);
  logger.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
});
