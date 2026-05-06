'use client'
// app/automatizacion/page.tsx
import { useState } from 'react'
import { Zap, Plus, ToggleLeft, ToggleRight, Trash2, X } from 'lucide-react'

type Operador = '>' | '<' | '>=' | '<=' | '=='
type Accion = 'activar' | 'desactivar'

interface Regla {
  id: number
  variable: string
  operador: Operador
  umbral: number
  accionActuador: string
  accion: Accion
  activa: boolean
  descripcion: string
}

const VARIABLES_S = ['temperatura', 'humedad', 'ph', 'ec', 'co2', 'nivel_agua', 'presion_agua']
const ACTUADORES_S = ['ventilador', 'bomba_riego', 'bomba_nutrientes', 'calefactor', 'iluminacion', 'valvula_agua', 'led']
const OPERADORES: Operador[] = ['>', '<', '>=', '<=', '==']

const MOCK_REGLAS: Regla[] = [
  { id: 1, variable: 'temperatura', operador: '>', umbral: 35, accionActuador: 'ventilador',    accion: 'activar',    activa: true,  descripcion: 'SI temperatura > 35°C → activar ventilador' },
  { id: 2, variable: 'temperatura', operador: '<', umbral: 15, accionActuador: 'calefactor',    accion: 'activar',    activa: true,  descripcion: 'SI temperatura < 15°C → activar calefactor' },
  { id: 3, variable: 'nivel_agua',  operador: '<', umbral: 20, accionActuador: 'bomba_riego',   accion: 'activar',    activa: false, descripcion: 'SI nivel_agua < 20% → activar bomba riego' },
  { id: 4, variable: 'co2',         operador: '>', umbral: 1400, accionActuador: 'ventilador',  accion: 'activar',    activa: true,  descripcion: 'SI CO₂ > 1400ppm → activar ventilador' },
]

function buildDesc(r: Partial<Regla>) {
  if (!r.variable || !r.operador || !r.accionActuador || !r.accion) return ''
  return `SI ${r.variable} ${r.operador} ${r.umbral ?? 0} → ${r.accion} ${r.accionActuador}`
}

function Modal({ titulo, onClose, children }: { titulo: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div className="glass" style={{ borderRadius: 20, padding: '28px', width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{titulo}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X style={{ width: 18, height: 18 }} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function AutomatizacionPage() {
  const [reglas, setReglas] = useState<Regla[]>(MOCK_REGLAS)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<Partial<Regla>>({ variable: 'temperatura', operador: '>', umbral: 30, accionActuador: 'ventilador', accion: 'activar', activa: true })

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const guardar = () => {
    if (!form.variable || !form.accionActuador) return
    const nueva: Regla = {
      id: Date.now(),
      variable: form.variable!,
      operador: form.operador ?? '>',
      umbral: form.umbral ?? 0,
      accionActuador: form.accionActuador!,
      accion: form.accion ?? 'activar',
      activa: true,
      descripcion: buildDesc(form),
    }
    setReglas((r) => [...r, nueva])
    setModal(false)
  }

  const toggle = (id: number) => setReglas((rs) => rs.map((r) => r.id === id ? { ...r, activa: !r.activa } : r))
  const eliminar = (id: number) => setReglas((rs) => rs.filter((r) => r.id !== id))

  return (
    <div style={{ padding: '32px 28px', maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap style={{ width: 22, height: 22, color: 'var(--accent)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Automatización</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{reglas.filter((r) => r.activa).length} reglas activas de {reglas.length}</p>
          </div>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setModal(true)}>
          <Plus style={{ width: 15, height: 15 }} /> Nueva regla
        </button>
      </div>

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {reglas.map((r) => (
          <div key={r.id} className="glass" style={{ borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, opacity: r.activa ? 1 : 0.55, transition: 'opacity 0.2s' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: r.activa ? 'var(--accent-dim)' : 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Zap style={{ width: 16, height: 16, color: r.activa ? 'var(--accent)' : 'var(--text-muted)' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{r.descripcion}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'flex', gap: 12 }}>
                <span>Variable: <strong>{r.variable}</strong></span>
                <span>Actuador: <strong>{r.accionActuador}</strong></span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <button onClick={() => toggle(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: r.activa ? 'var(--accent)' : 'var(--text-muted)' }}>
                {r.activa
                  ? <ToggleRight style={{ width: 28, height: 28 }} />
                  : <ToggleLeft style={{ width: 28, height: 28 }} />
                }
              </button>
              <button onClick={() => eliminar(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                <Trash2 style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        ))}
        {reglas.length === 0 && (
          <div className="glass" style={{ borderRadius: 16, padding: '48px 24px', textAlign: 'center' }}>
            <Zap style={{ width: 32, height: 32, color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>Sin reglas configuradas.</p>
          </div>
        )}
      </div>

      {/* Modal nueva regla */}
      {modal && (
        <Modal titulo="Nueva regla de automatización" onClose={() => setModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Variable sensora</label>
              <select className="input-field" value={form.variable} onChange={(e) => set('variable', e.target.value)}>
                {VARIABLES_S.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Condición</label>
                <select className="input-field" value={form.operador} onChange={(e) => set('operador', e.target.value)}>
                  {OPERADORES.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Umbral</label>
                <input className="input-field" type="number" value={form.umbral} onChange={(e) => set('umbral', Number(e.target.value))} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Actuador</label>
              <select className="input-field" value={form.accionActuador} onChange={(e) => set('accionActuador', e.target.value)}>
                {ACTUADORES_S.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Acción</label>
              <select className="input-field" value={form.accion} onChange={(e) => set('accion', e.target.value as Accion)}>
                <option value="activar">Activar</option>
                <option value="desactivar">Desactivar</option>
              </select>
            </div>
            {/* Preview */}
            {buildDesc(form) && (
              <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--accent-dim)', border: '1px solid var(--border-hover)', fontFamily: 'monospace', fontSize: 13, color: 'var(--accent)' }}>
                {buildDesc(form)}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={guardar}>Crear regla</button>
              <button onClick={() => setModal(false)} style={{ flex: 1, padding: '0.65rem', borderRadius: 10, fontSize: '0.875rem', fontWeight: 600, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}>Cancelar</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
