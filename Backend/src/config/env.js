// src/config/env.js
import 'dotenv/config';

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseInt(process.env.PORT ?? '3001'),
  HOST: process.env.HOST ?? 'localhost',

  SEDE_ID: process.env.SEDE_ID ?? 'central',
  SEDE_NOMBRE: process.env.SEDE_NOMBRE ?? 'Sede Central',

  SERIAL_PORT: process.env.SERIAL_PORT ?? 'COM3',
  SERIAL_BAUD: parseInt(process.env.SERIAL_BAUD ?? '115200'),

  DB_PATH: process.env.DB_PATH ?? './data/sede_central.db',

  JWT_SECRET: process.env.JWT_SECRET ?? 'dev_secret_inseguro',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '8h',

  SEDE2_URL: process.env.SEDE2_URL ?? 'http://localhost:3002',
  SEDE3_URL: process.env.SEDE3_URL ?? 'http://localhost:3003',

  SIMULATE: process.env.SIMULATE === 'true',
  SIMULATE_NODOS: parseInt(process.env.SIMULATE_NODOS ?? '3'),
};
