import type { ApiResponse, EstoqueHistoryResponse } from '@/types';
import { apiClient } from './client';

export async function getEstoqueHistory(bookId: number): Promise<EstoqueHistoryResponse | null> {
  const { data } = await apiClient.get<ApiResponse<EstoqueHistoryResponse>>(`/estoques/book/${bookId}/history`);
  return data.data ?? null;
}
