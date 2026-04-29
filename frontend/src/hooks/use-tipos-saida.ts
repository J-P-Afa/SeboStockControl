'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createTipoSaida,
  deleteTipoSaida,
  getErrorMessage,
  listTiposSaida,
  updateTipoSaida,
} from '@/lib/api';
import type {
  CreateTipoSaidaPayload,
  TipoSaida,
  UpdateTipoSaidaPayload,
} from '@/types';

export function useTiposSaida(
  includeInactive = false,
  options?: Omit<UseQueryOptions<TipoSaida[], Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<TipoSaida[], Error>({
    queryKey: ['tipos-saida', includeInactive],
    queryFn: () => listTiposSaida(includeInactive),
    ...options,
  });
}

export function useCreateTipoSaida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTipoSaidaPayload) => createTipoSaida(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tipos-saida'],
        exact: false,
      });
      toast.success('Tipo de saída criado com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao criar tipo de saída'));
    },
  });
}

export function useUpdateTipoSaida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateTipoSaidaPayload;
    }) => updateTipoSaida(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tipos-saida'],
        exact: false,
      });
      toast.success('Tipo de saída atualizado com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao atualizar tipo de saída'));
    },
  });
}

export function useDeleteTipoSaida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTipoSaida(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tipos-saida'],
        exact: false,
      });
      toast.success('Tipo de saída excluído com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao excluir tipo de saída'));
    },
  });
}
