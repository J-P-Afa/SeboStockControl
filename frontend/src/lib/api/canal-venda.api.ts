import { apiClient } from './client';
import type { CanalVenda, ApiResponse } from '@/types';

export async function listCanaisVenda(): Promise<CanalVenda[]> {
  const { data } = await apiClient.get<ApiResponse<CanalVenda[]>>('/canais-venda');
  return data.data;
}
