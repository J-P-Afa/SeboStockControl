import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUsers, useCreateUser } from './use-users';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/lib/api/mocks/server';
import { toast } from 'sonner';
import type { CreateUserPayload } from '@/types';

const API_URL = 'http://localhost:3001/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('useUsers hook', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('should fetch users successfully', async () => {
    const mockUsers = [
      { id: '1', name: 'User 1', email: 'user1@example.com', role: 'ADMIN' },
      { id: '2', name: 'User 2', email: 'user2@example.com', role: 'USER' },
    ];

    server.use(
      http.get(`${API_URL}/users`, () => {
        return HttpResponse.json({
          success: true,
          data: {
            items: mockUsers,
            total: 2,
            page: 1,
            limit: 10,
            totalPages: 1,
          }
        });
      })
    );

    const { result } = renderHook(() => useUsers(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.items).toEqual(mockUsers);
    expect(result.current.data?.total).toBe(2);
  });

  it('should handle fetch users error', async () => {
    server.use(
      http.get(`${API_URL}/users`, () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useUsers(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });

  it('should create a user successfully', async () => {
    const newUser: CreateUserPayload = { name: 'New User', email: 'new@example.com', role: 'USER', password: 'password' };
    
    server.use(
      http.post(`${API_URL}/users`, async () => {
        return HttpResponse.json({
          success: true,
          data: { id: '3', ...newUser }
        }, { status: 201 });
      })
    );

    const { result } = renderHook(() => useCreateUser(), { wrapper });

    result.current.mutate(newUser);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith('Usuário criado com sucesso');
  });

  it('should handle create user error', async () => {
    server.use(
      http.post(`${API_URL}/users`, () => {
        return HttpResponse.json({ message: 'Email already exists' }, { status: 400 });
      })
    );

    const { result } = renderHook(() => useCreateUser(), { wrapper });

    result.current.mutate({ name: 'Error', email: 'error@example.com', role: 'USER', password: 'password' } as CreateUserPayload);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalled();
  });
});
