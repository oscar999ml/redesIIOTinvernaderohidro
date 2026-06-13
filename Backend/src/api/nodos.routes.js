import { Router } from 'express';
import { NodoModel } from '../models/Nodo.js';
import { UmbralModel } from '../models/Umbral.js';
import { getDb } from '../db/database.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  res.json(NodoModel.findAll());
});

router.get('/grupos', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT DISTINCT sucursal, invernadero FROM nodos WHERE sucursal IS NOT NULL AND activo = 1').all();
  const grupos = {};
  for (const row of rows) {
    if (!grupos[row.sucursal]) grupos[row.sucursal] = [];
    grupos[row.sucursal].push(row.invernadero);
  }
  res.json(grupos);
});

router.get('/:id/capacidades', (req, res) => {
  const nodoId = parseInt(req.params.id);
  const db = getDb();
  const sensores = db.prepare('SELECT sensor_id AS id, label, tipo, unidad, config FROM nodo_sensores WHERE nodo_id = ?').all(nodoId);
  const actuadores = db.prepare('SELECT actuador_id AS id, label, tipo, unidad, config FROM nodo_actuadores WHERE nodo_id = ?').all(nodoId);
  res.json({
    sensores: sensores.map(r => ({ ...r, config: JSON.parse(r.config || '{}') })),
    actuadores: actuadores.map(r => ({ ...r, config: JSON.parse(r.config || '{}') }))
  });
});

router.get('/:id', (req, res) => {
  const nodo = NodoModel.findById(parseInt(req.params.id));
  if (!nodo) return res.status(404).json({ error: true, mensaje: 'Nodo no encontrado' });
  res.json(nodo);
});

router.post('/', requireRole('supervisor'), (req, res) => {
  const { id, nombre, ubicacion, tipo } = req.body;
  if (!id || !nombre) return res.status(400).json({ error: true, mensaje: 'id y nombre requeridos' });
  NodoModel.upsert({ id, nombre, ubicacion, tipo });
  res.status(201).json({ ok: true });
});

router.delete('/:id', requireRole('admin'), (req, res) => {
  NodoModel.deactivate(parseInt(req.params.id));
  res.json({ ok: true });
});

router.get('/:id/umbrales', (req, res) => {
  res.json(UmbralModel.findByNodo(parseInt(req.params.id)));
});

router.put('/:id/umbrales', requireRole('supervisor'), (req, res) => {
  const nodo_id = parseInt(req.params.id);
  const umbrales = req.body;
  for (const u of umbrales) UmbralModel.upsert({ ...u, nodo_id });
  res.json({ ok: true });
});

export default router;
