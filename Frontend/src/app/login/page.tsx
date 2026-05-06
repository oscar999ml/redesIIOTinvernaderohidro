'use client'
// app/login/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { Spinner } from '@/components/ui/Spinner'
import { Leaf, Lock, User } from 'lucide-react'

export default function LoginPage() {
  const [usuario,  setUsuario]  = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const router  = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.login(usuario, password)
      setAuth(data.token, data.user)
      router.replace('/')
    } catch (err: any) {
      setError(err.message ?? 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'var(--bg-base)',
        backgroundImage: `
          radial-gradient(ellipse 70% 60% at 20% 10%, rgba(52,211,153,0.09) 0%, transparent 55%),
          radial-gradient(ellipse 50% 40% at 80% 90%, rgba(16,185,129,0.06) 0%, transparent 50%)
        `,
      }}>

      <div className="w-full max-w-sm">

        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'var(--accent-dim)', border: '1px solid var(--border-hover)' }}>
            <Leaf className="w-8 h-8" style={{ color: 'var(--accent)' }} />
          </div>
          <h1 className="font-display text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>
            GreenSCADA
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Sistema de control — Invernadero Hidropónico
          </p>
        </div>

        {/* Card */}
        <div className="glass p-6 flex flex-col gap-5">
          <form onSubmit={submit} className="flex flex-col gap-4">

            {/* Usuario */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Usuario
              </label>
              <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
                style={{ background: 'rgba(11,26,16,0.7)', border: '1px solid var(--border)' }}>
                <User className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  autoComplete="username"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'var(--text-primary)' }}
                  placeholder="Ingresa tu usuario"
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Contraseña
              </label>
              <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
                style={{ background: 'rgba(11,26,16,0.7)', border: '1px solid var(--border)' }}>
                <Lock className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'var(--text-primary)' }}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl px-3 py-2.5 text-sm flex items-center gap-2"
                style={{ background: 'var(--danger-dim)', border: '1px solid rgba(248,113,113,0.25)', color: 'var(--danger)' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{ background: 'var(--accent)', color: '#0b1a10' }}
            >
              {loading ? <Spinner size="sm" /> : 'Iniciar sesión'}
            </button>
          </form>

          {/* Hint dev */}
          <div className="text-center text-xs" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <span className="opacity-60">Dev — </span>
            admin/admin123 · supervisor/super123 · operario1/op123
          </div>
        </div>
      </div>
    </div>
  )
}
