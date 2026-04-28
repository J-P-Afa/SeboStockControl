'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createCanalVenda,
  deleteCanalVenda,
  getErrorMessage,
  listCanaisVenda,
  updateCanalVenda,
} from '@/lib/api';
import type {
  CanalVenda,
  CreateCanalVendaPayload,
  UpdateCanalVendaPayload,
} from '@/types';

export function useCanaisVenda(
  includeInactive = false,
  options?: Omit<UseQueryOptions<CanalVenda[], Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<CanalVenda[], Error>({
    queryKey: ['canais-venda', includeInactive],
    queryFn: () => listCanaisVenda(includeInactive),
    ...options,
  });
}

export function useCreateCanalVenda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCanalVendaPayload) =>
      createCanalVenda(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['canais-venda'],
        exact: false,
      });
      toast.success('Canal de venda criado com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao criar canal de venda'));
    },
  });
}

export function useUpdateCanalVenda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateCanalVendaPayload;
    }) => updateCanalVenda(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['canais-venda'],
        exact: false,
      });
      toast.success('Canal de venda atualizado com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao atualizar canal de venda'));
    },
  });
}

export function useDeleteCanalVenda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCanalVenda(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['canais-venda'],
        exact: false,
      });
      toast.success('Canal de venda excluído com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao excluir canal de venda'));
    },
  });
}
