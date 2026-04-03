import { apiClient } from './client';
import type { Saida, CreateSaidaBulkDto } from '@/types';

export async function bulkCreateSaida(dto: CreateSaidaBulkDto): Promise<Saida[]> {
  const { data } = await apiClient.post<Saida[]>('/saidas/bulk', dto);
  return data;
}

export async function listSaidas(filters?: { bookId?: number; tipoSaidaId?: number }): Promise<Saida[]> {
  const { data } = await apiClient.get<Saida[]>('/saidas', { params: filters });
  return data;
}
