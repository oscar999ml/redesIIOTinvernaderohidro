// src/api/invernaderos.routes.js
import { Router } from 'express';
import { InvernaderoModel } from '../models/Invernadero.js';
import { LecturaModel } from '../models/Lectura.js';
import { AlarmaModel } from '../models/Alarma.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authMiddleware);

// GET /api/invernaderos — lista de invernaderos con su nodo asociado
router.get('/', (_req, res) => {
  const invernaderos = InvernaderoModel.findAll();
  const result = invernaderos.map((inv) => {
    const nodos = InvernaderoModel.findNodos(inv.id);
    return { ...inv, nodos };
  });
  res.json(result);
});

// GET /api/invernaderos/:id — detalle de un invernadero
router.get('/:id', (req, res) => {
  const inv = InvernaderoModel.findById(Number(req.params.id));
  if (!inv) return res.status(404).json({ error: true, mensaje: 'Invernadero no encontrado' });

  const nodos = InvernaderoModel.findNodos(inv.id);

  // Última lectura de cada nodo
  const nodosConLectura = nodos.map((n) => {
    const lecturas = LecturaModel.findByNodo(n.id, 1);
    return { ...n, ultimaLectura: lecturas[0] ?? null };
  });

  // Alarmas activas de todos los nodos del invernadero
  const nodo_ids = nodos.map((n) => n.id);
  const alarmas = nodo_ids.flatMap((nid) => AlarmaModel.findActivas(nid));

  res.json({ ...inv, nodos: nodosConLectura, alarmas });
});

// PUT /api/invernaderos/:id — actualizar info básica
router.put('/:id', (req, res) => {
  const inv = InvernaderoModel.findById(Number(req.params.id));
  if (!inv) return res.status(404).json({ error: true, mensaje: 'Invernadero no encontrado' });
  InvernaderoModel.update(Number(req.params.id), req.body);
  res.json({ ok: true });
});

export default router;
