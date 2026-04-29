import { apiClient } from './client';
import type {
  CreateTipoEntradaPayload,
  TipoEntrada,
  UpdateTipoEntradaPayload,
} from '@/types';

export async function listTiposEntrada(
  includeInactive = false,
): Promise<TipoEntrada[]> {
  const { data } = await apiClient.get<TipoEntrada[]>('/tipos-entrada', {
    params: includeInactive ? { all: true } : undefined,
  });
  return data;
}

export async function createTipoEntrada(
  payload: CreateTipoEntradaPayload,
): Promise<TipoEntrada> {
  const { data } = await apiClient.post<TipoEntrada>('/tipos-entrada', payload);
  return data;
}

export async function updateTipoEntrada(
  id: number,
  payload: UpdateTipoEntradaPayload,
): Promise<TipoEntrada> {
  const { data } = await apiClient.patch<TipoEntrada>(
    `/tipos-entrada/${id}`,
    payload,
  );
  return data;
}

export async function deleteTipoEntrada(id: number): Promise<void> {
  await apiClient.delete(`/tipos-entrada/${id}`);
}
