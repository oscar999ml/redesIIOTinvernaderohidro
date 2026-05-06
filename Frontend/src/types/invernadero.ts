// types/invernadero.ts
import { LecturaDatos } from './nodo'

export interface Invernadero {
  id: number
  codigo: string          // 'A' | 'B' | 'C'
  nombre: string
  descripcion?: string
  cultivo?: string
  area_m2?: number
  sede_id: string
  activo: number
  creado_en?: string
  nodos?: NodoConLectura[]
  alarmas?: AlarmaInvernadero[]
}

export interface NodoConLectura {
  id: number
  nombre: string
  ubicacion?: string
  tipo: string
  sede_id: string
  invernadero_id?: number | null
  activo: number
  creado_en?: string
  ultimaLectura?: LecturaDatos | null
  ultimoUpdate?: Date
  estado: 'online' | 'offline' | 'alerta'
}

export interface AlarmaInvernadero {
  id: number
  nodo_id: number
  nodo_nombre: string
  variable: string
  valor: number
  umbral: number
  tipo: 'max' | 'min'
  activa: number
  reconocida: number
  timestamp: string
}
