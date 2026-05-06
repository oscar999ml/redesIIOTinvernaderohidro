'use client'
// app/sucursales/page.tsx
import { useState } from 'react'
import { useSucursalesStore } from '@/store/sucursalesStore'
import { Sucursal, EstadoSucursal } from '@/types/sucursal'
import {
  Building2, Plus, Pencil, Trash2, CheckCircle2,
  AlertTriangle, XCircle, Bell, Thermometer, Droplets,
  Radio, Sprout, X,
} from 'lucide-react'

const ESTADO_CONF = {
  ok:          { color: 'var(--accent)',   bg: 'rgba(46,125,79,0.08)',  border: 'rgba(46,125,79,0.2)',   label: 'OK',          icon: CheckCircle2 },
  advertencia: { color: '#b7770d',         bg: 'rgba(183,119,13,0.08)', border: 'rgba(183,119,13,0.25)', label: 'Advertencia', icon: AlertTriangle },
  alarma:      { color: 'var(--danger)',   bg: 'rgba(192,57,43,0.08)',  border: 'rgba(192,57,43,0.2)',   label: 'Alarma',      icon: Bell },
  offline:     { color: 'var(--text-muted)', bg: 'rgba(0,0,0,0.04)',    border: 'rgba(0,0,0,0.08)',      label: 'Offline',     icon: XCircle },
}

const EMPTY: Omit<Sucursal, 'id' | 'nodosOnline' | 'nodosTotal' | 'alarmasActivas' | 'ultimaActualizacion' | 'temperatura' | 'humedad'> = {
  nombre: '', ubicacion: '', numInvernaderos: 1, estado: 'ok',
}

function Modal({ titulo, onClose, children }: { titulo: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onClose}>
      <div className="glass" style={{ borderRadius: 20, padding: '28px 28px', width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{titulo}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function FormSucursal({
  initial, onSave, onCancel,
}: {
  initial?: Partial<Sucursal>
  onSave: (datos: Partial<Sucursal>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({ ...EMPTY, ...initial })
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Nombre</label>
        <input className="input-field" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Ej: Sede Norte" />
      </div>
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Ubicación</label>
        <input className="input-field" value={form.ubicacion} onChange={(e) => set('ubicacion', e.target.value)} placeholder="Ej: Medellín, Colombia" />
      </div>
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Invernaderos</label>
        <input className="input-field" type="number" min={1} value={form.numInvernaderos} onChange={(e) => set('numInvernaderos', Number(e.target.value))} />
      </div>
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Estado inicial</label>
        <select className="input-field" value={form.estado} onChange={(e) => set('estado', e.target.value as EstadoSucursal)}>
          {Object.entries(ESTADO_CONF).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button className="btn-primary" style={{ flex: 1 }} onClick={() => onSave(form)} disabled={!form.nombre.trim()}>
          Guardar
        </button>
        <button onClick={onCancel} style={{
          flex: 1, padding: '0.65rem 1.25rem', borderRadius: 10, fontSize: '0.875rem', fontWeight: 600,
          background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer',
        }}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default function SucursalesPage() {
  const { sucursales, setSucursales, actualizarSucursal } = useSucursalesStore()
  const [modal, setModal] = useState<null | 'crear' | { tipo: 'editar'; s: Sucursal } | { tipo: 'eliminar'; s: Sucursal }>(null)

  const crearSucursal = (datos: Partial<Sucursal>) => {
    const nueva: Sucursal = {
      id: Date.now(),
      nombre: datos.nombre!,
      ubicacion: datos.ubicacion ?? '',
      numInvernaderos: datos.numInvernaderos ?? 1,
      nodosOnline: 0,
      nodosTotal: 0,
      estado: datos.estado ?? 'ok',
      temperatura: 0,
      humedad: 0,
      alarmasActivas: 0,
      ultimaActualizacion: new Date().toISOString(),
    }
    setSucursales([...sucursales, nueva])
    setModal(null)
  }

  const editarSucursal = (id: number, datos: Partial<Sucursal>) => {
    actualizarSucursal(id, datos)
    setModal(null)
  }

  const eliminarSucursal = (id: number) => {
    setSucursales(sucursales.filter((s) => s.id !== id))
    setModal(null)
  }

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1000, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 style={{ width: 22, height: 22, color: 'var(--accent)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Sucursales</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{sucursales.length} sucursal{sucursales.length !== 1 ? 'es' : ''} registrada{sucursales.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setModal('crear')}>
          <Plus style={{ width: 15, height: 15 }} />
          Nueva sucursal
        </button>
      </div>

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {sucursales.map((s) => {
          const e = ESTADO_CONF[s.estado]
          const IconE = e.icon
          return (
            <div key={s.id} className="glass" style={{ borderRadius: 16, padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{s.nombre}</h3>
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700,
                      padding: '2px 9px', borderRadius: 20,
                      background: e.bg, border: `1px solid ${e.border}`, color: e.color,
                    }}>
                      <IconE style={{ width: 10, height: 10 }} />
                      {e.label}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{s.ubicacion}</p>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                    <Sprout style={{ width: 14, height: 14, color: 'var(--accent)' }} />
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.numInvernaderos}</span> invernaderos
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                    <Radio style={{ width: 14, height: 14, color: '#2980b9' }} />
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.nodosOnline}/{s.nodosTotal}</span> nodos
                  </div>
                  {s.estado !== 'offline' && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
                        <Thermometer style={{ width: 13, height: 13, color: '#e74c3c' }} />
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.temperatura}°C</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
                        <Droplets style={{ width: 13, height: 13, color: '#2980b9' }} />
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.humedad}%</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setModal({ tipo: 'editar', s })}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 9, fontSize: 12, fontWeight: 600, background: 'var(--accent-dim)', border: '1px solid var(--border-hover)', color: 'var(--accent)', cursor: 'pointer' }}>
                    <Pencil style={{ width: 13, height: 13 }} />
                    Editar
                  </button>
                  <button
                    onClick={() => setModal({ tipo: 'eliminar', s })}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 9, fontSize: 12, fontWeight: 600, background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.2)', color: 'var(--danger)', cursor: 'pointer' }}>
                    <Trash2 style={{ width: 13, height: 13 }} />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal crear */}
      {modal === 'crear' && (
        <Modal titulo="Nueva sucursal" onClose={() => setModal(null)}>
          <FormSucursal onSave={crearSucursal} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {/* Modal editar */}
      {modal && typeof modal === 'object' && modal.tipo === 'editar' && (
        <Modal titulo="Editar sucursal" onClose={() => setModal(null)}>
          <FormSucursal initial={modal.s} onSave={(d) => editarSucursal(modal.s.id, d)} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {/* Modal confirmar eliminar */}
      {modal && typeof modal === 'object' && modal.tipo === 'eliminar' && (
        <Modal titulo="Eliminar sucursal" onClose={() => setModal(null)}>
          <p style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 20 }}>
            ¿Seguro que deseas eliminar <strong>{modal.s.nombre}</strong>? Esta acción no se puede deshacer.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => eliminarSucursal(modal.s.id)}
              style={{ flex: 1, padding: '0.65rem', borderRadius: 10, fontSize: '0.875rem', fontWeight: 700, background: 'var(--danger)', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Sí, eliminar
            </button>
            <button onClick={() => setModal(null)}
              style={{ flex: 1, padding: '0.65rem', borderRadius: 10, fontSize: '0.875rem', fontWeight: 600, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
