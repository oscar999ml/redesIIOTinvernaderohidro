'use client'
// app/personal/page.tsx — Módulo 4: Personal (Turnos, Tareas, Incidencias)
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Users, ClipboardList, AlertTriangle, Clock, Plus, CheckCircle2, Circle } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4001'
const fetchJson = (url: string) => fetch(url).then(r => r.json())

type Tarea = {
  id: number
  titulo: string
  descripcion: string | null
  invernadero_nombre: string | null
  asignado_nombre: string | null
  estado: 'pendiente' | 'en_curso' | 'completada' | 'cancelada'
  prioridad: 'baja' | 'normal' | 'alta' | 'critica'
  creado_en: string
  completado_en: string | null
}

type Incidencia = {
  id: number
  descripcion: string
  invernadero_nombre: string | null
  usuario_nombre: string | null
  estado: 'abierta' | 'en_revision' | 'resuelta'
  timestamp: string
}

type Turno = {
  id: number
  usuario_nombre: string | null
  nodo_nombre: string | null
  inicio: string
  fin: string | null
}

const PRIOR_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  baja:    { label: 'Baja',    color: 'var(--text-muted)', bg: 'transparent'       },
  normal:  { label: 'Normal',  color: 'var(--accent)',     bg: 'var(--accent-dim)' },
  alta:    { label: 'Alta',    color: 'var(--warn)',       bg: 'var(--warn-dim)'   },
  critica: { label: 'Crítica', color: 'var(--danger)',     bg: 'var(--danger-dim)' },
}

const INC_ESTADO_STYLE: Record<string, { label: string; color: string }> = {
  abierta:     { label: 'Abierta',     color: 'var(--danger)' },
  en_revision: { label: 'En revisión', color: 'var(--warn)'   },
  resuelta:    { label: 'Resuelta',    color: 'var(--accent)' },
}

type Tab = 'tareas' | 'incidencias' | 'turnos'

export default function PersonalPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('tareas')

  const { data: tareas      = [] } = useQuery<Tarea[]>({      queryKey: ['tareas'],      queryFn: () => fetchJson(`${API}/api/personal/tareas`),      refetchInterval: 8000 })
  const { data: incidencias = [] } = useQuery<Incidencia[]>({ queryKey: ['incidencias'], queryFn: () => fetchJson(`${API}/api/personal/incidencias`), refetchInterval: 8000 })
  const { data: turnos      = [] } = useQuery<Turno[]>({      queryKey: ['turnos'],      queryFn: () => fetchJson(`${API}/api/personal/turnos`),      refetchInterval: 8000 })

  const [modalTarea,  setModalTarea]  = useState(false)
  const [modalInc,    setModalInc]    = useState(false)
  const [modalTurno,  setModalTurno]  = useState(false)
  const [formTarea,   setFormTarea]   = useState({ titulo: '', descripcion: '', invernadero_id: '', asignado_a: '', prioridad: 'normal' })
  const [formInc,     setFormInc]     = useState({ descripcion: '', invernadero_id: '', nodo_id: '' })
  const [formTurno,   setFormTurno]   = useState({ usuario_id: '', nodo_id: '' })

  const pendientesCount    = tareas.filter(t => t.estado === 'pendiente' || t.estado === 'en_curso').length
  const incAbiertasCount   = incidencias.filter(i => i.estado !== 'resuelta').length
  const turnosActivosCount = turnos.filter(t => !t.fin).length

  async function crearTarea() {
    await fetch(`${API}/api/personal/tareas`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formTarea, invernadero_id: formTarea.invernadero_id || null, asignado_a: Number(formTarea.asignado_a) || null }),
    })
    qc.invalidateQueries({ queryKey: ['tareas'] })
    setModalTarea(false)
    setFormTarea({ titulo: '', descripcion: '', invernadero_id: '', asignado_a: '', prioridad: 'normal' })
  }

  async function cambiarEstadoTarea(id: number, estado: string) {
    const body: Record<string, string> = { estado }
    if (estado === 'completada') body.completado_en = new Date().toISOString()
    await fetch(`${API}/api/personal/tareas/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    qc.invalidateQueries({ queryKey: ['tareas'] })
  }

  async function crearIncidencia() {
    await fetch(`${API}/api/personal/incidencias`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formInc, invernadero_id: formInc.invernadero_id || null, nodo_id: formInc.nodo_id || null }),
    })
    qc.invalidateQueries({ queryKey: ['incidencias'] })
    setModalInc(false)
    setFormInc({ descripcion: '', invernadero_id: '', nodo_id: '' })
  }

  async function cambiarEstadoInc(id: number, estado: string) {
    await fetch(`${API}/api/personal/incidencias/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    })
    qc.invalidateQueries({ queryKey: ['incidencias'] })
  }

  async function crearTurno() {
    await fetch(`${API}/api/personal/turnos`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: Number(formTurno.usuario_id), nodo_id: formTurno.nodo_id ? Number(formTurno.nodo_id) : null }),
    })
    qc.invalidateQueries({ queryKey: ['turnos'] })
    setModalTurno(false)
    setFormTurno({ usuario_id: '', nodo_id: '' })
  }

  async function cerrarTurno(id: number) {
    await fetch(`${API}/api/personal/turnos/${id}/cerrar`, { method: 'PUT' })
    qc.invalidateQueries({ queryKey: ['turnos'] })
  }

  const TABS: { key: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'tareas',      label: 'Tareas',      icon: <ClipboardList className="w-4 h-4" />, count: pendientesCount    },
    { key: 'incidencias', label: 'Incidencias', icon: <AlertTriangle  className="w-4 h-4" />, count: incAbiertasCount   },
    { key: 'turnos',      label: 'Turnos',      icon: <Clock          className="w-4 h-4" />, count: turnosActivosCount },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl" style={{ color: 'var(--text-primary)' }}>Personal</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Gestión de tareas, incidencias y turnos del equipo
          </p>
        </div>
        <div className="flex gap-2">
          {tab === 'tareas'      && <button onClick={() => setModalTarea(true)}  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'var(--accent)' }}><Plus className="w-4 h-4" /> Nueva tarea</button>}
          {tab === 'incidencias' && <button onClick={() => setModalInc(true)}    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'var(--danger)' }}><Plus className="w-4 h-4" /> Reportar</button>}
          {tab === 'turnos'      && <button onClick={() => setModalTurno(true)}  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'var(--accent)' }}><Plus className="w-4 h-4" /> Iniciar turno</button>}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass p-4"><p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Tareas pendientes</p><p className="text-2xl font-bold" style={{ color: 'var(--warn)' }}>{pendientesCount}</p></div>
        <div className="glass p-4"><p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Incidencias abiertas</p><p className="text-2xl font-bold" style={{ color: 'var(--danger)' }}>{incAbiertasCount}</p></div>
        <div className="glass p-4"><p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Turnos activos</p><p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{turnosActivosCount}</p></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all"
            style={tab === t.key ? { background: 'white', color: 'var(--accent)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' } : { color: 'var(--text-muted)' }}>
            {t.icon}
            <span className="hidden sm:block">{t.label}</span>
            {t.count > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                style={{ background: tab === t.key ? 'var(--accent-dim)' : 'var(--border)', color: tab === t.key ? 'var(--accent)' : 'var(--text-muted)' }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAREAS ── */}
      {tab === 'tareas' && (
        <div className="flex flex-col gap-3">
          {tareas.length === 0 ? (
            <div className="glass py-14 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No hay tareas registradas</div>
          ) : tareas.map(t => {
            const p = PRIOR_STYLE[t.prioridad]
            const done = t.estado === 'completada' || t.estado === 'cancelada'
            return (
              <div key={t.id} className="glass p-4 flex flex-wrap items-center gap-3" style={{ opacity: done ? 0.6 : 1 }}>
                <button onClick={() => cambiarEstadoTarea(t.id, done ? 'pendiente' : 'completada')}
                  style={{ color: done ? 'var(--accent)' : 'var(--border-hover)', flexShrink: 0 }}>
                  {done ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none' }}>
                    {t.titulo}
                  </p>
                  {t.descripcion && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{t.descripcion}</p>}
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {t.invernadero_nombre && (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>{t.invernadero_nombre}</span>
                    )}
                    {t.asignado_nombre && (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{t.asignado_nombre}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: p.bg, color: p.color, border: `1px solid ${p.color}40` }}>{p.label}</span>
                  {!done && (
                    <select className="text-xs rounded-lg px-2 py-1 border" value={t.estado}
                      style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'white' }}
                      onChange={e => cambiarEstadoTarea(t.id, e.target.value)}>
                      <option value="pendiente">Pendiente</option>
                      <option value="en_curso">En curso</option>
                      <option value="completada">Completada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── INCIDENCIAS ── */}
      {tab === 'incidencias' && (
        <div className="flex flex-col gap-3">
          {incidencias.length === 0 ? (
            <div className="glass py-14 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No hay incidencias registradas</div>
          ) : incidencias.map(inc => {
            const est = INC_ESTADO_STYLE[inc.estado]
            return (
              <div key={inc.id} className="glass p-4 flex flex-wrap items-start gap-3" style={{ borderLeft: `3px solid ${est.color}` }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{inc.descripcion}</p>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {inc.invernadero_nombre && (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>{inc.invernadero_nombre}</span>
                    )}
                    {inc.usuario_nombre && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>por {inc.usuario_nombre}</span>}
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(inc.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                <select className="text-xs rounded-lg px-2 py-1 border font-medium shrink-0" value={inc.estado}
                  style={{ borderColor: `${est.color}40`, color: est.color, background: 'white' }}
                  onChange={e => cambiarEstadoInc(inc.id, e.target.value)}>
                  <option value="abierta">Abierta</option>
                  <option value="en_revision">En revisión</option>
                  <option value="resuelta">Resuelta</option>
                </select>
              </div>
            )
          })}
        </div>
      )}

      {/* ── TURNOS ── */}
      {tab === 'turnos' && (
        <div className="flex flex-col gap-3">
          {turnos.length === 0 ? (
            <div className="glass py-14 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No hay turnos registrados</div>
          ) : turnos.map(t => {
            const activo = !t.fin
            return (
              <div key={t.id} className="glass p-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: activo ? 'var(--accent)' : 'var(--text-muted)', display: 'inline-block' }} />
                  <Users className="w-4 h-4" style={{ color: activo ? 'var(--accent)' : 'var(--text-muted)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{t.usuario_nombre ?? 'Usuario desconocido'}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.nodo_nombre ?? 'Sin nodo asignado'}</p>
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  <div>Inicio: <span style={{ color: 'var(--text-primary)' }}>{new Date(t.inicio).toLocaleString()}</span></div>
                  {t.fin && <div>Fin: <span style={{ color: 'var(--text-primary)' }}>{new Date(t.fin).toLocaleString()}</span></div>}
                </div>
                {activo && (
                  <button onClick={() => cerrarTurno(t.id)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium ml-auto"
                    style={{ background: 'var(--danger-dim)', color: 'var(--danger)', border: '1px solid rgba(192,57,43,0.2)' }}>
                    Cerrar turno
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal nueva tarea */}
      {modalTarea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
          <div className="glass p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Nueva tarea</h2>
              <button onClick={() => setModalTarea(false)} style={{ color: 'var(--text-muted)' }}>✕</button>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Título *</label>
              <input className="input-field" placeholder="Ej: Revisar bomba de riego"
                value={formTarea.titulo} onChange={e => setFormTarea(p => ({ ...p, titulo: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Descripción</label>
              <textarea className="input-field" rows={2} placeholder="Detalles..."
                value={formTarea.descripcion} onChange={e => setFormTarea(p => ({ ...p, descripcion: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Invernadero ID</label>
                <input className="input-field" placeholder="1, 2 o 3"
                  value={formTarea.invernadero_id} onChange={e => setFormTarea(p => ({ ...p, invernadero_id: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Asignar a (ID)</label>
                <input className="input-field" placeholder="1, 2 o 3"
                  value={formTarea.asignado_a} onChange={e => setFormTarea(p => ({ ...p, asignado_a: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Prioridad</label>
              <select className="input-field" value={formTarea.prioridad} onChange={e => setFormTarea(p => ({ ...p, prioridad: e.target.value }))}>
                <option value="baja">Baja</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setModalTarea(false)} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>Cancelar</button>
              <button onClick={crearTarea} className="btn-primary flex-1 py-2 rounded-xl text-sm font-medium">Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal nueva incidencia */}
      {modalInc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
          <div className="glass p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Reportar incidencia</h2>
              <button onClick={() => setModalInc(false)} style={{ color: 'var(--text-muted)' }}>✕</button>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Descripción *</label>
              <textarea className="input-field" rows={3} placeholder="Describe el problema observado..."
                value={formInc.descripcion} onChange={e => setFormInc(p => ({ ...p, descripcion: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Invernadero ID</label>
                <input className="input-field" placeholder="1, 2 o 3"
                  value={formInc.invernadero_id} onChange={e => setFormInc(p => ({ ...p, invernadero_id: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Nodo ID</label>
                <input className="input-field" placeholder="1, 2 o 3"
                  value={formInc.nodo_id} onChange={e => setFormInc(p => ({ ...p, nodo_id: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setModalInc(false)} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>Cancelar</button>
              <button onClick={crearIncidencia} className="flex-1 py-2 rounded-xl text-sm font-medium text-white" style={{ background: 'var(--danger)' }}>Reportar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal iniciar turno */}
      {modalTurno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
          <div className="glass p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Iniciar turno</h2>
              <button onClick={() => setModalTurno(false)} style={{ color: 'var(--text-muted)' }}>✕</button>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Usuario ID *</label>
              <input className="input-field" placeholder="1=admin, 2=supervisor, 3=operario"
                value={formTurno.usuario_id} onChange={e => setFormTurno(p => ({ ...p, usuario_id: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Nodo asignado (opcional)</label>
              <input className="input-field" placeholder="1, 2 o 3"
                value={formTurno.nodo_id} onChange={e => setFormTurno(p => ({ ...p, nodo_id: e.target.value }))} />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setModalTurno(false)} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>Cancelar</button>
              <button onClick={crearTurno} className="btn-primary flex-1 py-2 rounded-xl text-sm font-medium">Iniciar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
