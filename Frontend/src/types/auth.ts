// types/auth.ts
export interface Usuario {
  id: number
  usuario: string
  nombre: string
  rol: 'admin' | 'supervisor' | 'operario'
  sede_id: string
}

export interface AuthState {
  token: string | null
  user: Usuario | null
}
