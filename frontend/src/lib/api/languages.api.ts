import type { Language, CreateLanguagePayload, UpdateLanguagePayload, ApiResponse, PaginatedResponse, ListLanguagesFilters } from '@/types';
import { apiClient } from './client';

export async function listLanguages(
  page: number = 1,
  limit: number = 10,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  filters?: ListLanguagesFilters
): Promise<PaginatedResponse<Language>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Language>>>('/languages', {
    params: {
      page,
      limit,
      sortBy,
      sortOrder,
      search: filters?.search,
      isActive: filters?.isActive,
    },
  });

  return data.data;
}

export async function createLanguage(payload: CreateLanguagePayload): Promise<Language> {
  const { data } = await apiClient.post<ApiResponse<Language>>('/languages', payload);
  return data.data;
}

export async function updateLanguage(id: number, payload: UpdateLanguagePayload): Promise<Language> {
  const { data } = await apiClient.put<ApiResponse<Language>>(`/languages/${id}`, payload);
  return data.data;
}

export async function deleteLanguage(id: number): Promise<void> {
  await apiClient.delete(`/languages/${id}`);
}
