import { apiClient } from './client';
import type { Saida, CreateSaidaBulkDto, ApiResponse } from '@/types';

export async function bulkCreateSaida(dto: CreateSaidaBulkDto): Promise<Saida[]> {
  const { data } = await apiClient.post<ApiResponse<Saida[]>>('/saidas/bulk', dto);
  return data.data;
}

export async function listSaidas(filters?: { bookId?: number; tipoSaidaId?: number }): Promise<Saida[]> {
  const { data } = await apiClient.get<ApiResponse<Saida[]>>('/saidas', { params: filters });
  return data.data;
}
