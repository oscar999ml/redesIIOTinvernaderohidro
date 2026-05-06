// src/api/personal.routes.js
// Cubre: /api/personal/tareas, /api/personal/incidencias, /api/personal/turnos
import { Router } from 'express';
import { Tarea }      from '../models/Tarea.js';
import { Incidencia } from '../models/Incidencia.js';
import { Turno }      from '../models/Turno.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authMiddleware);

// ── TAREAS ──────────────────────────────────────────────────────
router.get('/tareas', (req, res) => {
  try {
    res.json(Tarea.findAll(req.query));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/tareas/:id', (req, res) => {
  const t = Tarea.findById(req.params.id);
  if (!t) return res.status(404).json({ error: 'No encontrada' });
  res.json(t);
});

router.post('/tareas', (req, res) => {
  try {
    res.status(201).json(Tarea.create(req.body));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.put('/tareas/:id', (req, res) => {
  try {
    res.json(Tarea.update(req.params.id, req.body));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete('/tareas/:id', (req, res) => {
  Tarea.delete(req.params.id);
  res.json({ ok: true });
});

// ── INCIDENCIAS ─────────────────────────────────────────────────
router.get('/incidencias', (req, res) => {
  try {
    res.json(Incidencia.findAll(req.query));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/incidencias/:id', (req, res) => {
  const inc = Incidencia.findById(req.params.id);
  if (!inc) return res.status(404).json({ error: 'No encontrada' });
  res.json(inc);
});

router.post('/incidencias', (req, res) => {
  try {
    // En dev usamos usuario_id=1 si no viene en el body
    const body = { ...req.body, usuario_id: req.body.usuario_id ?? req.user?.id ?? 1 };
    res.status(201).json(Incidencia.create(body));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.put('/incidencias/:id', (req, res) => {
  try {
    res.json(Incidencia.update(req.params.id, req.body));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete('/incidencias/:id', (req, res) => {
  Incidencia.delete(req.params.id);
  res.json({ ok: true });
});

// ── TURNOS ──────────────────────────────────────────────────────
router.get('/turnos', (req, res) => {
  try {
    const activos = req.query.activos === 'true';
    res.json(activos ? Turno.findActivos() : Turno.findAll());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/turnos', (req, res) => {
  try {
    res.status(201).json(Turno.create(req.body));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.put('/turnos/:id/cerrar', (req, res) => {
  try {
    res.json(Turno.cerrar(req.params.id));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete('/turnos/:id', (req, res) => {
  Turno.delete(req.params.id);
  res.json({ ok: true });
});

export default router;
