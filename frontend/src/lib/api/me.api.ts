import { apiClient } from './client';
import type { MeResponse, ThemePreference } from '@/types';

export async function getMe(): Promise<MeResponse> {
  const { data } = await apiClient.get<MeResponse>('/users/me');
  return data;
}

export async function updateMyPreferences(body: {
  themePreference: ThemePreference;
}): Promise<MeResponse> {
  const { data } = await apiClient.patch<MeResponse>(
    '/users/me/preferences',
    body,
  );
  return data;
}
