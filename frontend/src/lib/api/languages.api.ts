import type { Language, CreateLanguagePayload, UpdateLanguagePayload, PaginatedResponse, ListLanguagesFilters } from '@/types';
import { apiClient } from './client';

export async function listLanguages(
  page: number = 1,
  limit: number = 10,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  filters?: ListLanguagesFilters
): Promise<PaginatedResponse<Language>> {
  const { data } = await apiClient.get<PaginatedResponse<Language>>('/languages', {
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

export async function createLanguage(payload: CreateLanguagePayload): Promise<Language> {
  const { data } = await apiClient.post<Language>('/languages', payload);
  return data;
}

export async function updateLanguage(id: number, payload: UpdateLanguagePayload): Promise<Language> {
  const { data } = await apiClient.put<Language>(`/languages/${id}`, payload);
  return data;
}

export async function deleteLanguage(id: number): Promise<void> {
  await apiClient.delete(`/languages/${id}`);
}
