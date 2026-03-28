import { apiClient } from './client';
import type { TipoSaida, ApiResponse } from '@/types';

export async function listTiposSaida(): Promise<TipoSaida[]> {
  const { data } = await apiClient.get<ApiResponse<TipoSaida[]>>('/tipos-saida');
  return data.data;
}
