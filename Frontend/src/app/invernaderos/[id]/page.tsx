'use client'
// app/invernaderos/[id]/page.tsx — Panel de detalle de un invernadero
import { use } from 'react'
import { useInvernadero, useEnviarComandoInvernadero } from '@/hooks/useInvernaderos'
import { useInvernaderoStore } from '@/store/invernaderoStore'
import { LecturaDatos } from '@/types/nodo'
import Link from 'next/link'
import {
  Sprout, ArrowLeft, Thermometer, Droplets, Wind, FlaskConical,
  Zap, Sun, Gauge, Waves, AlertTriangle, Power,
} from 'lucide-react'

// ─── Tipos auxiliares ─────────────────────────────────────────────────────────
interface SensorDef {
  key: keyof LecturaDatos
  label: string
  unit: string
  icon: React.ComponentType<{ style?: React.CSSProperties }>
  min?: number
  max?: number
  warn?: { low?: number; high?: number }
  decimals?: number
}

const SENSORES: SensorDef[] = [
  { key: 'temperatura',   label: 'Temperatura',    unit: '°C',  icon: Thermometer, warn: { high: 35, low: 10 }, decimals: 1 },
  { key: 'humedad',       label: 'Humedad',        unit: '%',   icon: Droplets,    warn: { high: 90, low: 30 }, decimals: 1 },
  { key: 'co2',           label: 'CO₂',            unit: 'ppm', icon: Wind,        warn: { high: 1500 },        decimals: 0 },
  { key: 'luminosidad',   label: 'Luminosidad',    unit: 'lux', icon: Sun,         decimals: 0 },
  { key: 'ph',            label: 'pH',             unit: '',    icon: FlaskConical, warn: { high: 7.5, low: 5.5 }, decimals: 2 },
  { key: 'ec',            label: 'EC',             unit: 'mS/cm', icon: Zap,       warn: { high: 3.5, low: 0.5 }, decimals: 2 },
  { key: 'temp_agua',     label: 'Temp. Agua',     unit: '°C',  icon: Thermometer, warn: { high: 28, low: 14 }, decimals: 1 },
  { key: 'nivel_agua',    label: 'Nivel Agua',     unit: '%',   icon: Waves,       warn: { low: 20 },           decimals: 1 },
  { key: 'humedad_suelo', label: 'Hum. Sustrato',  unit: '%',   icon: Droplets,    warn: { low: 25 },           decimals: 1 },
  { key: 'presion_agua',  label: 'Presión',        unit: 'bar', icon: Gauge,       warn: { high: 4.0, low: 0.5 }, decimals: 2 },
]

const ACTUADORES: { key: keyof LecturaDatos; label: string; color: string }[] = [
  { key: 'led',              label: 'LED',               color: '#f39c12' },
  { key: 'bomba_riego',      label: 'Bomba Riego',       color: '#2980b9' },
  { key: 'ventilador',       label: 'Ventilador',        color: '#27ae60' },
  { key: 'bomba_nutrientes', label: 'Bomba Nutrientes',  color: '#8e44ad' },
  { key: 'calefactor',       label: 'Calefactor',        color: '#e74c3c' },
  { key: 'iluminacion',      label: 'Iluminación',       color: '#f1c40f' },
  { key: 'valvula_agua',     label: 'Válvula Agua',      color: '#16a085' },
]

// ─── Componente: chip de sensor ──────────────────────────────────────────────
function SensorCard({ def, value }: { def: SensorDef; value?: number | null }) {
  const Icon = def.icon
  const na = value == null
  const isWarn = !na && (
    (def.warn?.high != null && value! > def.warn.high) ||
    (def.warn?.low  != null && value! < def.warn.low)
  )
  return (
    <div style={{
      borderRadius: 14, padding: '14px 16px',
      background: isWarn ? 'rgba(230,126,34,0.06)' : 'rgba(255,255,255,0.8)',
      border: isWarn ? '1.5px solid #e67e22' : '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', gap: 6, minWidth: 120,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon style={{ width: 14, height: 14, color: isWarn ? '#e67e22' : 'var(--accent)' }} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{def.label}</span>
        {isWarn && <AlertTriangle style={{ width: 11, height: 11, color: '#e67e22', marginLeft: 'auto' }} />}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: na ? 'var(--text-muted)' : 'var(--text)', lineHeight: 1 }}>
        {na ? '—' : value!.toFixed(def.decimals ?? 1)}
        {!na && <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 3 }}>{def.unit}</span>}
      </div>
    </div>
  )
}

// ─── Componente: toggle de actuador ──────────────────────────────────────────
function ActuadorToggle({
  label, color, active, disabled, onToggle,
}: { label: string; color: string; active: boolean; disabled?: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px', borderRadius: 12, cursor: disabled ? 'not-allowed' : 'pointer',
        border: active ? `1.5px solid ${color}` : '1px solid var(--border)',
        background: active ? `${color}18` : 'rgba(255,255,255,0.8)',
        color: active ? color : 'var(--text-muted)',
        fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <Power style={{ width: 14, height: 14 }} />
      <span>{label}</span>
      <span style={{
        marginLeft: 'auto', width: 28, height: 16, borderRadius: 8,
        background: active ? color : 'var(--border)',
        display: 'inline-block', position: 'relative', transition: 'background 0.2s',
      }}>
        <span style={{
          position: 'absolute', top: 2, left: active ? 14 : 2,
          width: 12, height: 12, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s',
        }} />
      </span>
    </button>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function InvernaderoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = use(params)
  const id = Number(idStr)

  const { isLoading, isError } = useInvernadero(id)
  const inv = useInvernaderoStore((s) => s.invernaderos[id])
  const { mutate: enviarComando, isPending } = useEnviarComandoInvernadero()

  const nodo = inv?.nodos?.[0]
  const lecturas: LecturaDatos = nodo?.ultimaLectura ?? {}

  function toggle(actuador: string) {
    if (!nodo) return
    const actual = !!(lecturas[actuador as keyof LecturaDatos])
    enviarComando({ nodo_id: nodo.id, accion: actuador, valor: actual ? 0 : 1 })
  }

  if (isLoading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
        Cargando invernadero...
      </div>
    )
  }

  if (isError || !inv) {
    return (
      <div style={{ padding: 32 }}>
        <div style={{
          padding: 20, borderRadius: 14, background: '#fef2f2',
          border: '1px solid #fecaca', color: '#dc2626', fontSize: 14,
        }}>
          Invernadero no encontrado o error de conexión.
        </div>
        <Link href="/invernaderos" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, color: 'var(--accent)', fontSize: 14, textDecoration: 'none' }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> Volver
        </Link>
      </div>
    )
  }

  const alarmasCount = inv.alarmas?.length ?? 0

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Breadcrumb */}
      <Link href="/invernaderos" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none', marginBottom: 20 }}>
        <ArrowLeft style={{ width: 13, height: 13 }} /> Invernaderos
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: 'var(--accent-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sprout style={{ width: 28, height: 28, color: 'var(--accent)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{inv.nombre}</h1>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
              {inv.cultivo} {inv.area_m2 ? `· ${inv.area_m2} m²` : ''}
            </div>
          </div>
        </div>
        {alarmasCount > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#fef3e2', color: '#e67e22', border: '1px solid #f5cba7',
            borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 600,
          }}>
            <AlertTriangle style={{ width: 14, height: 14 }} />
            {alarmasCount} alarma{alarmasCount !== 1 ? 's' : ''} activa{alarmasCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Sensores */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
          Sensores
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {SENSORES.map((def) => (
            <SensorCard key={def.key} def={def} value={lecturas[def.key] as number | undefined} />
          ))}
        </div>
      </section>

      {/* Actuadores */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
          Actuadores
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {ACTUADORES.map((act) => (
            <ActuadorToggle
              key={act.key}
              label={act.label}
              color={act.color}
              active={!!(lecturas[act.key])}
              disabled={isPending || !nodo}
              onToggle={() => toggle(act.key)}
            />
          ))}
        </div>
      </section>

      {/* Alarmas activas */}
      {alarmasCount > 0 && (
        <section>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            Alarmas activas
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {inv.alarmas?.map((a) => (
              <div key={a.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 16px', borderRadius: 12,
                background: '#fef3e2', border: '1px solid #f5cba7',
              }}>
                <AlertTriangle style={{ width: 15, height: 15, color: '#e67e22', shrink: 0 } as React.CSSProperties} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, color: '#92400e', fontSize: 13 }}>{a.nodo_nombre} — {a.variable}</span>
                  <span style={{ color: '#b45309', fontSize: 12, marginLeft: 8 }}>
                    {a.valor.toFixed(2)} {a.tipo === 'max' ? '>' : '<'} {a.umbral}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: '#b45309' }}>
                  {new Date(a.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
