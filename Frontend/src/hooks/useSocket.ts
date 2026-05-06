'use client'
// hooks/useSocket.ts
import { useEffect } from 'react'
import { getSocket } from '@/lib/socket'
import { useNodosStore } from '@/store/nodosStore'
import { useAlarmasStore } from '@/store/alarmasStore'
import { useSistemaStore } from '@/store/sistemaStore'
import { useInvernaderoStore } from '@/store/invernaderoStore'

export function useSocket() {
  const actualizarNodo        = useNodosStore((s) => s.actualizarNodo)
  const agregarAlarma         = useAlarmasStore((s) => s.agregarAlarma)
  const setSerial             = useSistemaStore((s) => s.setSerial)
  const setBackend            = useSistemaStore((s) => s.setBackend)
  const actualizarLectura     = useInvernaderoStore((s) => s.actualizarLectura)

  useEffect(() => {
    const socket = getSocket()
    socket.connect()
    setBackend(true)

    socket.on('nodo:estado', (payload) => {
      actualizarNodo(payload.nodo_id, payload.datos)
      actualizarLectura(payload.nodo_id, payload.datos)
    })

    socket.on('alarma:nueva', (alarma) => {
      agregarAlarma(alarma)
      // Beep sintético vía Web Audio API (sin archivo externo)
      try {
        const ctx = new AudioContext()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = 880
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.4)
      } catch {}
    })

    socket.on('sistema:serial', (info) => {
      setSerial(info.conectado)
    })

    socket.on('connect', () => setBackend(true))
    socket.on('disconnect', () => setBackend(false))

    return () => {
      socket.off('nodo:estado')
      socket.off('alarma:nueva')
      socket.off('sistema:serial')
      socket.off('connect')
      socket.off('disconnect')
      socket.disconnect()
    }
  }, [actualizarNodo, agregarAlarma, setSerial, setBackend, actualizarLectura])
}
