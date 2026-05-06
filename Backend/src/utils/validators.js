// src/utils/validators.js
import { z } from 'zod';

export const MensajeSerialSchema = z.object({
  nodo_id: z.number().int().positive(),
  tipo: z.string(),
  datos: z.record(z.union([z.number(), z.boolean(), z.string()])),
});

export const ComandoSchema = z.object({
  nodo_id: z.number().int().positive(),
  accion: z.string().min(1),
  valor: z.union([z.boolean(), z.number(), z.string()]).optional(),
});

export const LoginSchema = z.object({
  usuario: z.string().min(1),
  password: z.string().min(1),
});

export const NodoSchema = z.object({
  id: z.number().int().positive(),
  nombre: z.string().min(1),
  ubicacion: z.string().optional(),
  tipo: z.string().default('esp8266'),
});

export const UmbralSchema = z.object({
  nodo_id: z.number().int().positive(),
  variable: z.string().min(1),
  umbral_max: z.number().nullable().optional(),
  umbral_min: z.number().nullable().optional(),
});
