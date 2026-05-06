// src/api/alarmas.routes.js
import { Router } from 'express';
import { AlarmaModel } from '../models/Alarma.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authMiddleware);

// GET /api/alarmas/activas
router.get('/activas', (req, res) => {
  res.json(AlarmaModel.findActivas());
});

// GET /api/alarmas?limit=100
router.get('/', (req, res) => {
  const limit  = parseInt(req.query.limit ?? '100');
  const offset = parseInt(req.query.offset ?? '0');
  res.json(AlarmaModel.findAll({ limit, offset }));
});

// POST /api/alarmas/:id/reconocer
router.post('/:id/reconocer', (req, res) => {
  AlarmaModel.reconocer(parseInt(req.params.id));
  res.json({ ok: true });
});

// POST /api/alarmas/:id/resolver
router.post('/:id/resolver', (req, res) => {
  AlarmaModel.resolver(parseInt(req.params.id));
  res.json({ ok: true });
});

export default router;
