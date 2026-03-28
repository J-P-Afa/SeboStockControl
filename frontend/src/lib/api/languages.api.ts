import type { Language, CreateLanguageData, UpdateLanguageData } from '@/types';
import { apiClient } from './client';

export async function listLanguages(): Promise<Language[]> {
  const { data } = await apiClient.get<Language[]>('/languages');
  return data;
}

export async function createLanguage(payload: CreateLanguageData): Promise<Language> {
  const { data } = await apiClient.post<Language>('/languages', payload);
  return data;
}

export async function updateLanguage(id: number, payload: UpdateLanguageData): Promise<Language> {
  const { data } = await apiClient.patch<Language>(`/languages/${id}`, payload);
  return data;
}

export async function deleteLanguage(id: number): Promise<void> {
  await apiClient.delete(`/languages/${id}`);
}
