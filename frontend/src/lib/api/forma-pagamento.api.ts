import { apiClient } from './client';
import type { FormaPagamento } from '@/types';

export async function listFormasPagamento(): Promise<FormaPagamento[]> {
  const { data } = await apiClient.get<FormaPagamento[]>('/formas-pagamento');
  return data;
}
