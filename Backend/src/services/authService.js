// src/services/authService.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UsuarioModel } from '../models/Usuario.js';
import { env } from '../config/env.js';

export const authService = {
  async login(usuario, password) {
    const user = UsuarioModel.findByUsuario(usuario);
    if (!user) return null;

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return null;

    const payload = { sub: user.id, usuario: user.usuario, rol: user.rol, sede_id: user.sede_id };
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

    return {
      token,
      user: { id: user.id, usuario: user.usuario, nombre: user.nombre, rol: user.rol, sede_id: user.sede_id },
    };
  },

  verify(token) {
    return jwt.verify(token, env.JWT_SECRET);
  },
};
