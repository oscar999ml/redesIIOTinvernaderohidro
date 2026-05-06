'use client'
// components/nodos/NodoStatus.tsx
import { Badge } from '@/components/ui/Badge'
import { Nodo } from '@/types/nodo'

export function NodoStatus({ estado, ultimoUpdate }: {
  estado: Nodo['estado']
  ultimoUpdate?: Date
}) {
  const label = { online: 'Online', offline: 'Offline', alerta: 'Alerta' }[estado]
  const variant = estado as 'online' | 'offline' | 'alerta'

  return (
    <div className="flex flex-col items-end gap-0.5">
      <Badge variant={variant}>{label}</Badge>
      {ultimoUpdate && (
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {ultimoUpdate.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      )}
    </div>
  )
}
