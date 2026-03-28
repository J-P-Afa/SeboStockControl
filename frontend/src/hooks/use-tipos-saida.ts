'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { listTiposSaida } from '@/lib/api';
import type { TipoSaida } from '@/types';

export function useTiposSaida(
  options?: Omit<UseQueryOptions<TipoSaida[], Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<TipoSaida[], Error>({
    queryKey: ['tipos-saida'],
    queryFn: listTiposSaida,
    ...options,
  });
}
