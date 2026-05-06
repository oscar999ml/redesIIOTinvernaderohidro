// store/sucursalesStore.ts
// Datos mock mientras no haya endpoint multi-sede
import { create } from 'zustand'
import { Sucursal, KpiGlobal, EstadoSucursal } from '@/types/sucursal'

const MOCK_SUCURSALES: Sucursal[] = [
  {
    id: 1,
    nombre: 'Sede Central',
    ubicacion: 'Bogotá, Colombia',
    numInvernaderos: 3,
    nodosOnline: 3,
    nodosTotal: 3,
    estado: 'ok',
    temperatura: 24.5,
    humedad: 68,
    alarmasActivas: 0,
    ultimaActualizacion: new Date().toISOString(),
  },
  {
    id: 2,
    nombre: 'Sede Norte',
    ubicacion: 'Medellín, Colombia',
    numInvernaderos: 2,
    nodosOnline: 1,
    nodosTotal: 2,
    estado: 'advertencia',
    temperatura: 28.1,
    humedad: 55,
    alarmasActivas: 1,
    ultimaActualizacion: new Date().toISOString(),
  },
  {
    id: 3,
    nombre: 'Sede Sur',
    ubicacion: 'Cali, Colombia',
    numInvernaderos: 2,
    nodosOnline: 0,
    nodosTotal: 2,
    estado: 'offline',
    temperatura: 0,
    humedad: 0,
    alarmasActivas: 0,
    ultimaActualizacion: new Date(Date.now() - 3600000).toISOString(),
  },
]

function calcKpis(lista: Sucursal[]): KpiGlobal {
  const activas = lista.filter((s) => s.estado !== 'offline')
  return {
    sucursalesOk: lista.filter((s) => s.estado === 'ok').length,
    sucursalesTotal: lista.length,
    invernaderosTotales: lista.reduce((a, s) => a + s.numInvernaderos, 0),
    nodosTotales: lista.reduce((a, s) => a + s.nodosTotal, 0),
    nodosOnline: lista.reduce((a, s) => a + s.nodosOnline, 0),
    alarmasActivas: lista.reduce((a, s) => a + s.alarmasActivas, 0),
    tempPromedio: activas.length
      ? parseFloat((activas.reduce((a, s) => a + s.temperatura, 0) / activas.length).toFixed(1))
      : 0,
    humedadPromedio: activas.length
      ? Math.round(activas.reduce((a, s) => a + s.humedad, 0) / activas.length)
      : 0,
  }
}

interface SucursalesStore {
  sucursales: Sucursal[]
  kpis: KpiGlobal
  setSucursales: (lista: Sucursal[]) => void
  actualizarSucursal: (id: number, cambios: Partial<Sucursal>) => void
}

export const useSucursalesStore = create<SucursalesStore>((set) => ({
  sucursales: MOCK_SUCURSALES,
  kpis: calcKpis(MOCK_SUCURSALES),

  setSucursales: (lista) => set({ sucursales: lista, kpis: calcKpis(lista) }),

  actualizarSucursal: (id, cambios) =>
    set((s) => {
      const sucursales = s.sucursales.map((x) => (x.id === id ? { ...x, ...cambios } : x))
      return { sucursales, kpis: calcKpis(sucursales) }
    }),
}))
