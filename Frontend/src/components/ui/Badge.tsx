// components/ui/Badge.tsx
import { cn } from '@/lib/utils'

type Variant = 'online' | 'offline' | 'alerta' | 'info' | 'default'

const variants: Record<Variant, React.CSSProperties> = {
  online:  { background: 'rgba(46,125,79,0.12)', color: 'var(--accent)',  border: '1px solid rgba(46,125,79,0.25)' },
  offline: { background: 'rgba(90,122,98,0.10)', color: 'var(--text-muted)', border: '1px solid var(--border)' },
  alerta:  { background: 'var(--danger-dim)',    color: 'var(--danger)',  border: '1px solid rgba(192,57,43,0.25)' },
  info:    { background: 'rgba(37,99,235,0.08)', color: '#2563eb',        border: '1px solid rgba(37,99,235,0.2)' },
  default: { background: 'rgba(90,122,98,0.08)', color: 'var(--text-muted)', border: '1px solid var(--border)' },
}

export function Badge({ children, variant = 'default', className }: {
  children: React.ReactNode
  variant?: Variant
  className?: string
}) {
  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', className)}
      style={variants[variant]}>
      {children}
    </span>
  )
}
