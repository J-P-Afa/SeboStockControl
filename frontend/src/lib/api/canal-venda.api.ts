import { apiClient } from './client';
import type { CanalVenda } from '@/types';

export async function listCanaisVenda(): Promise<CanalVenda[]> {
  const { data } = await apiClient.get<CanalVenda[]>('/canais-venda');
  return data;
}
