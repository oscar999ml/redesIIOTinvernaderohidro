// src/config/constants.js

export const ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  OPERARIO: 'operario',
};

// Jerarquía: cuanto mayor el número, más permisos
export const ROLE_LEVEL = {
  operario: 1,
  supervisor: 2,
  admin: 3,
};

export const TIPOS_MENSAJE = {
  ESTADO: 'estado',
  ALARMA: 'alarma',
  ACK: 'ack',
};

export const TIPOS_ALARMA = {
  MAX: 'max',
  MIN: 'min',
};

export const WS_EVENTS = {
  NODO_ESTADO: 'nodo:estado',
  ALARMA_NUEVA: 'alarma:nueva',
  ALARMA_RESUELTA: 'alarma:resuelta',
  SISTEMA_SERIAL: 'sistema:serial',
  SISTEMA_ERROR: 'sistema:error',
};
