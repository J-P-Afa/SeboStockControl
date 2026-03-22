import type { LoginCredentials, TokenResponse } from '@/types';
import { apiClient } from './client';

export async function login(
  credentials: LoginCredentials,
): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>(
    '/auth/login',
    credentials,
  );
  return data;
}
