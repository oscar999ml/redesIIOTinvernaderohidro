'use client'
// hooks/useAlarmas.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { api } from '@/lib/api'
import { useAlarmasStore } from '@/store/alarmasStore'
import { Alarma } from '@/types/alarma'

export function useAlarmasActivas() {
  const setAlarmas = useAlarmasStore((s) => s.setAlarmas)

  const query = useQuery<Alarma[]>({
    queryKey: ['alarmas-activas'],
    queryFn: () => api.get('/alarmas/activas'),
    refetchInterval: 10_000,
  })

  useEffect(() => {
    if (query.data) setAlarmas(query.data)
  }, [query.data, setAlarmas])

  return query
}

export function useReconocerAlarma() {
  const qc = useQueryClient()
  const reconocer = useAlarmasStore((s) => s.reconocer)

  return useMutation({
    mutationFn: (id: number) => api.post(`/alarmas/${id}/reconocer`, {}),
    onSuccess: (_, id) => {
      reconocer(id)
      qc.invalidateQueries({ queryKey: ['alarmas-activas'] })
    },
  })
}

export function useLecturas(nodo_id: number, limit = 100) {
  return useQuery({
    queryKey: ['lecturas', nodo_id],
    queryFn: () => api.get(`/lecturas?nodo_id=${nodo_id}&limit=${limit}`),
    enabled: !!nodo_id,
    refetchInterval: 5_000,
  })
}
