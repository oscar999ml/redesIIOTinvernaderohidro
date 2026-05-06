'use client'
// app/produccion/page.tsx — Módulo 3: Lotes de Producción
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, CheckCircle2, XCircle, Clock, Leaf } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4001'
const fetchJson = (url: string) => fetch(url).then(r => r.json())

type Lote = {
  id: number
  codigo: string
  cultivo: string
  invernadero_id: number | null
  invernadero_nombre: string | null
  nodo_nombre: string | null
  fecha_inicio: string
  fecha_cosecha: string | null
  kg_cosechados: number | null
  estado: 'activo' | 'cosechado' | 'perdido'
  notas: string | null
}

const ESTADO_STYLE: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  activo:    { label: 'Activo',    color: 'var(--accent)', icon: <Clock className="w-3.5 h-3.5" /> },
  cosechado: { label: 'Cosechado', color: '#2563eb',       icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  perdido:   { label: 'Perdido',   color: 'var(--danger)', icon: <XCircle className="w-3.5 h-3.5" /> },
}

const ESTADO_BG: Record<string, string> = {
  activo:    'var(--accent-dim)',
  cosechado: 'rgba(37,99,235,0.08)',
  perdido:   'var(--danger-dim)',
}

export default function ProduccionPage() {
  const qc = useQueryClient()
  const { data: lotes = [], isLoading } = useQuery<Lote[]>({
    queryKey: ['lotes'],
    queryFn: () => fetchJson(`${API}/api/lotes`),
    refetchInterval: 10000,
  })

  const [filtro, setFiltro]           = useState<string>('todos')
  const [modal, setModal]             = useState(false)
  const [form, setForm]               = useState({ codigo: '', cultivo: '', invernadero_id: '', nodo_id: '', fecha_inicio: '', notas: '' })
  const [cosechaModal, setCosechaModal] = useState<Lote | null>(null)
  const [cosechaForm, setCosechaForm] = useState({ fecha_cosecha: '', kg_cosechados: '' })

  const lotesFiltered  = filtro === 'todos' ? lotes : lotes.filter(l => l.estado === filtro)
  const activosCount   = lotes.filter(l => l.estado === 'activo').length
  const cosechadoCount = lotes.filter(l => l.estado === 'cosechado').length
  const perdidoCount   = lotes.filter(l => l.estado === 'perdido').length
  const totalKg        = lotes.reduce((a, l) => a + (l.kg_cosechados ?? 0), 0)

  const invalidate = () => qc.invalidateQueries({ queryKey: ['lotes'] })

  async function crearLote() {
    await fetch(`${API}/api/lotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, invernadero_id: form.invernadero_id || null, nodo_id: Number(form.nodo_id) || 1 }),
    })
    invalidate()
    setModal(false)
    setForm({ codigo: '', cultivo: '', invernadero_id: '', nodo_id: '', fecha_inicio: '', notas: '' })
  }

  async function registrarCosecha() {
    if (!cosechaModal) return
    await fetch(`${API}/api/lotes/${cosechaModal.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'cosechado', fecha_cosecha: cosechaForm.fecha_cosecha, kg_cosechados: Number(cosechaForm.kg_cosechados) }),
    })
    invalidate()
    setCosechaModal(null)
    setCosechaForm({ fecha_cosecha: '', kg_cosechados: '' })
  }

  async function marcarPerdido(lote: Lote) {
    if (!confirm(`¿Marcar "${lote.codigo}" como perdido?`)) return
    await fetch(`${API}/api/lotes/${lote.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'perdido' }),
    })
    invalidate()
  }

  async function eliminar(id: number) {
    if (!confirm('¿Eliminar lote?')) return
    await fetch(`${API}/api/lotes/${id}`, { method: 'DELETE' })
    invalidate()
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl" style={{ color: 'var(--text-primary)' }}>
            Producción
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Lotes de cultivo — ciclos, cosechas y trazabilidad
          </p>
        </div>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: 'var(--accent)' }}>
          <Plus className="w-4 h-4" /> Nuevo lote
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Activos',    val: activosCount,              color: 'var(--accent)'       },
          { label: 'Cosechados', val: cosechadoCount,             color: '#2563eb'             },
          { label: 'Perdidos',   val: perdidoCount,               color: 'var(--danger)'       },
          { label: 'Kg totales', val: `${totalKg.toFixed(1)} kg`, color: 'var(--text-primary)' },
        ].map(kpi => (
          <div key={kpi.label} className="glass p-4">
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{kpi.label}</p>
            <p className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.val}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {['todos', 'activo', 'cosechado', 'perdido'].map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
            style={filtro === f
              ? { background: 'var(--accent-dim)', border: '1px solid var(--border-hover)', color: 'var(--accent)' }
              : { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            {f === 'todos' ? 'Todos' : ESTADO_STYLE[f].label}
          </button>
        ))}
      </div>

      {/* Lista de lotes */}
      {isLoading ? (
        <div className="glass p-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Cargando lotes...</div>
      ) : lotesFiltered.length === 0 ? (
        <div className="glass flex flex-col items-center py-16 gap-3">
          <Leaf className="w-10 h-10" style={{ color: 'var(--border-hover)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No hay lotes en esta categoría</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {lotesFiltered.map(lote => {
            const est = ESTADO_STYLE[lote.estado]
            return (
              <div key={lote.id} className="glass p-4 flex flex-wrap items-center gap-4"
                style={{ borderLeft: `3px solid ${est.color}` }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono px-2 py-0.5 rounded"
                      style={{ background: ESTADO_BG[lote.estado], color: est.color }}>
                      {lote.codigo}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium" style={{ color: est.color }}>
                      {est.icon} {est.label}
                    </span>
                  </div>
                  <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{lote.cultivo}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {lote.invernadero_nombre ?? '—'} · {lote.nodo_nombre ?? '—'}
                  </p>
                </div>
                <div className="text-xs space-y-0.5" style={{ color: 'var(--text-muted)' }}>
                  <div>Inicio: <span style={{ color: 'var(--text-primary)' }}>{lote.fecha_inicio}</span></div>
                  {lote.fecha_cosecha && <div>Cosecha: <span style={{ color: '#2563eb' }}>{lote.fecha_cosecha}</span></div>}
                  {lote.kg_cosechados && <div>Kg: <span className="font-semibold" style={{ color: 'var(--accent)' }}>{lote.kg_cosechados} kg</span></div>}
                </div>
                {lote.notas && (
                  <p className="text-xs italic w-full sm:w-48 truncate" style={{ color: 'var(--text-muted)' }}>{lote.notas}</p>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  {lote.estado === 'activo' && (
                    <>
                      <button
                        onClick={() => { setCosechaModal(lote); setCosechaForm({ fecha_cosecha: new Date().toISOString().slice(0, 10), kg_cosechados: '' }) }}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium"
                        style={{ background: 'rgba(37,99,235,0.08)', color: '#2563eb', border: '1px solid rgba(37,99,235,0.2)' }}>
                        Cosechar
                      </button>
                      <button onClick={() => marcarPerdido(lote)}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium"
                        style={{ background: 'var(--danger-dim)', color: 'var(--danger)', border: '1px solid rgba(192,57,43,0.2)' }}>
                        Perdido
                      </button>
                    </>
                  )}
                  <button onClick={() => eliminar(lote.id)}
                    className="text-xs px-2 py-1.5 rounded-lg"
                    style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>✕</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal nuevo lote */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
          <div className="glass p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Nuevo lote</h2>
              <button onClick={() => setModal(false)} style={{ color: 'var(--text-muted)' }}>✕</button>
            </div>
            {[
              { key: 'codigo',         label: 'Código',          placeholder: 'LOTE-A-003' },
              { key: 'cultivo',        label: 'Cultivo',          placeholder: 'Ej: Lechuga hidropónica' },
              { key: 'nodo_id',        label: 'Nodo ID',          placeholder: '1, 2 o 3' },
              { key: 'invernadero_id', label: 'Invernadero ID',   placeholder: '1, 2 o 3 (opcional)' },
              { key: 'fecha_inicio',   label: 'Fecha inicio',     placeholder: '2026-05-06' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
                <input className="input-field" placeholder={f.placeholder}
                  value={(form as Record<string, string>)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Notas</label>
              <textarea className="input-field" rows={2} placeholder="Observaciones..."
                value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setModal(false)} className="flex-1 py-2 rounded-xl text-sm font-medium"
                style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>Cancelar</button>
              <button onClick={crearLote} className="btn-primary flex-1 py-2 rounded-xl text-sm font-medium">Crear lote</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal cosechar */}
      {cosechaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
          <div className="glass p-6 w-full max-w-sm space-y-4">
            <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
              Registrar cosecha — {cosechaModal.codigo}
            </h2>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Fecha de cosecha</label>
              <input type="date" className="input-field"
                value={cosechaForm.fecha_cosecha}
                onChange={e => setCosechaForm(p => ({ ...p, fecha_cosecha: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Kg cosechados</label>
              <input type="number" className="input-field" placeholder="Ej: 42.5"
                value={cosechaForm.kg_cosechados}
                onChange={e => setCosechaForm(p => ({ ...p, kg_cosechados: e.target.value }))} />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setCosechaModal(null)} className="flex-1 py-2 rounded-xl text-sm font-medium"
                style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>Cancelar</button>
              <button onClick={registrarCosecha} className="flex-1 py-2 rounded-xl text-sm font-medium text-white"
                style={{ background: '#2563eb' }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
