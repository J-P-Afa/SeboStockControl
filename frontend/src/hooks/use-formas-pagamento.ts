'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createFormaPagamento,
  deleteFormaPagamento,
  getErrorMessage,
  listFormasPagamento,
  updateFormaPagamento,
} from '@/lib/api';
import type {
  FormaPagamento,
  CreateFormaPagamentoPayload,
  UpdateFormaPagamentoPayload,
} from '@/types';

export function useFormasPagamento(
  includeInactive = false,
  options?: Omit<UseQueryOptions<FormaPagamento[], Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<FormaPagamento[], Error>({
    queryKey: ['formas-pagamento', includeInactive],
    queryFn: () => listFormasPagamento(includeInactive),
    ...options,
  });
}

export function useCreateFormaPagamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFormaPagamentoPayload) =>
      createFormaPagamento(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['formas-pagamento'],
        exact: false,
      });
      toast.success('Forma de pagamento criada com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao criar forma de pagamento'));
    },
  });
}

export function useUpdateFormaPagamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateFormaPagamentoPayload;
    }) => updateFormaPagamento(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['formas-pagamento'],
        exact: false,
      });
      toast.success('Forma de pagamento atualizada com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao atualizar forma de pagamento'));
    },
  });
}

export function useDeleteFormaPagamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteFormaPagamento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['formas-pagamento'],
        exact: false,
      });
      toast.success('Forma de pagamento excluída com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao excluir forma de pagamento'));
    },
  });
}
