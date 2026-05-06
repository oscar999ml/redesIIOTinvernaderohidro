'use client'
// components/alarmas/AlarmaItem.tsx
import { Alarma } from '@/types/alarma'
import { useReconocerAlarma } from '@/hooks/useAlarmas'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { fmtTS } from '@/lib/formatters'

const labelVar: Record<string, string> = {
  temperatura: 'Temperatura', humedad: 'Humedad', ph: 'pH',
  nivel_agua: 'Nivel agua', humedad_suelo: 'Hum. suelo', temp_agua: 'Temp. agua',
}

export function AlarmaItem({ alarma }: { alarma: Alarma }) {
  const { mutate, isPending } = useReconocerAlarma()
  const variable = labelVar[alarma.variable] ?? alarma.variable
  const desc = alarma.tipo === 'max'
    ? `${variable} alta: ${alarma.valor.toFixed(1)} > ${alarma.umbral}`
    : `${variable} baja: ${alarma.valor.toFixed(1)} < ${alarma.umbral}`

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl"
      style={{ background: 'var(--danger-dim)', border: '1px solid rgba(192,57,43,0.18)' }}>

      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(192,57,43,0.12)' }}>
        <AlertTriangle className="w-4 h-4" style={{ color: 'var(--danger)' }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {alarma.nodo_nombre ?? `Nodo ${alarma.nodo_id}`}
        </p>
        <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--danger)' }}>{desc}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{fmtTS(alarma.timestamp)}</p>
      </div>

      {!alarma.reconocida && (
        <button
          disabled={isPending}
          onClick={() => mutate(alarma.id)}
          className="shrink-0 p-1.5 rounded-lg transition-all disabled:opacity-40"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--border)', background: 'white' }}
          aria-label="Reconocer alarma"
        >
          <CheckCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
