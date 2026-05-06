// components/ui/Card.tsx
import { cn } from '@/lib/utils'

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('glass p-4', className)}>
      {children}
    </div>
  )
}
