// src/api/lecturas.routes.js
import { Router } from 'express';
import { LecturaModel } from '../models/Lectura.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authMiddleware);

// GET /api/lecturas?nodo_id=1&limit=100
router.get('/', (req, res) => {
  const nodo_id = parseInt(req.query.nodo_id);
  const limit   = parseInt(req.query.limit ?? '200');
  if (!nodo_id) return res.status(400).json({ error: true, mensaje: 'nodo_id requerido' });
  res.json(LecturaModel.findByNodo(nodo_id, limit));
});

// GET /api/lecturas/ultimas — última lectura de cada nodo
router.get('/ultimas', (req, res) => {
  res.json(LecturaModel.ultimaPorNodo());
});

// GET /api/lecturas/rango?nodo_id=1&desde=2026-01-01&hasta=2026-12-31
router.get('/rango', (req, res) => {
  const { nodo_id, desde, hasta } = req.query;
  if (!nodo_id || !desde || !hasta) {
    return res.status(400).json({ error: true, mensaje: 'nodo_id, desde y hasta requeridos' });
  }
  res.json(LecturaModel.findByNodoRango(parseInt(nodo_id), desde, hasta));
});

export default router;
