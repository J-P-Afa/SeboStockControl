import { apiClient } from './client';
import type {
  CreateTipoSaidaPayload,
  TipoSaida,
  UpdateTipoSaidaPayload,
} from '@/types';

export async function listTiposSaida(
  includeInactive = false,
): Promise<TipoSaida[]> {
  const { data } = await apiClient.get<TipoSaida[]>('/tipos-saida', {
    params: includeInactive ? { all: true } : undefined,
  });
  return data;
}

export async function createTipoSaida(
  payload: CreateTipoSaidaPayload,
): Promise<TipoSaida> {
  const { data } = await apiClient.post<TipoSaida>('/tipos-saida', payload);
  return data;
}

export async function updateTipoSaida(
  id: number,
  payload: UpdateTipoSaidaPayload,
): Promise<TipoSaida> {
  const { data } = await apiClient.patch<TipoSaida>(
    `/tipos-saida/${id}`,
    payload,
  );
  return data;
}

export async function deleteTipoSaida(id: number): Promise<void> {
  await apiClient.delete(`/tipos-saida/${id}`);
}
