'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  listGenres,
  createGenre,
  updateGenre,
  deleteGenre,
  getErrorMessage,
} from '@/lib/api';

import type {
  Genre,
  PaginatedResponse,
  CreateGenrePayload,
  UpdateGenrePayload,
  ListGenresFilters,
} from '@/types';

export function useGenres(
  page: number = 1,
  limit: number = 10,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  filters?: ListGenresFilters,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Genre>, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: ['genres', page, limit, sortBy, sortOrder, filters],
    queryFn: () => listGenres(page, limit, sortBy, sortOrder, filters),
    ...options,
  });
}

export function useCreateGenre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateGenrePayload) => createGenre(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'], exact: false});
      toast.success('Gênero criado com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao criar gênero'));
    },
  });
}

export function useUpdateGenre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateGenrePayload;
    }) => updateGenre(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'], exact: false });
      toast.success('Gênero atualizado com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao atualizar gênero'));
    },
  });
}

export function useDeleteGenre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteGenre(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'], exact: false });
      toast.success('Gênero excluído com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao excluir gênero'));
    },
  });
}