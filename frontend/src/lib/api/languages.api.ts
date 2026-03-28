import type { Language, CreateLanguageData, UpdateLanguageData, ApiResponse } from '@/types';
import { apiClient } from './client';

export async function listLanguages(): Promise<Language[]> {
  const { data } = await apiClient.get<ApiResponse<Language[]>>('/languages');
  return data.data;
}

export async function createLanguage(payload: CreateLanguageData): Promise<Language> {
  const { data } = await apiClient.post<ApiResponse<Language>>('/languages', payload);
  return data.data;
}

export async function updateLanguage(id: number, payload: UpdateLanguageData): Promise<Language> {
  const { data } = await apiClient.patch<ApiResponse<Language>>(`/languages/${id}`, payload);
  return data.data;
}

export async function deleteLanguage(id: number): Promise<void> {
  await apiClient.delete(`/languages/${id}`);
}
