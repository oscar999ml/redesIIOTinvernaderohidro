// components/sensores/SensorValor.tsx
import { fmt } from '@/lib/formatters'

export function SensorValor({ label, valor, unidad, icono, alerta, dec = 1 }: {
  label: string
  valor?: number | null
  unidad?: string
  icono?: string
  alerta?: boolean
  dec?: number
}) {
  const sinDato = valor === undefined || valor === null
  return (
    <div className="sensor-chip"
      style={alerta ? { borderColor: 'rgba(248,113,113,0.35)', background: 'rgba(248,113,113,0.06)' } : {}}>
      <div className="flex items-center gap-1.5 mb-1">
        {icono && <span className="text-sm leading-none">{icono}</span>}
        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{label}</p>
      </div>
      <p className="text-lg font-mono font-bold leading-tight"
        style={{ color: sinDato ? 'var(--text-muted)' : alerta ? 'var(--danger)' : 'var(--text-primary)' }}>
        {sinDato ? '--' : fmt(valor, dec)}
        {!sinDato && unidad && (
          <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>{unidad}</span>
        )}
      </p>
    </div>
  )
}
