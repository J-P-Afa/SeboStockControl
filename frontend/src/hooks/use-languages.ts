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
  CreateLanguageData,
  UpdateLanguageData,
} from '@/types';

export function useLanguages(
  options?: Omit<UseQueryOptions<Language[], Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<Language[], Error>({
    queryKey: ['languages'],
    queryFn: listLanguages,
    ...options,
  });
}

export function useCreateLanguage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLanguageData) => createLanguage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] });
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
    mutationFn: ({ id, payload }: { id: number; payload: UpdateLanguageData }) =>
      updateLanguage(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] });
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
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      toast.success('Idioma excluído com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao excluir idioma'));
    },
  });
}
