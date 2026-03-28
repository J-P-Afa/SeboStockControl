'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  listPublishers,
  createPublisher,
  updatePublisher,
  deletePublisher,
  getErrorMessage,
} from '@/lib/api';
import type {
  Publisher,
  CreatePublisherData,
  UpdatePublisherData,
} from '@/types';

export function usePublishers(
  options?: Omit<UseQueryOptions<Publisher[], Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<Publisher[], Error>({
    queryKey: ['publishers'],
    queryFn: listPublishers,
    ...options,
  });
}

export function useCreatePublisher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePublisherData) => createPublisher(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishers'] });
      toast.success('Editora criada com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao criar editora'));
    },
  });
}

export function useUpdatePublisher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePublisherData }) =>
      updatePublisher(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishers'] });
      toast.success('Editora atualizada com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao atualizar editora'));
    },
  });
}

export function useDeletePublisher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deletePublisher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishers'] });
      toast.success('Editora excluída com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao excluir editora'));
    },
  });
}
