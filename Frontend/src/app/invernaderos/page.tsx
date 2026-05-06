'use client'
// app/invernaderos/page.tsx — Lista de Invernaderos A, B, C
import { useInvernaderos } from '@/hooks/useInvernaderos'
import { useInvernaderoStore } from '@/store/invernaderoStore'
import { Invernadero } from '@/types/invernadero'
import Link from 'next/link'
import { Sprout, AlertTriangle, Wifi, WifiOff, ChevronRight, Leaf } from 'lucide-react'

function estadoInvernadero(inv: Invernadero): 'online' | 'offline' | 'alerta' {
  if (!inv.nodos?.length) return 'offline'
  const tieneAlarma = (inv.alarmas?.length ?? 0) > 0
  const algOnline = inv.nodos.some((n) => n.estado === 'online')
  if (!algOnline) return 'offline'
  return tieneAlarma ? 'alerta' : 'online'
}

const ESTADO_COLOR: Record<string, string> = {
  online:  'var(--accent)',
  offline: 'var(--text-muted)',
  alerta:  '#e67e22',
}

function SensorChipSmall({ label, value, unit }: { label: string; value?: number | null; unit: string }) {
  if (value == null) return null
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '6px 10px', borderRadius: 10,
      background: 'rgba(46,125,79,0.06)', border: '1px solid var(--border)',
      minWidth: 60,
    }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
        {value.toFixed(1)}<span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 2 }}>{unit}</span>
      </span>
    </div>
  )
}

function InvernaderoCard({ inv }: { inv: Invernadero }) {
  const estado = estadoInvernadero(inv)
  const lecturas = inv.nodos?.[0]?.ultimaLectura
  const alarmasCount = inv.alarmas?.length ?? 0

  return (
    <Link href={`/invernaderos/${inv.id}`} style={{ textDecoration: 'none' }}>
      <div className="glass" style={{
        borderRadius: 20, padding: '24px 28px', cursor: 'pointer',
        transition: 'box-shadow 0.2s, transform 0.15s',
        border: estado === 'alerta' ? '1.5px solid #e67e22' : '1px solid var(--border)',
      }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(46,125,79,0.13)'
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = ''
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = ''
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'var(--accent-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sprout style={{ width: 24, height: 24, color: 'var(--accent)' }} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{inv.nombre}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{inv.descripcion}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {alarmasCount > 0 && (
              <span style={{
                background: '#fef3e2', color: '#e67e22', border: '1px solid #f5cba7',
                borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <AlertTriangle style={{ width: 12, height: 12 }} />
                {alarmasCount}
              </span>
            )}
            <ChevronRight style={{ width: 18, height: 18, color: 'var(--text-muted)' }} />
          </div>
        </div>

        {/* Cultivo + área */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          {inv.cultivo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
              <Leaf style={{ width: 14, height: 14, color: 'var(--accent)' }} />
              {inv.cultivo}
            </div>
          )}
          {inv.area_m2 && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {inv.area_m2} m²
            </div>
          )}
        </div>

        {/* Sensores rápidos */}
        {lecturas && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            <SensorChipSmall label="Temp." value={lecturas.temperatura} unit="°C" />
            <SensorChipSmall label="Humedad" value={lecturas.humedad} unit="%" />
            <SensorChipSmall label="pH" value={lecturas.ph} unit="" />
            <SensorChipSmall label="CO₂" value={lecturas.co2} unit="ppm" />
            <SensorChipSmall label="EC" value={lecturas.ec} unit="mS" />
            <SensorChipSmall label="Nivel" value={lecturas.nivel_agua} unit="%" />
          </div>
        )}

        {/* Footer estado */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {estado === 'offline'
              ? <WifiOff style={{ width: 14, height: 14, color: ESTADO_COLOR[estado] }} />
              : <Wifi style={{ width: 14, height: 14, color: ESTADO_COLOR[estado] }} />
            }
            <span style={{ fontSize: 13, color: ESTADO_COLOR[estado], fontWeight: 600, textTransform: 'capitalize' }}>
              {estado}
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {inv.nodos?.length ?? 0} nodo{inv.nodos?.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function InvernaderoListPage() {
  const { isLoading, isError } = useInvernaderos()
  const lista = useInvernaderoStore((s) => s.invernaderosList)

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Encabezado */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <Sprout style={{ width: 28, height: 28, color: 'var(--accent)' }} />
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
            Invernaderos
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
          Monitoreo en tiempo real de los {lista.length || 3} invernaderos de la sede central.
        </p>
      </div>

      {isLoading && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          Cargando invernaderos...
        </div>
      )}

      {isError && (
        <div style={{
          padding: 20, borderRadius: 14, background: '#fef2f2',
          border: '1px solid #fecaca', color: '#dc2626', fontSize: 14,
        }}>
          Error al cargar los invernaderos. Asegura que el backend está corriendo en el puerto 4001.
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 20,
      }}>
        {lista.map((inv) => (
          <InvernaderoCard key={inv.id} inv={inv} />
        ))}
      </div>
    </div>
  )
}
