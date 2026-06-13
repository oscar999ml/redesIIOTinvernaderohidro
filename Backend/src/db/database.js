import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
mkdirSync(dirname(env.DB_PATH), { recursive: true });
let _db = null;

export function getDb() {
  if (!_db) {
    _db = new DatabaseSync(env.DB_PATH);
    _db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
    logger.info('DB SQLite: ' + env.DB_PATH);
  }
  return _db;
}

export function migrate() {
  const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
  getDb().exec(sql);
  logger.info('Migracion SQLite completada');

  const db = getDb();
  try { db.exec("ALTER TABLE nodos ADD COLUMN sucursal TEXT DEFAULT 'Central'"); } catch (e) {}
  try { db.exec("ALTER TABLE nodos ADD COLUMN invernadero TEXT DEFAULT 'A'"); } catch (e) {}
  try { db.exec("ALTER TABLE nodos ADD COLUMN hardware TEXT DEFAULT 'ESP32'"); } catch (e) {}
  try { db.exec("ALTER TABLE nodos ADD COLUMN version TEXT DEFAULT '1.0'"); } catch (e) {}
  logger.info('Migracion V2 completada');
}