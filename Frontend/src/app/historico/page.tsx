'use client'
// app/historico/page.tsx
import { useState } from 'react'
import { useNodosStore } from '@/store/nodosStore'
import { api } from '@/lib/api'
import { GraficaLinea } from '@/components/graficas/GraficaLinea'
import { LineChart, Search, Download } from 'lucide-react'

const VARIABLES: { key: string; label: string; unit: string; color: string }[] = [
  { key: 'temperatura',   label: 'Temperatura',   unit: '°C',   color: '#e74c3c' },
  { key: 'humedad',       label: 'Humedad',        unit: '%',    color: '#2980b9' },
  { key: 'co2',           label: 'CO₂',            unit: 'ppm',  color: '#7f8c8d' },
  { key: 'luminosidad',   label: 'Luminosidad',    unit: 'lux',  color: '#f39c12' },
  { key: 'ph',            label: 'pH',             unit: '',     color: '#8e44ad' },
  { key: 'ec',            label: 'EC',             unit: 'mS/cm',color: '#16a085' },
  { key: 'temp_agua',     label: 'Temp. Agua',     unit: '°C',   color: '#2ecc71' },
  { key: 'nivel_agua',    label: 'Nivel Agua',     unit: '%',    color: '#3498db' },
  { key: 'humedad_suelo', label: 'Hum. Sustrato',  unit: '%',    color: '#27ae60' },
  { key: 'presion_agua',  label: 'Presión',        unit: 'bar',  color: '#e67e22' },
]

const selectStyle: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 10, fontSize: 13,
  border: '1px solid var(--border)', background: 'rgba(255,255,255,0.9)',
  color: 'var(--text)', outline: 'none', cursor: 'pointer', minWidth: 160,
}

export default function HistoricoPage() {
  const nodosArray = useNodosStore((s) => s.nodosArray)
  const [nodoId, setNodoId]     = useState<number | ''>('')
  const [variable, setVariable] = useState('temperatura')
  const [loading, setLoading]   = useState(false)
  const [datos, setDatos]       = useState<any[]>([])
  const [buscado, setBuscado]   = useState(false)

  const varDef = VARIABLES.find((v) => v.key === variable) ?? VARIABLES[0]

  const buscar = async () => {
    if (!nodoId) return
    setLoading(true)
    setBuscado(true)
    try {
      const lecturas = await api.get<any[]>(`/lecturas?nodo_id=${nodoId}&limit=200`)
      setDatos(lecturas)
    } catch {
      setDatos([])
    } finally {
      setLoading(false)
    }
  }

  const datosGrafica = datos
    .filter((l) => l[variable] != null)
    .map((l) => ({ timestamp: l.timestamp, [variable]: l[variable] }))
    .reverse()

  const exportCSV = () => {
    if (!datosGrafica.length) return
    const header = `timestamp,${variable}\n`
    const rows = datosGrafica.map((d) => `${d.timestamp},${d[variable]}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `historico_nodo${nodoId}_${variable}.csv`
    a.click()
  }

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1000, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, background: 'var(--accent-dim)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <LineChart style={{ width: 22, height: 22, color: 'var(--accent)' }} />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Histórico</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Gráficas históricas de sensores por nodo</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="glass" style={{ borderRadius: 16, padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Nodo
            </label>
            <select style={selectStyle} value={nodoId} onChange={(e) => setNodoId(Number(e.target.value))}>
              <option value="">Seleccionar nodo...</option>
              {nodosArray.map((n) => (
                <option key={n.id} value={n.id}>{n.nombre}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Variable
            </label>
            <select style={selectStyle} value={variable} onChange={(e) => setVariable(e.target.value)}>
              {VARIABLES.map((v) => (
                <option key={v.key} value={v.key}>{v.label} {v.unit ? `(${v.unit})` : ''}</option>
              ))}
            </select>
          </div>

          <button
            onClick={buscar}
            disabled={!nodoId || loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: !nodoId || loading ? 'var(--border)' : 'var(--accent)',
              color: !nodoId || loading ? 'var(--text-muted)' : '#fff',
              border: 'none', cursor: !nodoId || loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <Search style={{ width: 14, height: 14 }} />
            {loading ? 'Cargando...' : 'Ver gráfica'}
          </button>

          {datosGrafica.length > 0 && (
            <button
              onClick={exportCSV}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: 'transparent', color: 'var(--accent)',
                border: '1px solid var(--border)', cursor: 'pointer',
              }}
            >
              <Download style={{ width: 14, height: 14 }} />
              CSV
            </button>
          )}
        </div>
      </div>

      {/* Resultado */}
      {loading && (
        <div className="glass" style={{ borderRadius: 16, padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
          Cargando lecturas...
        </div>
      )}

      {!loading && buscado && datosGrafica.length > 1 && (
        <div className="glass" style={{ borderRadius: 16, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 15 }}>{varDef.label}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 13, marginLeft: 8 }}>
                · {datosGrafica.length} lecturas
              </span>
            </div>
            <div style={{
              fontSize: 12, padding: '3px 10px', borderRadius: 20,
              background: 'var(--accent-dim)', color: 'var(--accent)', fontWeight: 600,
            }}>
              {nodosArray.find((n) => n.id === nodoId)?.nombre}
            </div>
          </div>
          <GraficaLinea datos={datosGrafica} variables={[variable]} colores={[varDef.color]} />
        </div>
      )}

      {!loading && buscado && datosGrafica.length === 0 && (
        <div className="glass" style={{ borderRadius: 16, padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
          No hay lecturas de <strong>{varDef.label}</strong> para este nodo.
        </div>
      )}

      {!buscado && (
        <div style={{
          textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: 14,
        }}>
          Selecciona un nodo y una variable, luego presiona <strong>Ver gráfica</strong>.
        </div>
      )}
    </div>
  )
}
