// types/alarma.ts
export interface Alarma {
  id: number
  nodo_id: number
  nodo_nombre?: string
  variable: string
  valor: number
  umbral: number
  tipo: 'max' | 'min'
  activa: number
  reconocida: number
  timestamp: string
}
