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
  CreateGenreData,
  UpdateGenreData,
} from '@/types';

export function useGenres(
  options?: Omit<UseQueryOptions<Genre[], Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<Genre[], Error>({
    queryKey: ['genres'],
    queryFn: listGenres,
    ...options,
  });
}

export function useCreateGenre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateGenreData) => createGenre(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] });
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
    mutationFn: ({ id, payload }: { id: number; payload: UpdateGenreData }) =>
      updateGenre(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] });
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
      queryClient.invalidateQueries({ queryKey: ['genres'] });
      toast.success('Gênero excluído com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao excluir gênero'));
    },
  });
}
