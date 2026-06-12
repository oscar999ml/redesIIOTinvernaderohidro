'use client'
import { useState } from 'react'
import { useNodosStore } from '@/store/nodosStore'
import { api } from '@/lib/api'
import { Lightbulb, Wifi, WifiOff } from 'lucide-react'

export default function PruebaRapida() {
  const nodo = useNodosStore((s) => s.nodos[1])
  const ledOn = nodo?.ultimaLectura?.led ? true : false
  const online = nodo?.estado === 'online'
  const [sending, setSending] = useState(false)

  const toggle = async () => {
    setSending(true)
    try {
      await api.post('/comandos', { nodo_id: 1, accion: 'set_led', valor: !ledOn })
    } catch {}
    setSending(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      {/* Estado conexión */}
      <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
        style={{
          background: online ? 'rgba(46,125,79,0.1)' : 'rgba(192,57,43,0.08)',
          color: online ? 'var(--accent)' : 'var(--danger)',
          border: `1px solid ${online ? 'rgba(46,125,79,0.2)' : 'rgba(192,57,43,0.2)'}`,
        }}>
        {online ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
        {online ? 'Nodo 1 en línea' : 'Esperando datos del nodo 1...'}
      </div>

      {/* LED Toggle */}
      <button
        onClick={toggle}
        disabled={sending || !online}
        className="relative flex flex-col items-center gap-4 p-12 rounded-3xl transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: ledOn
            ? 'radial-gradient(circle at center, rgba(234,179,8,0.25) 0%, rgba(234,179,8,0.08) 50%, transparent 70%)'
            : 'var(--bg-card)',
          border: `2px solid ${ledOn ? 'rgba(234,179,8,0.4)' : 'var(--border)'}`,
          boxShadow: ledOn
            ? '0 0 60px rgba(234,179,8,0.15), 0 0 120px rgba(234,179,8,0.05)'
            : 'none',
        }}>
        <div className="w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            background: ledOn
              ? 'radial-gradient(circle at 35% 35%, #fbbf24, #d97706)'
              : 'radial-gradient(circle at 35% 35%, #374151, #1f2937)',
            boxShadow: ledOn
              ? '0 0 40px rgba(251,191,36,0.5), inset 0 -4px 12px rgba(0,0,0,0.2)'
              : 'inset 0 -4px 12px rgba(0,0,0,0.4)',
          }}>
          <Lightbulb className="w-10 h-10 transition-all duration-300"
            style={{ color: ledOn ? '#fff' : '#6b7280', filter: ledOn ? 'brightness(1.3)' : 'none' }} />
        </div>

        <div className="text-center">
          <p className="text-lg font-semibold transition-colors"
            style={{ color: ledOn ? 'var(--warn)' : 'var(--text-muted)' }}>
            {ledOn ? 'ENCENDIDO' : 'APAGADO'}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {sending ? 'Enviando...' : `Click para ${ledOn ? 'apagar' : 'encender'} LED`}
          </p>
        </div>
      </button>

      {/* Info nodo */}
      <div className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        <p>Nodo 1 — {nodo?.nombre ?? 'Sin nombre'}</p>
        <p className="mt-0.5">Comando: POST /api/comandos → set_led</p>
      </div>
    </div>
  )
}
