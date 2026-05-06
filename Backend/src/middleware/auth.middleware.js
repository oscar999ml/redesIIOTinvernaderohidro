// src/middleware/auth.middleware.js
import { authService } from '../services/authService.js';

export function authMiddleware(req, res, next) {
  // En modo desarrollo sin token: usuario admin por defecto
  if (process.env.NODE_ENV === 'development' && !req.headers.authorization) {
    req.user = { id: 1, usuario: 'admin', rol: 'admin', sede_id: 'central' };
    return next();
  }
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: true, mensaje: 'Token requerido' });
  }
  try {
    req.user = authService.verify(header.slice(7));
    next();
  } catch {
    res.status(401).json({ error: true, mensaje: 'Token inválido o expirado' });
  }
}
