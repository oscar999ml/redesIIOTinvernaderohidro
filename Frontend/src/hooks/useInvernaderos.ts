'use client'
// hooks/useInvernaderos.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { api } from '@/lib/api'
import { useInvernaderoStore } from '@/store/invernaderoStore'
import { Invernadero } from '@/types/invernadero'

export function useInvernaderos() {
  const setInvernaderos = useInvernaderoStore((s) => s.setInvernaderos)

  const query = useQuery<Invernadero[]>({
    queryKey: ['invernaderos'],
    queryFn: () => api.get('/invernaderos'),
    staleTime: 60_000,
  })

  useEffect(() => {
    if (query.data) setInvernaderos(query.data)
  }, [query.data, setInvernaderos])

  return query
}

export function useInvernadero(id: number) {
  const setInvernaderos = useInvernaderoStore((s) => s.setInvernaderos)

  const query = useQuery<Invernadero>({
    queryKey: ['invernadero', id],
    queryFn: () => api.get(`/invernaderos/${id}`),
    staleTime: 30_000,
    enabled: !!id,
  })

  useEffect(() => {
    if (query.data) {
      // Merge into the list store
      useInvernaderoStore.setState((s) => {
        const updated = { ...s.invernaderos, [query.data!.id]: query.data! }
        return {
          invernaderos: updated,
          invernaderosList: Object.values(updated).sort((a, b) =>
            a.codigo.localeCompare(b.codigo)
          ),
        }
      })
    }
  }, [query.data])

  return query
}

export function useEnviarComandoInvernadero() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (cmd: { nodo_id: number; accion: string; valor?: unknown }) =>
      api.post('/comandos', cmd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invernaderos'] })
    },
  })
}
