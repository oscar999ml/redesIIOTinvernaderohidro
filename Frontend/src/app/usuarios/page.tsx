'use client'
// app/usuarios/page.tsx
import { useState } from 'react'
import { Users, Plus, Pencil, Trash2, X, ShieldCheck, Eye, Settings } from 'lucide-react'

type Rol = 'admin' | 'supervisor' | 'operario'

interface Usuario {
  id: number
  nombre: string
  usuario: string
  rol: Rol
  sede_id: string
  activo: boolean
}

const ROL_CONF: Record<Rol, { label: string; color: string; bg: string; icon: React.ComponentType<{ style?: React.CSSProperties }> }> = {
  admin:      { label: 'Administrador', color: '#8e44ad', bg: 'rgba(142,68,173,0.08)', icon: ShieldCheck },
  supervisor: { label: 'Supervisor',    color: '#2980b9', bg: 'rgba(41,128,185,0.08)', icon: Eye },
  operario:   { label: 'Operario',      color: '#27ae60', bg: 'rgba(39,174,96,0.08)',  icon: Settings },
}

const MOCK: Usuario[] = [
  { id: 1, nombre: 'Administrador',    usuario: 'admin',      rol: 'admin',      sede_id: 'central', activo: true },
  { id: 2, nombre: 'Supervisor Alpha', usuario: 'supervisor', rol: 'supervisor', sede_id: 'central', activo: true },
  { id: 3, nombre: 'Operario Juan',    usuario: 'operario1',  rol: 'operario',   sede_id: 'central', activo: true },
]

function Modal({ titulo, onClose, children }: { titulo: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div className="glass" style={{ borderRadius: 20, padding: '28px', width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{titulo}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X style={{ width: 18, height: 18 }} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function FormUsuario({ initial, onSave, onCancel }: { initial?: Partial<Usuario>; onSave: (d: Partial<Usuario>) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Partial<Usuario>>({ nombre: '', usuario: '', rol: 'operario', sede_id: 'central', activo: true, ...initial })
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[{ k: 'nombre', label: 'Nombre completo', ph: 'Ej: Juan García' }, { k: 'usuario', label: 'Usuario (login)', ph: 'Ej: jgarcia' }].map(({ k, label, ph }) => (
        <div key={k}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{label}</label>
          <input className="input-field" value={(form as Record<string, string>)[k] ?? ''} onChange={(e) => set(k, e.target.value)} placeholder={ph} />
        </div>
      ))}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Rol</label>
        <select className="input-field" value={form.rol} onChange={(e) => set('rol', e.target.value)}>
          <option value="admin">Administrador</option>
          <option value="supervisor">Supervisor</option>
          <option value="operario">Operario</option>
        </select>
      </div>
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Sede</label>
        <input className="input-field" value={form.sede_id ?? ''} onChange={(e) => set('sede_id', e.target.value)} placeholder="central" />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-primary" style={{ flex: 1 }} onClick={() => onSave(form)} disabled={!form.nombre?.trim() || !form.usuario?.trim()}>Guardar</button>
        <button onClick={onCancel} style={{ flex: 1, padding: '0.65rem', borderRadius: 10, fontSize: '0.875rem', fontWeight: 600, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}>Cancelar</button>
      </div>
    </div>
  )
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(MOCK)
  const [modal, setModal] = useState<null | 'crear' | { tipo: 'editar'; u: Usuario } | { tipo: 'eliminar'; u: Usuario }>(null)

  const crear = (d: Partial<Usuario>) => {
    setUsuarios((us) => [...us, { id: Date.now(), nombre: d.nombre!, usuario: d.usuario!, rol: d.rol ?? 'operario', sede_id: d.sede_id ?? 'central', activo: true }])
    setModal(null)
  }
  const editar = (id: number, d: Partial<Usuario>) => {
    setUsuarios((us) => us.map((u) => u.id === id ? { ...u, ...d } : u))
    setModal(null)
  }
  const eliminar = (id: number) => {
    setUsuarios((us) => us.filter((u) => u.id !== id))
    setModal(null)
  }

  return (
    <div style={{ padding: '32px 28px', maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users style={{ width: 22, height: 22, color: 'var(--accent)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Usuarios</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} registrado{usuarios.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setModal('crear')}>
          <Plus style={{ width: 15, height: 15 }} /> Nuevo usuario
        </button>
      </div>

      {/* Resumen por rol */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
        {(Object.entries(ROL_CONF) as [Rol, typeof ROL_CONF[Rol]][]).map(([rol, conf]) => {
          const count = usuarios.filter((u) => u.rol === rol).length
          const Icon = conf.icon
          return (
            <div key={rol} className="glass" style={{ borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: conf.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon style={{ width: 16, height: 16, color: conf.color }} />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{count}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{conf.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {usuarios.map((u) => {
          const conf = ROL_CONF[u.rol]
          const Icon = conf.icon
          return (
            <div key={u.id} className="glass" style={{ borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: conf.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon style={{ width: 18, height: 18, color: conf.color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{u.nombre}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  @{u.usuario} · Sede: {u.sede_id}
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: conf.bg, color: conf.color, flexShrink: 0 }}>
                {conf.label}
              </span>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => setModal({ tipo: 'editar', u })} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'var(--accent-dim)', border: '1px solid var(--border-hover)', color: 'var(--accent)', cursor: 'pointer' }}>
                  <Pencil style={{ width: 12, height: 12 }} /> Editar
                </button>
                <button onClick={() => setModal({ tipo: 'eliminar', u })} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.2)', color: 'var(--danger)', cursor: 'pointer' }}>
                  <Trash2 style={{ width: 12, height: 12 }} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {modal === 'crear' && <Modal titulo="Nuevo usuario" onClose={() => setModal(null)}><FormUsuario onSave={crear} onCancel={() => setModal(null)} /></Modal>}
      {modal && typeof modal === 'object' && modal.tipo === 'editar' && (
        <Modal titulo="Editar usuario" onClose={() => setModal(null)}>
          <FormUsuario initial={modal.u} onSave={(d) => editar(modal.u.id, d)} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal && typeof modal === 'object' && modal.tipo === 'eliminar' && (
        <Modal titulo="Eliminar usuario" onClose={() => setModal(null)}>
          <p style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 20 }}>¿Eliminar a <strong>{modal.u.nombre}</strong>?</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => eliminar(modal.u.id)} style={{ flex: 1, padding: '0.65rem', borderRadius: 10, fontSize: '0.875rem', fontWeight: 700, background: 'var(--danger)', color: '#fff', border: 'none', cursor: 'pointer' }}>Eliminar</button>
            <button onClick={() => setModal(null)} style={{ flex: 1, padding: '0.65rem', borderRadius: 10, fontSize: '0.875rem', fontWeight: 600, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }}>Cancelar</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
