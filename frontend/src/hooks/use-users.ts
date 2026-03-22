'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listRoles,
  getErrorMessage,
} from '@/lib/api';
import type { CreateUserPayload, UpdateUserPayload, ListUsersFilters, Role, PaginatedResponse, User } from '@/types';

export function useUsers(
  page: number = 1,
  limit: number = 10,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  filters?: ListUsersFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<User>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['users', page, limit, sortBy, sortOrder, filters],
    queryFn: () => listUsers(page, limit, sortBy, sortOrder, filters),
    ...options,
  });
}

export function useRoles() {
  return useQuery<Role[], Error>({
    queryKey: ['roles'],
    queryFn: listRoles,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário criado com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao criar usuário'));
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário atualizado com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao atualizar usuário'));
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário excluído com sucesso');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erro ao excluir usuário'));
    },
  });
}
