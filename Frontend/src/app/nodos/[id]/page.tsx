'use client'
// app/nodos/[id]/page.tsx
import { useParams } from 'next/navigation'
import { useNodosStore } from '@/store/nodosStore'
import { useAlarmasStore } from '@/store/alarmasStore'
import { useLecturas } from '@/hooks/useAlarmas'
import { NodoStatus } from '@/components/nodos/NodoStatus'
import { SensorValor } from '@/components/sensores/SensorValor'
import { ControlLed } from '@/components/actuadores/ControlLed'
import { AlarmaItem } from '@/components/alarmas/AlarmaItem'
import { GraficaLinea } from '@/components/graficas/GraficaLinea'
import { ArrowLeft, Radio } from 'lucide-react'
import Link from 'next/link'
import { useShallow } from 'zustand/react/shallow'

export default function NodoPage() {
  const { id } = useParams<{ id: string }>()
  const nodoId = parseInt(id)

  const nodo = useNodosStore((s) => s.nodos[nodoId])

  // useShallow evita re-renders cuando el array tiene los mismos elementos
  const alarmas = useAlarmasStore(
    useShallow((s) => s.alarmas.filter((a) => a.nodo_id === nodoId && a.activa))
  )

  const { data: lecturas = [] } = useLecturas(nodoId, 60) as { data: any[] }

  if (!nodo) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'var(--accent-dim)', border: '1px solid var(--border-hover)' }}>
          <Radio className="w-7 h-7" style={{ color: 'var(--accent)' }} />
        </div>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          Nodo {nodoId} no encontrado
        </p>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          Sin datos aún — espera que el simulador envíe datos
        </p>
        <Link href="/"
          className="text-sm font-medium flex items-center gap-1.5 transition-colors"
          style={{ color: 'var(--accent)' }}>
          <ArrowLeft className="w-4 h-4" /> Volver al dashboard
        </Link>
      </div>
    )
  }

  const d = nodo.ultimaLectura

  return (
    <div className="space-y-6 max-w-4xl mx-auto stagger">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/"
            className="mt-1 p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-display text-xl md:text-2xl" style={{ color: 'var(--text-primary)' }}>
              {nodo.nombre}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {nodo.ubicacion ?? 'Sin ubicación'} · Nodo #{nodoId}
            </p>
          </div>
        </div>
        <NodoStatus estado={nodo.estado} ultimoUpdate={nodo.ultimoUpdate} />
      </div>

      {/* Alarmas del nodo */}
      {alarmas.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--danger)' }}>
            Alarmas activas en este nodo
          </h2>
          <div className="flex flex-col gap-2">
            {alarmas.map((a) => <AlarmaItem key={a.id} alarma={a} />)}
          </div>
        </section>
      )}

      {/* Sensores */}
      <section>
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
          Sensores en tiempo real
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <SensorValor label="Temperatura"  valor={d?.temperatura}   unidad="°C" icono="🌡️" />
          <SensorValor label="Humedad"       valor={d?.humedad}       unidad="%"  icono="💧" />
          <SensorValor label="pH"            valor={d?.ph}            unidad=""   icono="⚗️" dec={2} />
          <SensorValor label="Nivel agua"    valor={d?.nivel_agua}    unidad="%"  icono="🪣" />
          <SensorValor label="Hum. suelo"    valor={d?.humedad_suelo} unidad="%"  icono="🌱" />
          <SensorValor label="Temp. agua"    valor={d?.temp_agua}     unidad="°C" icono="🌊" />
        </div>
      </section>

      {/* Actuadores */}
      <section>
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
          Control de actuadores
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ControlLed nodoId={nodoId} estado={!!d?.led} />
        </div>
      </section>

      {/* Gráfica */}
      {lecturas.length > 1 && (
        <section>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
            Últimas 60 lecturas
          </h2>
          <div className="glass p-4">
            <GraficaLinea
              datos={lecturas.slice().reverse()}
              variables={['temperatura', 'humedad']}
            />
          </div>
        </section>
      )}
    </div>
  )
}
