'use client'
// components/nodos/NodoCard.tsx
import Link from 'next/link'
import { useNodosStore } from '@/store/nodosStore'
import { NodoStatus } from './NodoStatus'
import { SensorValor } from '@/components/sensores/SensorValor'
import { Lightbulb, ChevronRight } from 'lucide-react'

export function NodoCard({ nodoId }: { nodoId: number }) {
  const nodo = useNodosStore((s) => s.nodos[nodoId])
  if (!nodo) return null
  const d = nodo.ultimaLectura

  return (
    <Link href={`/nodos/${nodoId}`} className="block group">
      <div className="glass p-4 h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-4 gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm truncate transition-colors group-hover:underline"
                style={{ color: 'var(--text-primary)' }}>
                {nodo.nombre}
              </h3>
              <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--accent)' }} />
            </div>
            <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {nodo.ubicacion ?? 'Sin ubicación'}
            </p>
          </div>
          <NodoStatus estado={nodo.estado} ultimoUpdate={nodo.ultimoUpdate} />
        </div>

        {/* Sensores 2x2 */}
        <div className="grid grid-cols-2 gap-2">
          <SensorValor label="Temperatura" valor={d?.temperatura} unidad="°C" icono="🌡️" />
          <SensorValor label="Humedad"     valor={d?.humedad}     unidad="%"  icono="💧" />
          <SensorValor label="pH"          valor={d?.ph}          unidad=""   icono="⚗️" dec={2} />
          <SensorValor label="Nivel agua"  valor={d?.nivel_agua}  unidad="%"  icono="🪣" />
        </div>

        {/* LED */}
        {d?.led !== undefined && (
          <div className="mt-3 pt-3 flex items-center gap-2 text-xs"
            style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <Lightbulb className="w-3.5 h-3.5"
              style={{ color: d.led ? 'var(--warn)' : 'var(--text-muted)' }} />
            <span>{d.led ? 'LED encendido' : 'LED apagado'}</span>
          </div>
        )}
      </div>
    </Link>
  )
}
