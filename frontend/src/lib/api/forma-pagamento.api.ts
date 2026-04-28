import { apiClient } from './client';
import type {
  FormaPagamento,
  CreateFormaPagamentoPayload,
  UpdateFormaPagamentoPayload,
} from '@/types';

export async function listFormasPagamento(
  includeInactive = false,
): Promise<FormaPagamento[]> {
  const { data } = await apiClient.get<FormaPagamento[]>('/formas-pagamento', {
    params: includeInactive ? { all: true } : undefined,
  });
  return data;
}

export async function createFormaPagamento(
  payload: CreateFormaPagamentoPayload,
): Promise<FormaPagamento> {
  const { data } = await apiClient.post<FormaPagamento>(
    '/formas-pagamento',
    payload,
  );
  return data;
}

export async function updateFormaPagamento(
  id: number,
  payload: UpdateFormaPagamentoPayload,
): Promise<FormaPagamento> {
  const { data } = await apiClient.patch<FormaPagamento>(
    `/formas-pagamento/${id}`,
    payload,
  );
  return data;
}

export async function deleteFormaPagamento(id: number): Promise<void> {
  await apiClient.delete(`/formas-pagamento/${id}`);
}
