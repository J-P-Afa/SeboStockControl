import type { Genre, CreateGenreData, UpdateGenreData } from '@/types';
import { apiClient } from './client';

export async function listGenres(): Promise<Genre[]> {
  const { data } = await apiClient.get<Genre[]>('/genres');
  return data;
}

export async function createGenre(payload: CreateGenreData): Promise<Genre> {
  const { data } = await apiClient.post<Genre>('/genres', payload);
  return data;
}

export async function updateGenre(id: number, payload: UpdateGenreData): Promise<Genre> {
  const { data } = await apiClient.patch<Genre>(`/genres/${id}`, payload);
  return data;
}

export async function deleteGenre(id: number): Promise<void> {
  await apiClient.delete(`/genres/${id}`);
}
