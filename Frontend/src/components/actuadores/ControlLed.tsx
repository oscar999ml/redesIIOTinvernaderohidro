'use client'
// components/actuadores/ControlLed.tsx
import { Toggle } from '@/components/ui/Toggle'
import { useEnviarComando } from '@/hooks/useNodos'
import { Lightbulb } from 'lucide-react'
import toast from 'react-hot-toast'

export function ControlLed({ nodoId, estado }: { nodoId: number; estado?: boolean }) {
  const { mutate, isPending } = useEnviarComando()

  const toggle = (valor: boolean) => {
    mutate(
      { nodo_id: nodoId, accion: 'set_led', valor },
      {
        onSuccess: () => toast.success(`LED ${valor ? 'encendido' : 'apagado'}`),
        onError:   () => toast.error('Error al enviar comando'),
      }
    )
  }

  return (
    <div className="glass p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: estado ? 'rgba(183,119,13,0.12)' : 'var(--accent-dim)', border: '1px solid var(--border)' }}>
          <Lightbulb className="w-5 h-5"
            style={{ color: estado ? 'var(--warn)' : 'var(--text-muted)' }} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>LED</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {estado ? 'Encendido' : 'Apagado'}
          </p>
        </div>
      </div>
      <Toggle checked={!!estado} onChange={toggle} disabled={isPending} />
    </div>
  )
}
