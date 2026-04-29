import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useBooks, useCreateBook, useUpdateBook, useDeleteBook } from './use-books';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/lib/api/mocks/server';
import { toast } from 'sonner';
import type { CreateBookPayload, UpdateBookPayload } from '@/types';
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
      { id: 1, title: 'Book 1', isbn: '123' },
      { id: 2, title: 'Book 2', isbn: '456' },
    ];

    server.use(
      http.get(`${API_URL}/books`, () => {
        return HttpResponse.json({
          success: true,
          data: {
            items: mockBooks,
            total: 2,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        });
      })
    );

    const { result } = renderHook(() => useBooks(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.items).toEqual(mockBooks);
    expect(result.current.data?.total).toBe(2);
  });

  it('should create a book successfully', async () => {
    const newBook: CreateBookPayload = { 
      title: 'New Book', 
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
        return HttpResponse.json({
          success: true,
          data: { id: 3, ...newBook }
        }, { status: 201 });
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
        return HttpResponse.json({ 
          success: false,
          error: { code: 'BAD_REQUEST', message: 'ISBN already exists' } 
        }, { status: 400 });
      })
    );

    const { result } = renderHook(() => useCreateBook(), { wrapper });

    result.current.mutate({ title: 'Error' } as CreateBookPayload);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalled();
  });

  it('should update a book successfully', async () => {
    const updatedBook: UpdateBookPayload = { title: 'Updated Book' };
    
    server.use(
      http.patch(`${API_URL}/books/1`, () => {
        return HttpResponse.json({
          success: true,
          data: { id: 1, title: 'Updated Book' }
        });
      })
    );

    const { result } = renderHook(() => useUpdateBook(), { wrapper });

    result.current.mutate({ id: 1, payload: updatedBook });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith('Livro atualizado com sucesso');
  });

  it('should handle update book error', async () => {
    server.use(
      http.patch(`${API_URL}/books/1`, () => {
        return HttpResponse.json({ 
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Update failed' } 
        }, { status: 400 });
      })
    );

    const { result } = renderHook(() => useUpdateBook(), { wrapper });

    result.current.mutate({ id: 1, payload: { title: 'Error' } });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalled();
  });

  it('should delete a book successfully', async () => {
    server.use(
      http.delete(`${API_URL}/books/1`, () => {
        return HttpResponse.json({
          success: true,
          data: { id: 1 }
        });
      })
    );

    const { result } = renderHook(() => useDeleteBook(), { wrapper });

    result.current.mutate(1);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith('Livro excluído com sucesso');
  });

  it('should handle delete book error', async () => {
    server.use(
      http.delete(`${API_URL}/books/1`, () => {
        return HttpResponse.json({ 
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Delete failed' } 
        }, { status: 400 });
      })
    );

    const { result } = renderHook(() => useDeleteBook(), { wrapper });

    result.current.mutate(1);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalled();
  });
});

