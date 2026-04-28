import { apiClient } from './client';
import type {
  CanalVenda,
  CreateCanalVendaPayload,
  UpdateCanalVendaPayload,
} from '@/types';

export async function listCanaisVenda(
  includeInactive = false,
): Promise<CanalVenda[]> {
  const { data } = await apiClient.get<CanalVenda[]>('/canais-venda', {
    params: includeInactive ? { all: true } : undefined,
  });
  return data;
}

export async function createCanalVenda(
  payload: CreateCanalVendaPayload,
): Promise<CanalVenda> {
  const { data } = await apiClient.post<CanalVenda>('/canais-venda', payload);
  return data;
}

export async function updateCanalVenda(
  id: number,
  payload: UpdateCanalVendaPayload,
): Promise<CanalVenda> {
  const { data } = await apiClient.patch<CanalVenda>(
    `/canais-venda/${id}`,
    payload,
  );
  return data;
}

export async function deleteCanalVenda(id: number): Promise<void> {
  await apiClient.delete(`/canais-venda/${id}`);
}
