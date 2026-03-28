import { useQuery } from '@tanstack/react-query';
import { getEstoqueHistory } from '@/lib/api';

export function useEstoqueHistory(bookId: number, options = {}) {
  return useQuery({
    queryKey: ['estoque-history', bookId],
    queryFn: () => getEstoqueHistory(bookId),
    enabled: !!bookId,
    ...options,
  });
}
