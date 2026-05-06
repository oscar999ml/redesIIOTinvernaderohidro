// src/middleware/role.middleware.js
import { ROLE_LEVEL } from '../config/constants.js';

/**
 * Genera un middleware que exige un rol mínimo.
 * Uso: router.post('/ruta', authMiddleware, requireRole('supervisor'), handler)
 */
export function requireRole(rolMinimo) {
  return (req, res, next) => {
    const nivelUser = ROLE_LEVEL[req.user?.rol] ?? 0;
    const nivelReq  = ROLE_LEVEL[rolMinimo] ?? 99;
    if (nivelUser < nivelReq) {
      return res.status(403).json({ error: true, mensaje: 'Permisos insuficientes' });
    }
    next();
  };
}
