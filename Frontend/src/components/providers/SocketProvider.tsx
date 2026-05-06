'use client'
// components/providers/SocketProvider.tsx
import { useSocket } from '@/hooks/useSocket'
import { useNodos } from '@/hooks/useNodos'
import { useAlarmasActivas } from '@/hooks/useAlarmas'

function Inner({ children }: { children: React.ReactNode }) {
  useSocket()
  useNodos()
  useAlarmasActivas()
  return <>{children}</>
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  return <Inner>{children}</Inner>
}
