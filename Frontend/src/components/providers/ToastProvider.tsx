'use client'
// components/providers/ToastProvider.tsx
import { Toaster } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#fff',
          color: '#1a2e1e',
          border: '1px solid rgba(74,140,90,0.2)',
          borderRadius: '12px',
          fontSize: '0.875rem',
          boxShadow: '0 4px 20px rgba(46,125,79,0.10)',
        },
        success: { style: { borderColor: 'rgba(46,125,79,0.35)' } },
        error:   { style: { borderColor: 'rgba(192,57,43,0.35)' } },
      }}
    />
  )
}
