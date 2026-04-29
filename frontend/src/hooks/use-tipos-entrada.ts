'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createTipoEntrada,
  deleteTipoEntrada,
  getErrorMessage,
  listTiposEntrada,
  updateTipoEntrada,
} from '@/lib/api';
import type {
  CreateTipoEntradaPayload,
  TipoEntrada,
  UpdateTipoEntradaPayload,
} from '@/types';

export function useTiposEntrada(
  includeInactive = false,
  options?: Omit<UseQueryOptions<TipoEntrada[], Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<TipoEntrada[], Error>({
    queryKey: ['tipos-entrada', includeInactive],
    queryFn: () => listTiposEntrada(includeInactive),
    ...options,
  });
}

export function useCreateTipoEntrada() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTipoEntradaPayload) =>
      createTipoEntrada(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tipos-entrada'],
        exact: false,
      });
      toast.success('Tipo de entrada criado com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao criar tipo de entrada'));
    },
  });
}

export function useUpdateTipoEntrada() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateTipoEntradaPayload;
    }) => updateTipoEntrada(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tipos-entrada'],
        exact: false,
      });
      toast.success('Tipo de entrada atualizado com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao atualizar tipo de entrada'));
    },
  });
}

export function useDeleteTipoEntrada() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTipoEntrada(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tipos-entrada'],
        exact: false,
      });
      toast.success('Tipo de entrada excluído com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao excluir tipo de entrada'));
    },
  });
}
