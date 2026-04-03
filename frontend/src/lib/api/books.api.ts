import type {
  Book,
  PaginatedResponse,
  CreateBookPayload,
  UpdateBookPayload,
  ListBooksFilters,
  ExternalBook,
} from '@/types';
import { apiClient } from './client';

export async function lookupExternalBook(isbn: string): Promise<ExternalBook | null> {
  const { data } = await apiClient.get<ExternalBook | null>(`/books/external-lookup/${isbn}`);
  return data;
}

export async function listBooks(
  page: number = 1,
  limit: number = 10,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  filters?: ListBooksFilters,
): Promise<PaginatedResponse<Book>> {
  const { data: books = [] } = await apiClient.get<Book[]>('/books', {
    params: {
      page,
      limit,
      sortBy,
      sortOrder,
      ...filters,
    },
  });

  const total = books.length;

  // Mock pagination metadata as backend returns full list for now
  return {
    items: books,
    total,
    page: 1,
    limit: total || limit,
    totalPages: total > 0 ? 1 : 0,
  };
}

export async function createBook(payload: CreateBookPayload): Promise<Book> {
  const { data } = await apiClient.post<Book>('/books', payload);
  return data;
}

export async function updateBook(
  id: number,
  payload: UpdateBookPayload,
): Promise<Book> {
  const { data } = await apiClient.patch<Book>(`/books/${id}`, payload);
  return data;
}

export async function deleteBook(id: number): Promise<void> {
  await apiClient.delete<void>(`/books/${id}`);
}
