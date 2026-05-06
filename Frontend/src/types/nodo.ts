// types/nodo.ts
export interface LecturaDatos {
  // Actuadores
  led?:              number | boolean
  boton?:            number | boolean
  bomba_riego?:      number | boolean
  ventilador?:       number | boolean
  bomba_nutrientes?: number | boolean
  calefactor?:       number | boolean
  iluminacion?:      number | boolean
  valvula_agua?:     number | boolean
  // Sensores ambientales
  temperatura?:  number
  humedad?:      number
  co2?:          number
  luminosidad?:  number
  // Sensores solución / agua
  ph?:           number
  ec?:           number
  temp_agua?:    number
  nivel_agua?:   number
  humedad_suelo?: number
  presion_agua?: number
}

export interface Nodo {
  id: number
  nombre: string
  ubicacion?: string
  tipo: string
  sede_id: string
  invernadero_id?: number | null
  activo: number
  creado_en?: string
  ultimaLectura?: LecturaDatos
  ultimoUpdate?: Date
  estado: 'online' | 'offline' | 'alerta'
}

export interface Lectura {
  id: number
  nodo_id: number
  timestamp: string
  // Actuadores
  led?:              number
  boton?:            number
  bomba_riego?:      number
  ventilador?:       number
  bomba_nutrientes?: number
  calefactor?:       number
  iluminacion?:      number
  valvula_agua?:     number
  // Sensores ambientales
  temperatura?:  number
  humedad?:      number
  co2?:          number
  luminosidad?:  number
  // Sensores solución / agua
  ph?:           number
  ec?:           number
  temp_agua?:    number
  nivel_agua?:   number
  humedad_suelo?: number
  presion_agua?: number
}
