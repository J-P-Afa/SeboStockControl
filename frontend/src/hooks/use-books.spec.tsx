import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useBooks, useCreateBook } from './use-books';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/lib/api/mocks/server';
import { toast } from 'sonner';
import type { CreateBookPayload } from '@/types';
import { EditionType, Condition, Status } from '@/types';

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

describe('useBooks hook', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('should fetch books successfully', async () => {
    const mockBooks = [
      { id: 1, title: 'Book 1', author: 'Author 1', isbn: '123' },
      { id: 2, title: 'Book 2', author: 'Author 2', isbn: '456' },
    ];

    server.use(
      http.get(`${API_URL}/books`, () => {
        return HttpResponse.json({
          data: mockBooks,
          meta: {
            total: 2,
            page: 1,
            lastPage: 1,
          },
        });
      })
    );

    const { result } = renderHook(() => useBooks(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.items).toEqual(mockBooks);
  });

  it('should create a book successfully', async () => {
    const newBook: CreateBookPayload = { 
      title: 'New Book', 
      author: 'New Author', 
      isbn13: '1234567890123',
      editionType: EditionType.NORMAL,
      condition: Condition.NOVO,
      status: Status.COMPLETO,
      weight: 100,
      publisherId: 1,
      languageId: 1,
      genreId: 1
    };
    
    server.use(
      http.post(`${API_URL}/books`, () => {
        return HttpResponse.json({ id: 3, ...newBook }, { status: 201 });
      })
    );

    const { result } = renderHook(() => useCreateBook(), { wrapper });

    result.current.mutate(newBook);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith('Livro criado com sucesso');
  });

  it('should handle create book error', async () => {
    server.use(
      http.post(`${API_URL}/books`, () => {
        return HttpResponse.json({ message: 'ISBN already exists' }, { status: 400 });
      })
    );

    const { result } = renderHook(() => useCreateBook(), { wrapper });

    result.current.mutate({ title: 'Error' } as CreateBookPayload);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalled();
  });
});
