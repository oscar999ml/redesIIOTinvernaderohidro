'use client'
// components/layout/Navbar.tsx
import { useSistemaStore } from '@/store/sistemaStore'
import { useAlarmasStore } from '@/store/alarmasStore'
import { useRouter } from 'next/navigation'
import { Bell, Wifi, WifiOff, Cpu } from 'lucide-react'

export function Navbar() {
  const serial       = useSistemaStore((s) => s.serialConectado)
  const backend      = useSistemaStore((s) => s.backendOnline)
  const alarmasCount = useAlarmasStore((s) => s.alarmasActivasCount)
  const router       = useRouter()

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-4 lg:px-6"
      style={{
        borderBottom: '1px solid var(--border)',
        background: 'rgba(244,248,242,0.92)',
        backdropFilter: 'blur(12px)',
      }}>

      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--accent)', boxShadow: '0 2px 8px rgba(46,125,79,0.25)' }}>
          <span className="text-white text-base">🌿</span>
        </div>
        <div className="leading-tight">
          <span className="font-display text-base font-semibold" style={{ color: 'var(--accent)' }}>
            GreenSCADA
          </span>
          <span className="hidden md:inline text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
            Invernadero Hidropónico
          </span>
        </div>
      </div>

      {/* Indicadores */}
      <div className="flex items-center gap-2">

        {/* Backend status */}
        <div className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full"
          style={{
            background: backend ? 'rgba(46,125,79,0.08)' : 'rgba(192,57,43,0.08)',
            border: `1px solid ${backend ? 'rgba(46,125,79,0.2)' : 'rgba(192,57,43,0.2)'}`,
            color: backend ? 'var(--accent)' : 'var(--danger)',
          }}>
          {backend
            ? <Wifi className="w-3.5 h-3.5" />
            : <WifiOff className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline font-medium">
            {backend ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Serial ESP32 */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full"
          style={{
            background: 'rgba(46,125,79,0.05)',
            border: '1px solid var(--border)',
            color: serial ? 'var(--accent)' : 'var(--text-muted)',
          }}>
          <Cpu className="w-3.5 h-3.5" />
          <span>{serial ? 'ESP32' : 'Sin HW'}</span>
        </div>

        {/* Alarmas */}
        {alarmasCount > 0 && (
          <button
            onClick={() => router.push('/alarmas')}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full font-semibold transition-all"
            style={{
              background: 'var(--danger-dim)',
              border: '1px solid rgba(192,57,43,0.25)',
              color: 'var(--danger)',
            }}>
            <Bell className="w-3.5 h-3.5" />
            <span>{alarmasCount}</span>
          </button>
        )}
      </div>
    </header>
  )
}
