// src/api/comandos.routes.js
import { Router } from 'express';
import { ComandoSchema } from '../utils/validators.js';
import { ComandoModel } from '../models/Comando.js';
import { enviarComando } from '../serial/serialManager.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { env } from '../config/env.js';
import { setActuador } from '../services/simulador.js';

const router = Router();
router.use(authMiddleware);

// Acciones válidas de actuadores
const ACTUADORES = ['led','bomba_riego','ventilador','bomba_nutrientes','calefactor','iluminacion','valvula_agua'];

// POST /api/comandos
router.post('/', (req, res) => {
  const result = ComandoSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: true, mensaje: 'Comando inválido' });
  }
  const { nodo_id, accion, valor } = result.data;

  ComandoModel.insert({ nodo_id, usuario_id: req.user?.id ?? 1, accion, valor });

  if (env.SIMULATE) {
    // En modo simulador: actualizar estado del actuador en memoria
    if (ACTUADORES.includes(accion)) {
      setActuador(nodo_id, accion, valor);
    }
    return res.json({ ok: true, simulado: true });
  }

  const enviado = enviarComando({ nodo_id, accion, valor });
  res.json({ ok: true, enviado });
});

// GET /api/comandos — historial reciente
router.get('/', (req, res) => {
  res.json(ComandoModel.findRecientes(50));
});

export default router;
