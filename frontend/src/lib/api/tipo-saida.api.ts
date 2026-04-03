import { apiClient } from './client';
import type { TipoSaida } from '@/types';

export async function listTiposSaida(): Promise<TipoSaida[]> {
  const { data } = await apiClient.get<TipoSaida[]>('/tipos-saida');
  return data;
}
