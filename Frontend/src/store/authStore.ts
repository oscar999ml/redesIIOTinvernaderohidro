// store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Usuario } from '@/types/auth'

interface AuthStore {
  token: string | null
  user: Usuario | null
  setAuth: (token: string, user: Usuario) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        localStorage.setItem('scada_token', token)
        set({ token, user })
      },
      logout: () => {
        localStorage.removeItem('scada_token')
        set({ token: null, user: null })
      },
    }),
    { name: 'scada-auth' }
  )
)
