import { apiClient } from './client';
import type { MeResponse, ThemePreference, ApiResponse } from '@/types';

export async function getMe(): Promise<MeResponse> {
  const { data } = await apiClient.get<ApiResponse<MeResponse>>('/users/me');
  return data.data;
}

export async function updateMyPreferences(body: {
  themePreference: ThemePreference;
}): Promise<MeResponse> {
  const { data } = await apiClient.patch<ApiResponse<MeResponse>>(
    '/users/me/preferences',
    body,
  );
  return data.data;
}
