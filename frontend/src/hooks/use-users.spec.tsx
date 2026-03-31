import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useRoles } from './use-users';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/lib/api/mocks/server';
import { toast } from 'sonner';
import type { CreateUserPayload, UpdateUserPayload } from '@/types';

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
      { id: '1', name: 'User 1', email: 'user1@example.com', roleId: '1', roleName: 'ADMIN' },
      { id: '2', name: 'User 2', email: 'user2@example.com', roleId: '2', roleName: 'USER' },
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

  it('should fetch roles successfully', async () => {
    const mockRoles = [
      { id: '1', name: 'ADMIN' },
      { id: '2', name: 'USER' },
    ];

    server.use(
      http.get(`${API_URL}/roles`, () => {
        return HttpResponse.json({
          success: true,
          data: mockRoles
        });
      })
    );

    const { result } = renderHook(() => useRoles(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockRoles);
  });

  it('should create a user successfully', async () => {
    const newUser: CreateUserPayload = { name: 'New User', email: 'new@example.com', roleId: '2', password: 'password' };
    
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

    result.current.mutate({ name: 'Error', email: 'error@example.com', roleId: '2', password: 'password' } as CreateUserPayload);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalled();
  });

  it('should update a user successfully', async () => {
    const updatedUser: UpdateUserPayload = { name: 'Updated User' };
    
    server.use(
      http.patch(`${API_URL}/users/1`, async () => {
        return HttpResponse.json({
          success: true,
          data: { id: '1', name: 'Updated User', email: 'user1@example.com', roleId: '1' }
        });
      })
    );

    const { result } = renderHook(() => useUpdateUser(), { wrapper });

    result.current.mutate({ id: '1', payload: updatedUser });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith('Usuário atualizado com sucesso');
  });

  it('should handle update user error', async () => {
    server.use(
      http.patch(`${API_URL}/users/1`, () => {
        return HttpResponse.json({ message: 'Update failed' }, { status: 400 });
      })
    );

    const { result } = renderHook(() => useUpdateUser(), { wrapper });

    result.current.mutate({ id: '1', payload: { name: 'Error' } });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalled();
  });

  it('should delete a user successfully', async () => {
    server.use(
      http.delete(`${API_URL}/users/1`, () => {
        return HttpResponse.json({
          success: true,
          data: { id: '1' }
        });
      })
    );

    const { result } = renderHook(() => useDeleteUser(), { wrapper });

    result.current.mutate('1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith('Usuário excluído com sucesso');
  });

  it('should handle delete user error', async () => {
    server.use(
      http.delete(`${API_URL}/users/1`, () => {
        return HttpResponse.json({ message: 'Delete failed' }, { status: 400 });
      })
    );

    const { result } = renderHook(() => useDeleteUser(), { wrapper });

    result.current.mutate('1');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalled();
  });
});

