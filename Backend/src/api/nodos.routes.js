// src/api/nodos.routes.js
import { Router } from 'express';
import { NodoModel } from '../models/Nodo.js';
import { UmbralModel } from '../models/Umbral.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();
router.use(authMiddleware);

// GET /api/nodos
router.get('/', (req, res) => {
  res.json(NodoModel.findAll());
});

// GET /api/nodos/:id
router.get('/:id', (req, res) => {
  const nodo = NodoModel.findById(parseInt(req.params.id));
  if (!nodo) return res.status(404).json({ error: true, mensaje: 'Nodo no encontrado' });
  res.json(nodo);
});

// POST /api/nodos — supervisor+
router.post('/', requireRole('supervisor'), (req, res) => {
  const { id, nombre, ubicacion, tipo } = req.body;
  if (!id || !nombre) return res.status(400).json({ error: true, mensaje: 'id y nombre requeridos' });
  NodoModel.upsert({ id, nombre, ubicacion, tipo });
  res.status(201).json({ ok: true });
});

// DELETE /api/nodos/:id — admin
router.delete('/:id', requireRole('admin'), (req, res) => {
  NodoModel.deactivate(parseInt(req.params.id));
  res.json({ ok: true });
});

// GET /api/nodos/:id/umbrales
router.get('/:id/umbrales', (req, res) => {
  res.json(UmbralModel.findByNodo(parseInt(req.params.id)));
});

// PUT /api/nodos/:id/umbrales — supervisor+
router.put('/:id/umbrales', requireRole('supervisor'), (req, res) => {
  const nodo_id = parseInt(req.params.id);
  const umbrales = req.body; // array de { variable, umbral_max, umbral_min }
  for (const u of umbrales) UmbralModel.upsert({ ...u, nodo_id });
  res.json({ ok: true });
});

export default router;
