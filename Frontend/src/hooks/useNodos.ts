'use client'
// hooks/useNodos.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { api } from '@/lib/api'
import { useNodosStore } from '@/store/nodosStore'
import { Nodo } from '@/types/nodo'

export function useNodos() {
  const setNodos = useNodosStore((s) => s.setNodos)

  const query = useQuery<Nodo[]>({
    queryKey: ['nodos'],
    queryFn: () => api.get('/nodos'),
    staleTime: 30_000,
  })

  useEffect(() => {
    if (query.data) setNodos(query.data)
  }, [query.data, setNodos])

  return query
}

export function useEnviarComando() {
  return useMutation({
    mutationFn: (cmd: { nodo_id: number; accion: string; valor?: unknown }) =>
      api.post('/comandos', cmd),
  })
}
