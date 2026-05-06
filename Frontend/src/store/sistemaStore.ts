// store/sistemaStore.ts
import { create } from 'zustand'

interface SistemaStore {
  serialConectado: boolean
  backendOnline: boolean
  setSerial: (v: boolean) => void
  setBackend: (v: boolean) => void
}

export const useSistemaStore = create<SistemaStore>((set) => ({
  serialConectado: false,
  backendOnline: false,
  setSerial: (v) => set({ serialConectado: v }),
  setBackend: (v) => set({ backendOnline: v }),
}))
