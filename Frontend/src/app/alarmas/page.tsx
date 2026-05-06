'use client'
// app/alarmas/page.tsx
import { useAlarmasStore } from '@/store/alarmasStore'
import { AlarmaItem } from '@/components/alarmas/AlarmaItem'
import { useAlarmasActivas } from '@/hooks/useAlarmas'
import { Spinner } from '@/components/ui/Spinner'

export default function AlarmasPage() {
  const { isLoading } = useAlarmasActivas()
  const alarmas = useAlarmasStore((s) => s.alarmas)
  const activas = alarmas.filter((a) => a.activa && !a.reconocida)
  const reconocidas = alarmas.filter((a) => a.reconocida || !a.activa)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-100">Alarmas</h1>
        <p className="text-sm text-gray-500">Gestión de alarmas del sistema</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : (
        <>
          <section>
            <h2 className="text-sm font-semibold text-red-400 mb-3">
              Activas ({activas.length})
            </h2>
            {activas.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <p className="text-3xl mb-2">✅</p>
                <p className="text-sm">Sin alarmas activas</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activas.map((a) => <AlarmaItem key={a.id} alarma={a} />)}
              </div>
            )}
          </section>

          {reconocidas.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 mb-3">
                Reconocidas/resueltas ({reconocidas.length})
              </h2>
              <div className="space-y-2 opacity-60">
                {reconocidas.slice(0, 20).map((a) => <AlarmaItem key={a.id} alarma={a} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
