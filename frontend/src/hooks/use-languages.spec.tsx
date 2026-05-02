import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  useCreateLanguage,
  useDeleteLanguage,
  useLanguages,
  useUpdateLanguage,
} from './use-languages';
import { server } from '@/lib/api/mocks/server';
import { toast } from 'sonner';
import type { CreateLanguagePayload, UpdateLanguagePayload } from '@/types';

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

describe('useLanguages hook', () => {
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  it('fetches languages with pagination, sorting, and filters', async () => {
    const mockLanguages = [
      {
        id: 1,
        description: 'Portugues',
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      },
    ];

    server.use(
      http.get(`${API_URL}/languages`, ({ request }) => {
        const url = new URL(request.url);

        expect(url.searchParams.get('page')).toBe('3');
        expect(url.searchParams.get('limit')).toBe('7');
        expect(url.searchParams.get('sortBy')).toBe('description');
        expect(url.searchParams.get('sortOrder')).toBe('asc');
        expect(url.searchParams.get('search')).toBe('por');
        expect(url.searchParams.get('isActive')).toBe('false');

        return HttpResponse.json({
          items: mockLanguages,
          total: 1,
          page: 3,
          limit: 7,
          totalPages: 1,
        });
      }),
    );

    const { result } = renderHook(
      () =>
        useLanguages(3, 7, 'description', 'asc', {
          search: 'por',
          isActive: false,
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.items).toEqual(mockLanguages);
  });

  it('handles fetch errors', async () => {
    server.use(
      http.get(`${API_URL}/languages`, () => new HttpResponse(null, { status: 500 })),
    );

    const { result } = renderHook(() => useLanguages(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });

  it('creates a language and invalidates language queries', async () => {
    const payload: CreateLanguagePayload = { description: 'Ingles' };
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    server.use(
      http.post(`${API_URL}/languages`, async ({ request }) => {
        expect(await request.json()).toEqual(payload);

        return HttpResponse.json(
          {
            id: 2,
            description: 'Ingles',
            isActive: true,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
          },
          { status: 201 },
        );
      }),
    );

    const { result } = renderHook(() => useCreateLanguage(), { wrapper });

    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['languages'],
      exact: false,
    });
    expect(toast.success).toHaveBeenCalledWith('Idioma criado com sucesso');
  });

  it('shows an error toast when creating a language fails', async () => {
    server.use(
      http.post(`${API_URL}/languages`, () =>
        HttpResponse.json({ message: 'Descricao duplicada' }, { status: 400 }),
      ),
    );

    const { result } = renderHook(() => useCreateLanguage(), { wrapper });

    result.current.mutate({ description: 'Ingles' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalled();
  });

  it('updates a language successfully', async () => {
    const payload: UpdateLanguagePayload = {
      description: 'Espanhol',
      isActive: false,
    };

    server.use(
      http.put(`${API_URL}/languages/1`, async ({ request }) => {
        expect(await request.json()).toEqual(payload);

        return HttpResponse.json({
          id: 1,
          description: 'Espanhol',
          isActive: false,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z',
        });
      }),
    );

    const { result } = renderHook(() => useUpdateLanguage(), { wrapper });

    result.current.mutate({ id: 1, payload });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith('Idioma atualizado com sucesso');
  });

  it('shows an error toast when updating a language fails', async () => {
    server.use(
      http.put(`${API_URL}/languages/1`, () =>
        HttpResponse.json({ message: 'Update failed' }, { status: 400 }),
      ),
    );

    const { result } = renderHook(() => useUpdateLanguage(), { wrapper });

    result.current.mutate({ id: 1, payload: { description: 'Erro' } });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalled();
  });

  it('deletes a language successfully', async () => {
    server.use(
      http.delete(`${API_URL}/languages/1`, () => new HttpResponse(null, { status: 204 })),
    );

    const { result } = renderHook(() => useDeleteLanguage(), { wrapper });

    result.current.mutate(1);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith('Idioma excluído com sucesso');
  });

  it('shows an error toast when deleting a language fails', async () => {
    server.use(
      http.delete(`${API_URL}/languages/1`, () =>
        HttpResponse.json({ message: 'Delete failed' }, { status: 400 }),
      ),
    );

    const { result } = renderHook(() => useDeleteLanguage(), { wrapper });

    result.current.mutate(1);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalled();
  });
});
