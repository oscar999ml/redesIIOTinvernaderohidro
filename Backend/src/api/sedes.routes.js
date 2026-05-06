// src/api/sedes.routes.js
// Devuelve el estado de todas las sedes (para el frontend unificado)
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { env } from '../config/env.js';
import { NodoModel } from '../models/Nodo.js';
import { AlarmaModel } from '../models/Alarma.js';

const router = Router();
router.use(authMiddleware);

// GET /api/sedes — resumen de todas las sedes
router.get('/', async (req, res) => {
  // Sede local (este backend)
  const local = {
    id: env.SEDE_ID,
    nombre: env.SEDE_NOMBRE,
    nodos: NodoModel.findAll().length,
    alarmas_activas: AlarmaModel.findActivas().length,
    online: true,
  };

  const sedes = [local];

  // Si es la sede central, consultar las otras sedes
  if (env.SEDE_ID === 'central') {
    for (const [id, url] of [['sede2', env.SEDE2_URL], ['sede3', env.SEDE3_URL]]) {
      try {
        const r = await fetch(`${url}/api/sedes/local`, {
          headers: { Authorization: req.headers.authorization },
          signal: AbortSignal.timeout(3000),
        });
        if (r.ok) sedes.push(await r.json());
        else sedes.push({ id, online: false });
      } catch {
        sedes.push({ id, online: false });
      }
    }
  }

  res.json(sedes);
});

// GET /api/sedes/local — solo datos de esta sede (para ser consultado por otras sedes)
router.get('/local', (req, res) => {
  res.json({
    id: env.SEDE_ID,
    nombre: env.SEDE_NOMBRE,
    nodos: NodoModel.findAll().length,
    alarmas_activas: AlarmaModel.findActivas().length,
    online: true,
  });
});

export default router;
