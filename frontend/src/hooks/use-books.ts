'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  listBooks,
  createBook,
  updateBook,
  deleteBook,
  getErrorMessage,
} from '@/lib/api';
import type { CreateBookPayload, UpdateBookPayload, ListBooksFilters, PaginatedResponse, Book } from '@/types';

export function useBooks(
  page: number = 1,
  limit: number = 10,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  filters?: ListBooksFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<Book>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['books', page, limit, sortBy, sortOrder, filters],
    queryFn: () => listBooks(page, limit, sortBy, sortOrder, filters),
    ...options,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookPayload) => createBook(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Livro criado com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao criar livro'));
    },
  });
}

export function useUpdateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateBookPayload }) =>
      updateBook(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Livro atualizado com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao atualizar livro'));
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Livro excluído com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao excluir livro'));
    },
  });
}