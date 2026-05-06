'use client'
// app/page.tsx — Dashboard principal
import { useNodosStore } from '@/store/nodosStore'
import { useAlarmasStore } from '@/store/alarmasStore'
import { NodoCard } from '@/components/nodos/NodoCard'
import { AlarmaItem } from '@/components/alarmas/AlarmaItem'
import { useSistemaStore } from '@/store/sistemaStore'
import { Radio } from 'lucide-react'

export default function Dashboard() {
  const nodos        = useNodosStore((s) => s.nodosArray)
  const nodosOnline  = useNodosStore((s) => s.nodosOnlineCount)
  const alarmas      = useAlarmasStore((s) => s.alarmas)
  const alarmasCount = useAlarmasStore((s) => s.alarmasActivasCount)
  const backend      = useSistemaStore((s) => s.backendOnline)

  const alarmasActivas = alarmas.filter((a) => a.activa && !a.reconocida)

  return (
    <div className="space-y-6 stagger max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl" style={{ color: 'var(--text-primary)' }}>
            Panel de Control
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {nodos.length} nodo{nodos.length !== 1 ? 's' : ''} registrado{nodos.length !== 1 ? 's' : ''}
            {' · '}
            <span style={{ color: nodosOnline > 0 ? 'var(--accent)' : 'var(--text-muted)' }}>
              {nodosOnline} en línea
            </span>
          </p>
        </div>

        {!backend && (
          <div className="text-xs px-3 py-1.5 rounded-lg font-medium"
            style={{ background: 'var(--warn-dim)', border: '1px solid rgba(183,119,13,0.25)', color: 'var(--warn)' }}>
            Sin conexión al backend
          </div>
        )}
      </div>

      {/* Alarmas activas */}
      {alarmasCount > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="pulse-dot" />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>
              Alarmas activas ({alarmasCount})
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            {alarmasActivas.slice(0, 3).map((a) => (
              <AlarmaItem key={a.id} alarma={a} />
            ))}
            {alarmasCount > 3 && (
              <a href="/alarmas"
                className="block text-xs text-center py-2.5 rounded-xl font-medium transition-colors"
                style={{ color: 'var(--text-muted)', border: '1px dashed var(--border)' }}>
                Ver {alarmasCount - 3} alarma{alarmasCount - 3 > 1 ? 's' : ''} más →
              </a>
            )}
          </div>
        </section>
      )}

      {/* Grid de nodos */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Radio className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
            Nodos PLC — ESP8266
          </h2>
        </div>

        {nodos.length === 0 ? (
          <div className="glass flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'var(--accent-dim)', border: '1px solid var(--border-hover)' }}>
              <Radio className="w-7 h-7" style={{ color: 'var(--accent)' }} />
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              Esperando datos del backend
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Asegúrate de que el backend esté corriendo en el puerto 4001
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
            {nodos.map((n) => (
              <NodoCard key={n.id} nodoId={n.id} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
