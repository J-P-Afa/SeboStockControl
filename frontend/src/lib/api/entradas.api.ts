import { apiClient } from './client';
import type { ApiResponse } from '@/types';

export interface CreateEntradaPayload {
  bookId: number;
  usuarioId: string;
  dataEntrada: string;
  quantidade: number;
  custoUnitario: number;
  fornecedor?: string;
  numeroNotaFiscal?: string;
  observacao?: string;
}

export interface BulkCreateEntradaPayload {
  usuarioId: string;
  dataEntrada: string;
  fornecedor?: string;
  numeroNotaFiscal?: string;
  observacao?: string;
  items: Omit<CreateEntradaPayload, 'usuarioId' | 'dataEntrada'>[];
}

export async function bulkCreateEntrada(payload: BulkCreateEntradaPayload): Promise<void> {
  const { data } = await apiClient.post<ApiResponse<void>>('/entradas/bulk', payload);
  return data.data;
}

export async function getLastCost(bookId: number): Promise<number> {
  const { data } = await apiClient.get<ApiResponse<{ custoUnitario: number }>>('/entradas/last-cost', {
    params: { bookId }
  });
  return data.data?.custoUnitario ?? 0;
}

export async function getBookStock(bookId: number): Promise<number> {
  const { data } = await apiClient.get<ApiResponse<{ quantidade: number }>>(`/estoques/book/${bookId}`);
  return data.data?.quantidade ?? 0;
}
