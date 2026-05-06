// store/alarmasStore.ts
import { create } from 'zustand'
import { Alarma } from '@/types/alarma'

interface AlarmasStore {
  alarmas: Alarma[]
  alarmasActivasCount: number
  agregarAlarma: (a: Alarma) => void
  reconocer: (id: number) => void
  setAlarmas: (lista: Alarma[]) => void
}

export const useAlarmasStore = create<AlarmasStore>((set) => ({
  alarmas: [],
  alarmasActivasCount: 0,
  setAlarmas: (lista) => set({
    alarmas: lista,
    alarmasActivasCount: lista.filter((a) => a.activa && !a.reconocida).length,
  }),
  agregarAlarma: (a) =>
    set((s) => {
      if (s.alarmas.some((x) => x.id === a.id)) return s
      const alarmas = [a, ...s.alarmas]
      return { alarmas, alarmasActivasCount: alarmas.filter((x) => x.activa && !x.reconocida).length }
    }),
  reconocer: (id) =>
    set((s) => {
      const alarmas = s.alarmas.map((a) => (a.id === id ? { ...a, reconocida: 1 } : a))
      return { alarmas, alarmasActivasCount: alarmas.filter((a) => a.activa && !a.reconocida).length }
    }),
}))
