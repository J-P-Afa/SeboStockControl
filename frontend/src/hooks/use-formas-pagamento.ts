'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { listFormasPagamento } from '@/lib/api';
import type { FormaPagamento } from '@/types';

export function useFormasPagamento(
  options?: Omit<UseQueryOptions<FormaPagamento[], Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<FormaPagamento[], Error>({
    queryKey: ['formas-pagamento'],
    queryFn: listFormasPagamento,
    ...options,
  });
}
