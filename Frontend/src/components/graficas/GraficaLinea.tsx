'use client'
// components/graficas/GraficaLinea.tsx
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

interface Punto { timestamp: string; [key: string]: number | string }

export function GraficaLinea({ datos, variables, colores }: {
  datos: Punto[]
  variables: string[]
  colores?: string[]
}) {
  const palette = colores ?? ['#2e7d4f', '#2980b9', '#e67e22', '#e74c3c', '#8e44ad']

  const formateados = datos.map((d) => ({
    ...d,
    _ts: new Date(d.timestamp).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formateados} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
        <XAxis dataKey="_ts" tick={{ fill: '#5a7a62', fontSize: 11 }} tickLine={false} />
        <YAxis tick={{ fill: '#5a7a62', fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255,255,255,0.95)',
            border: '1px solid rgba(46,125,79,0.2)',
            borderRadius: 10,
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}
          labelStyle={{ color: '#5a7a62', fontSize: 11 }}
          itemStyle={{ color: '#1a2e1e', fontWeight: 600 }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: '#5a7a62' }} />
        {variables.map((v, i) => (
          <Line
            key={v}
            type="monotone"
            dataKey={v}
            stroke={palette[i % palette.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: palette[i % palette.length] }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
