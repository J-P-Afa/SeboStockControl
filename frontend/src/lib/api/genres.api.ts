import type { Genre, CreateGenreData, UpdateGenreData, ApiResponse } from '@/types';
import { apiClient } from './client';

export async function listGenres(): Promise<Genre[]> {
  const { data } = await apiClient.get<ApiResponse<Genre[]>>('/genres');
  return data.data;
}

export async function createGenre(payload: CreateGenreData): Promise<Genre> {
  const { data } = await apiClient.post<ApiResponse<Genre>>('/genres', payload);
  return data.data;
}

export async function updateGenre(id: number, payload: UpdateGenreData): Promise<Genre> {
  const { data } = await apiClient.patch<ApiResponse<Genre>>(`/genres/${id}`, payload);
  return data.data;
}

export async function deleteGenre(id: number): Promise<void> {
  await apiClient.delete(`/genres/${id}`);
}
