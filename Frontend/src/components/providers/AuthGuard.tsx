'use client'
// components/providers/AuthGuard.tsx
import { useAuthStore } from '@/store/authStore'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Spinner } from '@/components/ui/Spinner'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const token  = useAuthStore((s) => s.token)
  const router = useRouter()
  const path   = usePathname()

  useEffect(() => {
    if (!token && path !== '/login') router.replace('/login')
  }, [token, path, router])

  if (!token && path !== '/login') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950">
        <Spinner size="lg" />
      </div>
    )
  }

  // En la página login no mostrar layout
  if (path === '/login') return <>{children}</>

  return <>{children}</>
}
