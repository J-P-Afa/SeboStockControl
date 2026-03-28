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
  PaginatedResponse,
  CreatePublisherPayload,
  UpdatePublisherPayload,
  ListPublishersFilters,
} from '@/types';

export function usePublishers(
  page: number = 1,
  limit: number = 10,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  filters?: ListPublishersFilters,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Publisher>, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<PaginatedResponse<Publisher>, Error>({
    queryKey: ['publishers', page, limit, sortBy, sortOrder, filters],
    queryFn: () => listPublishers(page, limit, sortBy, sortOrder, filters),
    ...options,
  });
}

export function useCreatePublisher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePublisherPayload) => createPublisher(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishers'], exact: false });
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
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdatePublisherPayload;
    }) => updatePublisher(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishers'], exact: false });
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
      queryClient.invalidateQueries({ queryKey: ['publishers'], exact: false });
      toast.success('Editora excluída com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao excluir editora'));
    },
  });
}
