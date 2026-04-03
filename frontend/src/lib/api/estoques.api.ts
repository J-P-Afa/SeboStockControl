import type { EstoqueHistoryResponse } from '@/types';
import { apiClient } from './client';

export async function getEstoqueHistory(bookId: number): Promise<EstoqueHistoryResponse | null> {
  const { data } = await apiClient.get<EstoqueHistoryResponse>(`/estoques/book/${bookId}/history`);
  return data ?? null;
}
