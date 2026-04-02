import type {
  Book,
  PaginatedResponse,
  CreateBookPayload,
  UpdateBookPayload,
  ListBooksFilters,
  ApiResponse,
  ExternalBook,
} from '@/types';
import { apiClient } from './client';

export async function lookupExternalBook(isbn: string): Promise<ExternalBook | null> {
  const { data } = await apiClient.get<ApiResponse<ExternalBook>>(`/books/external-lookup/${isbn}`);
  return data.data;
}

export async function listBooks(
  page: number = 1,
  limit: number = 10,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  filters?: ListBooksFilters,
): Promise<PaginatedResponse<Book>> {
  const { data } = await apiClient.get<ApiResponse<Book[]>>('/books', {
    params: {
      page,
      limit,
      sortBy,
      sortOrder,
      ...filters,
    },
  });

  const books = data.data ?? [];
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
  const { data } = await apiClient.post<ApiResponse<Book>>('/books', payload);
  if (!data.success) {
    throw data.error || { message: 'Erro desconhecido ao criar livro' };
  }
  return data.data;
}

export async function updateBook(
  id: number,
  payload: UpdateBookPayload,
): Promise<Book> {
  const { data } = await apiClient.patch<ApiResponse<Book>>(`/books/${id}`, payload);
  if (!data.success) {
    throw data.error || { message: 'Erro desconhecido ao atualizar livro' };
  }
  return data.data;
}

export async function deleteBook(id: number): Promise<void> {
  await apiClient.delete(`/books/${id}`);
}