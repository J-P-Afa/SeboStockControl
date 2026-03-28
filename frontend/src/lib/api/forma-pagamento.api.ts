import { apiClient } from './client';
import type { FormaPagamento, ApiResponse } from '@/types';

export async function listFormasPagamento(): Promise<FormaPagamento[]> {
  const { data } = await apiClient.get<ApiResponse<FormaPagamento[]>>('/formas-pagamento');
  return data.data;
}
