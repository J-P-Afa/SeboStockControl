/**
 * @ai-context Shape of error body returned by the backend (Result.error).
 * Controllers throw HttpException with this object as response body.
 */
export interface ApiErrorResponse {
  readonly code?: string;
  readonly message?: string;
}

/**
 * User-facing messages in PT-BR for known API error codes.
 * Used when backend returns structured errors so the UI stays consistent.
 */
export const API_ERROR_MESSAGES: Record<string, string> = {
  USER_EMAIL_EXISTS: 'Já existe um usuário com este e-mail',
  USER_NOT_FOUND: 'Usuário não encontrado',
  AUTH_INVALID_CREDENTIALS: 'Email ou senha inválidos',
  AUTH_USER_INACTIVE: 'Conta de usuário inativa',
  AUTH_INVALID_REFRESH_TOKEN: 'Sessão expirada. Faça login novamente.',
  AUTH_USER_NOT_FOUND: 'Usuário não encontrado ou inativo',
  ROLE_ALREADY_EXISTS: 'Já existe um cargo com este nome',
  ROLE_NOT_FOUND: 'Cargo não encontrado',
};

/**
 * Extracts a user-facing error message from an API/axios error.
 * Prefers PT-BR mapping by code, then backend message, then fallback.
 *
 * @param error - Caught error (typically Axios error with response.data)
 * @param fallback - Message to show when no structured error is available
 * @returns Message to display in toast or form error state
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  const data = getErrorResponseData(error);
  if (!data) return fallback;

  // 1. Direct code match in mapping
  if (typeof data.code === 'string' && data.code in API_ERROR_MESSAGES) {
    return API_ERROR_MESSAGES[data.code];
  }

  // 2. Resilience: check nested code/message if backend nests them (NestJS anomaly)
  const nested = data as Record<string, { code?: string; message?: string } | undefined>;
  const nestedCode = nested.message?.code || nested.error?.code;
  const nestedMessage = nested.message?.message || nested.error?.message;

  if (typeof nestedCode === 'string' && nestedCode in API_ERROR_MESSAGES) {
    return API_ERROR_MESSAGES[nestedCode];
  }

  // 3. Use raw message if present
  if (typeof data.message === 'string' && data.message.trim().length > 0) {
    return data.message.trim();
  }

  // 4. Use nested message if available
  if (typeof nestedMessage === 'string' && nestedMessage.trim().length > 0) {
    return nestedMessage.trim();
  }

  return fallback;
}

/**
 * Returns response.data from an Axios-like error if present and object-shaped.
 * @side-effects None; pure read.
 */
function getErrorResponseData(error: unknown): ApiErrorResponse | null {
  if (error === null || typeof error !== 'object') return null;
  const err = error as { response?: { data?: unknown } };
  const data = err.response?.data;
  if (data === null || typeof data !== 'object') return null;
  return data as ApiErrorResponse;
}
