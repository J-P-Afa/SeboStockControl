'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { listCanaisVenda } from '@/lib/api';
import type { CanalVenda } from '@/types';

export function useCanaisVenda(
  options?: Omit<UseQueryOptions<CanalVenda[], Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<CanalVenda[], Error>({
    queryKey: ['canais-venda'],
    queryFn: listCanaisVenda,
    ...options,
  });
}
