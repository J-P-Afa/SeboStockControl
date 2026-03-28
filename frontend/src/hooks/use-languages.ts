'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  listLanguages,
  createLanguage,
  updateLanguage,
  deleteLanguage,
  getErrorMessage,
} from '@/lib/api';
import type {
  Language,
  PaginatedResponse,
  CreateLanguagePayload,
  UpdateLanguagePayload,
  ListLanguagesFilters,
} from '@/types';

export function useLanguages(
  page: number = 1,
  limit: number = 10,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  filters?: ListLanguagesFilters,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Language>, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<PaginatedResponse<Language>, Error>({
    queryKey: ['languages', page, limit, sortBy, sortOrder, filters],
    queryFn: () => listLanguages(page, limit, sortBy, sortOrder, filters),
    ...options,
  });
}

export function useCreateLanguage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLanguagePayload) => createLanguage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'], exact: false });
      toast.success('Idioma criado com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao criar idioma'));
    },
  });
}

export function useUpdateLanguage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateLanguagePayload;
    }) => updateLanguage(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'], exact: false });
      toast.success('Idioma atualizado com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao atualizar idioma'));
    },
  });
}

export function useDeleteLanguage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteLanguage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'], exact: false });
      toast.success('Idioma excluído com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao excluir idioma'));
    },
  });
}
