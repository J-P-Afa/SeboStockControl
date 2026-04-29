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
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));

  if (sortBy) params.set('sortBy', sortBy);
  if (sortOrder) params.set('sortOrder', sortOrder);

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;

      if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, String(item)));
        return;
      }

      params.set(key, String(value));
    });
  }

  const { data } = await apiClient.get<PaginatedResponse<Book>>('/books', {
    params,
  });

  return data;
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
