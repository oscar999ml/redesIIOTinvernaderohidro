// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { SocketProvider } from '@/components/providers/SocketProvider'
import { ToastProvider } from '@/components/providers/ToastProvider'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'

export const metadata: Metadata = {
  title: 'GreenSCADA | Invernadero IoT',
  description: 'Sistema SCADA para invernaderos hidropónicos',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <QueryProvider>
          <SocketProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <Navbar />
                <main className="flex-1 overflow-auto p-4 lg:p-6">
                  {children}
                </main>
              </div>
            </div>
            <ToastProvider />
          </SocketProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
