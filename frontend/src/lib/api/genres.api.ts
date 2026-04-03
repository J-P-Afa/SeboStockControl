import type { Genre, CreateGenreData, UpdateGenreData, PaginatedResponse, ListGenresFilters } from '@/types';
import { apiClient } from './client';

export async function listGenres(
  page: number = 1,
  limit: number = 10,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  filters?: ListGenresFilters
): Promise<PaginatedResponse<Genre>> {
  const { data } = await apiClient.get<PaginatedResponse<Genre>>('/genres', {
    params: {
      page,
      limit,
      sortBy,
      sortOrder,
      search: filters?.search,
      isActive: filters?.isActive,
    },
  });

  return data;
}

export async function createGenre(payload: CreateGenreData): Promise<Genre> {
  const { data } = await apiClient.post<Genre>('/genres', payload);
  return data;
}

export async function updateGenre(id: number, payload: UpdateGenreData): Promise<Genre> {
  const { data } = await apiClient.put<Genre>(`/genres/${id}`, payload);
  return data;
}

export async function deleteGenre(id: number): Promise<void> {
  await apiClient.delete(`/genres/${id}`);
}