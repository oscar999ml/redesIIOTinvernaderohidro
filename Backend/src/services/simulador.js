// src/services/simulador.js
import { procesarMensaje } from './nodosService.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

function rand(min, max, dec = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(dec));
}

function randBool(prob = 0.3) {
  return Math.random() < prob ? 1 : 0;
}

// Estado persistente de actuadores por nodo (no cambia aleatoriamente cada tick)
const estadoActuadores = {};

function getActuadores(nodo_id) {
  if (!estadoActuadores[nodo_id]) {
    estadoActuadores[nodo_id] = {
      led:              0,
      bomba_riego:      0,
      ventilador:       0,
      bomba_nutrientes: 0,
      calefactor:       0,
      iluminacion:      1,
      valvula_agua:     0,
    };
  }
  return estadoActuadores[nodo_id];
}

export function setActuador(nodo_id, accion, valor) {
  const act = getActuadores(nodo_id);
  if (accion in act) {
    act[accion] = valor ? 1 : 0;
  }
}

export function iniciarSimulador() {
  const n = env.SIMULATE_NODOS;
  logger.info(`Simulador activo: ${n} nodos, intervalo 2s`);

  setInterval(() => {
    for (let i = 1; i <= n; i++) {
      const act = getActuadores(i);

      procesarMensaje({
        nodo_id: i,
        tipo: 'estado',
        datos: {
          // Sensores ambientales
          temperatura:      rand(18, 38),
          humedad:          rand(40, 95),
          co2:              rand(400, 1600, 0),
          luminosidad:      rand(5000, 85000, 0),
          // Sensores solución / agua
          ph:               rand(5.0, 8.0, 2),
          ec:               rand(0.4, 3.8, 2),
          temp_agua:        rand(16, 28),
          nivel_agua:       rand(10, 100),
          humedad_suelo:    rand(20, 90),
          presion_agua:     rand(0.3, 4.5, 2),
          // Estado actuadores (persistente)
          ...act,
          boton: randBool(0.05),
        },
      });
    }
  }, 2000);
}
