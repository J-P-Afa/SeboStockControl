import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  useCreateGenre,
  useDeleteGenre,
  useGenres,
  useUpdateGenre,
} from './use-genres';
import { server } from '@/lib/api/mocks/server';
import { toast } from 'sonner';
import type { CreateGenrePayload, UpdateGenrePayload } from '@/types';

const API_URL = 'http://localhost:3001/api';

let queryClient: QueryClient;

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('useGenres hook', () => {
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  it('fetches genres with pagination, sorting, and filters', async () => {
    const mockGenres = [
      {
        id: 1,
        description: 'Ficcao',
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      },
    ];

    server.use(
      http.get(`${API_URL}/genres`, ({ request }) => {
        const url = new URL(request.url);

        expect(url.searchParams.get('page')).toBe('2');
        expect(url.searchParams.get('limit')).toBe('5');
        expect(url.searchParams.get('sortBy')).toBe('description');
        expect(url.searchParams.get('sortOrder')).toBe('desc');
        expect(url.searchParams.get('search')).toBe('fic');
        expect(url.searchParams.get('isActive')).toBe('true');

        return HttpResponse.json({
          items: mockGenres,
          total: 1,
          page: 2,
          limit: 5,
          totalPages: 1,
        });
      }),
    );

    const { result } = renderHook(
      () =>
        useGenres(2, 5, 'description', 'desc', {
          search: 'fic',
          isActive: true,
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.items).toEqual(mockGenres);
  });

  it('handles fetch errors', async () => {
    server.use(
      http.get(`${API_URL}/genres`, () => new HttpResponse(null, { status: 500 })),
    );

    const { result } = renderHook(() => useGenres(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });

  it('creates a genre and invalidates genre queries', async () => {
    const payload: CreateGenrePayload = { description: 'Drama' };
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    server.use(
      http.post(`${API_URL}/genres`, async ({ request }) => {
        expect(await request.json()).toEqual(payload);

        return HttpResponse.json(
          {
            id: 2,
            description: 'Drama',
            isActive: true,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
          },
          { status: 201 },
        );
      }),
    );

    const { result } = renderHook(() => useCreateGenre(), { wrapper });

    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['genres'],
      exact: false,
    });
    expect(toast.success).toHaveBeenCalledWith('Gênero criado com sucesso');
  });

  it('shows an error toast when creating a genre fails', async () => {
    server.use(
      http.post(`${API_URL}/genres`, () =>
        HttpResponse.json({ message: 'Descricao duplicada' }, { status: 400 }),
      ),
    );

    const { result } = renderHook(() => useCreateGenre(), { wrapper });

    result.current.mutate({ description: 'Drama' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalled();
  });

  it('updates a genre successfully', async () => {
    const payload: UpdateGenrePayload = { description: 'Romance', isActive: false };

    server.use(
      http.put(`${API_URL}/genres/1`, async ({ request }) => {
        expect(await request.json()).toEqual(payload);

        return HttpResponse.json({
          id: 1,
          description: 'Romance',
          isActive: false,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z',
        });
      }),
    );

    const { result } = renderHook(() => useUpdateGenre(), { wrapper });

    result.current.mutate({ id: 1, payload });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith('Gênero atualizado com sucesso');
  });

  it('shows an error toast when updating a genre fails', async () => {
    server.use(
      http.put(`${API_URL}/genres/1`, () =>
        HttpResponse.json({ message: 'Update failed' }, { status: 400 }),
      ),
    );

    const { result } = renderHook(() => useUpdateGenre(), { wrapper });

    result.current.mutate({ id: 1, payload: { description: 'Erro' } });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalled();
  });

  it('deletes a genre successfully', async () => {
    server.use(
      http.delete(`${API_URL}/genres/1`, () => new HttpResponse(null, { status: 204 })),
    );

    const { result } = renderHook(() => useDeleteGenre(), { wrapper });

    result.current.mutate(1);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith('Gênero excluído com sucesso');
  });

  it('shows an error toast when deleting a genre fails', async () => {
    server.use(
      http.delete(`${API_URL}/genres/1`, () =>
        HttpResponse.json({ message: 'Delete failed' }, { status: 400 }),
      ),
    );

    const { result } = renderHook(() => useDeleteGenre(), { wrapper });

    result.current.mutate(1);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalled();
  });
});
