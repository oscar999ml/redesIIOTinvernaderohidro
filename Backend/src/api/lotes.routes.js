// src/api/lotes.routes.js
import { Router } from 'express';
import { Lote } from '../models/Lote.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authMiddleware);

// GET /api/lotes[?invernadero_id=X]
router.get('/', (req, res) => {
  try {
    const { invernadero_id } = req.query;
    const data = invernadero_id
      ? Lote.findByInvernadero(invernadero_id)
      : Lote.findAll();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/lotes/:id
router.get('/:id', (req, res) => {
  const lote = Lote.findById(req.params.id);
  if (!lote) return res.status(404).json({ error: 'No encontrado' });
  res.json(lote);
});

// POST /api/lotes
router.post('/', (req, res) => {
  try {
    const lote = Lote.create(req.body);
    res.status(201).json(lote);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// PUT /api/lotes/:id
router.put('/:id', (req, res) => {
  try {
    const lote = Lote.update(req.params.id, req.body);
    res.json(lote);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE /api/lotes/:id
router.delete('/:id', (req, res) => {
  Lote.delete(req.params.id);
  res.json({ ok: true });
});

export default router;
