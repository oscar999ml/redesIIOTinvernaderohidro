// lib/formatters.ts
export function fmt(value: number | undefined | null, dec = 1): string {
  if (value === undefined || value === null) return '--'
  return value.toFixed(dec)
}

export function fmtTS(ts: string): string {
  return new Date(ts).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export const VARIABLE_CONFIG: Record<string, { label: string; unidad: string; icono: string; dec: number }> = {
  temperatura:   { label: 'Temperatura',    unidad: '°C',  icono: '🌡️',  dec: 1 },
  humedad:       { label: 'Humedad',        unidad: '%',   icono: '💧',  dec: 1 },
  ph:            { label: 'pH',             unidad: '',    icono: '⚗️',  dec: 2 },
  nivel_agua:    { label: 'Nivel agua',     unidad: '%',   icono: '🪣',  dec: 1 },
  humedad_suelo: { label: 'Hum. suelo',     unidad: '%',   icono: '🌱',  dec: 1 },
  temp_agua:     { label: 'Temp. agua',     unidad: '°C',  icono: '🌊',  dec: 1 },
  led:           { label: 'LED',            unidad: '',    icono: '💡',  dec: 0 },
}
