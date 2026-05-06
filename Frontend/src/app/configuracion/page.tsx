'use client'
// app/configuracion/page.tsx
import { useNodosStore } from '@/store/nodosStore'
import { useAuthStore } from '@/store/authStore'
import { Settings, User, Cpu, Wifi, WifiOff, Server } from 'lucide-react'

function Row({ label, value, accent }: { label: string; value?: string | null; accent?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 0', borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{
        fontSize: 13, fontWeight: 600,
        color: accent ? 'var(--accent)' : 'var(--text)',
        textTransform: accent ? 'capitalize' : undefined,
      }}>
        {value ?? '—'}
      </span>
    </div>
  )
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ style?: React.CSSProperties }>; children: React.ReactNode }) {
  return (
    <div className="glass" style={{ borderRadius: 16, padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Icon style={{ width: 16, height: 16, color: 'var(--accent)' }} />
        <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}

export default function ConfiguracionPage() {
  const nodosArray = useNodosStore((s) => s.nodosArray)
  const user       = useAuthStore((s) => s.user)

  const online  = nodosArray.filter((n) => n.estado === 'online').length
  const offline = nodosArray.filter((n) => n.estado === 'offline').length

  return (
    <div style={{ padding: '32px 28px', maxWidth: 760, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, background: 'var(--accent-dim)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Settings style={{ width: 22, height: 22, color: 'var(--accent)' }} />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Configuración</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Ajustes del sistema SCADA</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Sesión */}
        <Section title="Sesión actual" icon={User}>
          <Row label="Usuario"  value={user?.usuario} />
          <Row label="Nombre"   value={user?.nombre} />
          <Row label="Rol"      value={user?.rol}     accent />
          <Row label="Sede"     value={user?.sede_id} />
        </Section>

        {/* Nodos */}
        <Section title="Nodos registrados" icon={Cpu}>
          {nodosArray.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
              Sin nodos — inicia el backend para verlos.
            </p>
          ) : (
            <>
              {/* Resumen */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{
                  flex: 1, padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(46,125,79,0.07)', border: '1px solid var(--border)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)' }}>{online}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Online</div>
                </div>
                <div style={{
                  flex: 1, padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-muted)' }}>{offline}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Offline</div>
                </div>
                <div style={{
                  flex: 1, padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{nodosArray.length}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total</div>
                </div>
              </div>

              {/* Lista */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {nodosArray.map((n) => (
                  <div key={n.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.6)', border: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: n.estado === 'online' ? 'var(--accent)' : 'var(--text-muted)',
                      }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{n.nombre}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {n.ubicacion ?? 'Sin ubicación'} · ID {n.id}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {n.estado === 'online'
                        ? <Wifi style={{ width: 13, height: 13, color: 'var(--accent)' }} />
                        : <WifiOff style={{ width: 13, height: 13, color: 'var(--text-muted)' }} />
                      }
                      <span style={{
                        fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
                        color: n.estado === 'online' ? 'var(--accent)' : 'var(--text-muted)',
                      }}>
                        {n.estado}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Section>

        {/* Sistema */}
        <Section title="Sistema" icon={Server}>
          <Row label="Backend URL" value={process.env.NEXT_PUBLIC_BACKEND_URL} />
          <Row label="Versión SCADA" value="v1.0.0 — Fase 1" />
          <Row label="Modo" value="Simulación" accent />
        </Section>

      </div>
    </div>
  )
}
