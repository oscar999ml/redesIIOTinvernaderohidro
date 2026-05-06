// src/models/Usuario.js
import { getDb } from '../db/database.js';

export const UsuarioModel = {
  findByUsuario(usuario) {
    return getDb().prepare('SELECT * FROM usuarios WHERE usuario = ? AND activo = 1').get(usuario);
  },
  findById(id) {
    return getDb().prepare('SELECT id, usuario, nombre, rol, sede_id FROM usuarios WHERE id = ?').get(id);
  },
  findAll() {
    return getDb().prepare('SELECT id, usuario, nombre, rol, sede_id, activo, creado_en FROM usuarios').all();
  },
};
