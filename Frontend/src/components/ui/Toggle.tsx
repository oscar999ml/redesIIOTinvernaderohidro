'use client'
// components/ui/Toggle.tsx
import { cn } from '@/lib/utils'

export function Toggle({ checked, onChange, disabled, label }: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  label?: string
}) {
  return (
    <label className={cn('flex items-center gap-2 cursor-pointer select-none', disabled && 'opacity-50 cursor-not-allowed')}>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className="relative inline-flex h-6 w-11 rounded-full transition-colors duration-200"
        style={{ background: checked ? 'var(--accent)' : 'rgba(90,122,98,0.25)' }}
      >
        <span className={cn(
          'inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 mt-0.5',
          checked ? 'translate-x-5' : 'translate-x-0.5'
        )} />
      </button>
      {label && <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{label}</span>}
    </label>
  )
}
