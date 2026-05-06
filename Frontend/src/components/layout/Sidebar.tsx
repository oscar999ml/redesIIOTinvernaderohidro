'use client'
// components/layout/Sidebar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Bell, LineChart, Settings, Cpu, Sprout, Leaf, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/',              label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/invernaderos',  label: 'Invernaderos', icon: Sprout },
  { href: '/produccion',    label: 'Producción',   icon: Leaf },
  { href: '/personal',      label: 'Personal',     icon: Users },
  { href: '/alarmas',       label: 'Alarmas',      icon: Bell },
  { href: '/historico',     label: 'Histórico',    icon: LineChart },
  { href: '/configuracion', label: 'Config',       icon: Settings },
]

export function Sidebar() {
  const path = usePathname()

  return (
    <aside
      className="w-16 md:w-56 shrink-0 flex flex-col"
      style={{
        borderRight: '1px solid var(--border)',
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(10px)',
      }}>

      {/* Nav */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== '/' && path.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              )}
              style={active ? {
                background: 'var(--accent-dim)',
                border: '1px solid var(--border-hover)',
                color: 'var(--accent)',
              } : {
                background: 'transparent',
                border: '1px solid transparent',
                color: 'var(--text-muted)',
              }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden md:block">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer version */}
      <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 px-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          <Cpu className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden md:block">v1.0 — Fase 1</span>
        </div>
      </div>
    </aside>
  )
}
