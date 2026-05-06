// store/nodosStore.ts
import { create } from 'zustand'
import { Nodo, LecturaDatos } from '@/types/nodo'

interface NodosStore {
  nodos: Record<number, Nodo>
  nodosArray: Nodo[]
  nodosOnlineCount: number
  setNodos: (nodos: Nodo[]) => void
  actualizarNodo: (nodo_id: number, datos: LecturaDatos) => void
  setEstado: (nodo_id: number, estado: Nodo['estado']) => void
}

function deriveArrays(nodos: Record<number, Nodo>) {
  const nodosArray = Object.values(nodos)
  const nodosOnlineCount = nodosArray.filter((n) => n.estado === 'online').length
  return { nodosArray, nodosOnlineCount }
}

export const useNodosStore = create<NodosStore>((set) => ({
  nodos: {},
  nodosArray: [],
  nodosOnlineCount: 0,

  setNodos: (lista) =>
    set((s) => {
      const next = { ...s.nodos }
      for (const n of lista) {
        next[n.id] = { ...n, estado: next[n.id]?.estado ?? 'offline' }
      }
      return { nodos: next, ...deriveArrays(next) }
    }),

  actualizarNodo: (nodo_id, datos) =>
    set((s) => {
      const nodos = {
        ...s.nodos,
        [nodo_id]: {
          ...s.nodos[nodo_id],
          id: nodo_id,
          nombre: s.nodos[nodo_id]?.nombre ?? `Nodo ${nodo_id}`,
          tipo: s.nodos[nodo_id]?.tipo ?? 'esp8266',
          sede_id: s.nodos[nodo_id]?.sede_id ?? 'central',
          activo: 1,
          ultimaLectura: datos,
          ultimoUpdate: new Date(),
          estado: 'online' as const,
        },
      }
      return { nodos, ...deriveArrays(nodos) }
    }),

  setEstado: (nodo_id, estado) =>
    set((s) => {
      const nodos = {
        ...s.nodos,
        [nodo_id]: { ...s.nodos[nodo_id], estado },
      }
      return { nodos, ...deriveArrays(nodos) }
    }),
}))
