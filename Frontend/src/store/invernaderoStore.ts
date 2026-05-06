// store/invernaderoStore.ts
import { create } from 'zustand'
import { Invernadero } from '@/types/invernadero'
import { LecturaDatos } from '@/types/nodo'

interface InvernaderoStore {
  invernaderos: Record<number, Invernadero>
  invernaderosList: Invernadero[]
  // Actualiza la lectura del nodo dentro del invernadero correspondiente
  setInvernaderos: (list: Invernadero[]) => void
  actualizarLectura: (nodo_id: number, datos: LecturaDatos) => void
}

function deriveLista(inv: Record<number, Invernadero>): Invernadero[] {
  return Object.values(inv).sort((a, b) => a.codigo.localeCompare(b.codigo))
}

export const useInvernaderoStore = create<InvernaderoStore>((set) => ({
  invernaderos: {},
  invernaderosList: [],

  setInvernaderos: (list) =>
    set(() => {
      const map: Record<number, Invernadero> = {}
      for (const inv of list) map[inv.id] = inv
      return { invernaderos: map, invernaderosList: deriveLista(map) }
    }),

  actualizarLectura: (nodo_id, datos) =>
    set((s) => {
      // Buscar el invernadero que contiene ese nodo_id
      const inv = Object.values(s.invernaderos).find(
        (i) => i.nodos?.some((n) => n.id === nodo_id)
      )
      if (!inv) return {}

      const nodos = (inv.nodos ?? []).map((n) =>
        n.id === nodo_id
          ? { ...n, ultimaLectura: datos, ultimoUpdate: new Date(), estado: 'online' as const }
          : n
      )
      const updated = { ...s.invernaderos, [inv.id]: { ...inv, nodos } }
      return { invernaderos: updated, invernaderosList: deriveLista(updated) }
    }),
}))
