// types/sucursal.ts
export type EstadoSucursal = 'ok' | 'advertencia' | 'alarma' | 'offline'

export interface Sucursal {
  id: number
  nombre: string
  ubicacion: string
  lat?: number
  lng?: number
  numInvernaderos: number
  nodosOnline: number
  nodosTotal: number
  estado: EstadoSucursal
  temperatura: number   // promedio
  humedad: number       // promedio
  alarmasActivas: number
  ultimaActualizacion: string
}

export interface KpiGlobal {
  sucursalesOk: number
  sucursalesTotal: number
  invernaderosTotales: number
  nodosTotales: number
  nodosOnline: number
  alarmasActivas: number
  tempPromedio: number
  humedadPromedio: number
}
