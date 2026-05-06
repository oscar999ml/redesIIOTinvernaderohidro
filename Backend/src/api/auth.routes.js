// src/api/auth.routes.js
import { Router } from 'express';
import { authService } from '../services/authService.js';
import { LoginSchema } from '../utils/validators.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: true, mensaje: 'Datos inválidos' });
  }
  const { usuario, password } = result.data;
  const data = await authService.login(usuario, password);
  if (!data) {
    return res.status(401).json({ error: true, mensaje: 'Credenciales incorrectas' });
  }
  res.json(data);
});

export default router;
