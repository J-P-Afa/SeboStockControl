import type {
  User,
  PaginatedResponse,
  CreateUserPayload,
  UpdateUserPayload,
  Role,
  ListUsersFilters,
  ApiResponse,
} from '@/types';
import { apiClient } from './client';

export async function listUsers(
  page: number = 1,
  limit: number = 10,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  filters?: ListUsersFilters,
): Promise<PaginatedResponse<User>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<User>>>('/users', {
    params: {
      page,
      limit,
      sortBy,
      sortOrder,
      search: filters?.search || undefined,
      roleIds: filters?.roleIds?.length ? filters.roleIds.join(',') : undefined,
      isActive: filters?.isActive,
    },
  });
  return data.data;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const { data } = await apiClient.post<ApiResponse<User>>('/users', payload);
  return data.data;
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload,
): Promise<User> {
  const { data } = await apiClient.patch<ApiResponse<User>>(`/users/${id}`, payload);
  return data.data;
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}


export async function listRoles(): Promise<Role[]> {
  const { data } = await apiClient.get<ApiResponse<Role[]>>('/roles');
  return data.data;
}
