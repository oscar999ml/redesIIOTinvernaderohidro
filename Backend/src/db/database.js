// src/db/database.js
// Usa node:sqlite — nativo en Node.js 22, sin dependencias externas
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Asegurar directorio data/
mkdirSync(dirname(env.DB_PATH), { recursive: true });

let _db = null;

export function getDb() {
  if (!_db) {
    _db = new DatabaseSync(env.DB_PATH);
    // WAL mejora concurrencia; foreign keys activadas
    _db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
    logger.info(`DB SQLite (node:sqlite) conectada: ${env.DB_PATH}`);
  }
  return _db;
}

export function migrate() {
  const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
  getDb().exec(sql);
  logger.info('Migración SQLite completada');
}
