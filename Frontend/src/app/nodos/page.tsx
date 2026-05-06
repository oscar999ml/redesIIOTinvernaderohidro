'use client'
// app/nodos/page.tsx — Lista global de nodos / Red
import { useNodosStore } from '@/store/nodosStore'
import Link from 'next/link'
import { Radio, Wifi, WifiOff, Thermometer, Droplets, FlaskConical, ChevronRight } from 'lucide-react'

export default function NodosPage() {
  const nodosArray  = useNodosStore((s) => s.nodosArray)
  const nodosOnline = useNodosStore((s) => s.nodosOnlineCount)

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1000, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Radio style={{ width: 22, height: 22, color: 'var(--accent)' }} />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Red / Nodos</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            {nodosOnline} online · {nodosArray.length - nodosOnline} offline · {nodosArray.length} total
          </p>
        </div>
      </div>

      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total nodos',  value: nodosArray.length,                    color: 'var(--text-primary)' },
          { label: 'Online',       value: nodosOnline,                           color: 'var(--accent)' },
          { label: 'Offline',      value: nodosArray.length - nodosOnline,       color: 'var(--text-muted)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass" style={{ borderRadius: 14, padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Lista */}
      {nodosArray.length === 0 ? (
        <div className="glass" style={{ borderRadius: 16, padding: '48px 24px', textAlign: 'center' }}>
          <Radio style={{ width: 32, height: 32, color: 'var(--text-muted)', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>Sin nodos detectados. Inicia el backend.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {nodosArray.map((n) => {
            const d  = n.ultimaLectura
            const on = n.estado === 'online'
            return (
              <Link key={n.id} href={`/nodos/${n.id}`} style={{ textDecoration: 'none' }}>
                <div className="glass" style={{ borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'transform 0.15s' }}
                  onMouseEnter={(el) => { (el.currentTarget as HTMLElement).style.transform = 'translateX(3px)' }}
                  onMouseLeave={(el) => { (el.currentTarget as HTMLElement).style.transform = '' }}
                >
                  {/* Estado icono */}
                  <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: on ? 'var(--accent-dim)' : 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {on
                      ? <Wifi style={{ width: 18, height: 18, color: 'var(--accent)' }} />
                      : <WifiOff style={{ width: 18, height: 18, color: 'var(--text-muted)' }} />
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{n.nombre}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {n.tipo?.toUpperCase()} · {n.ubicacion ?? 'Sin ubicación'} · ID {n.id}
                    </div>
                  </div>

                  {/* Lecturas */}
                  {on && d && (
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                      {d.temperatura != null && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                          <Thermometer style={{ width: 13, height: 13, color: '#e74c3c' }} />
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{(d.temperatura as number).toFixed(1)}°C</span>
                        </div>
                      )}
                      {d.humedad != null && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                          <Droplets style={{ width: 13, height: 13, color: '#2980b9' }} />
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{(d.humedad as number).toFixed(0)}%</span>
                        </div>
                      )}
                      {d.ph != null && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                          <FlaskConical style={{ width: 13, height: 13, color: '#8e44ad' }} />
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>pH {(d.ph as number).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Badge */}
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                    background: on ? 'rgba(46,125,79,0.1)' : 'rgba(0,0,0,0.05)',
                    color: on ? 'var(--accent)' : 'var(--text-muted)',
                    flexShrink: 0,
                  }}>
                    {on ? 'Online' : 'Offline'}
                  </span>
                  <ChevronRight style={{ width: 15, height: 15, color: 'var(--text-muted)', flexShrink: 0 }} />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
