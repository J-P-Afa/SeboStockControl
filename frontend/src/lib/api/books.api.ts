import type {
  Book,
  PaginatedResponse,
  CreateBookPayload,
  UpdateBookPayload,
  ListBooksFilters,
} from '@/types';
import { apiClient } from './client';

export async function listBooks(
  page: number = 1,
  limit: number = 10,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  filters?: ListBooksFilters,
): Promise<PaginatedResponse<Book>> {
  const { data } = await apiClient.get<{ success: boolean; books: Book[] }>('/books', {
    params: {
      page,
      limit,
      sortBy,
      sortOrder,
      search: filters?.search || undefined,
      author: filters?.author || undefined,
      publisher: filters?.publisher || undefined,
      minPrice: filters?.minPrice,
      maxPrice: filters?.maxPrice,
      inStock: filters?.inStock,
    },
  });

  const books = data.books ?? [];
  const total = books.length;

  return {
    items: books,
    total,
    page: 1,
    limit: total,
    totalPages: total > 0 ? 1 : 0,
  };
}

export async function createBook(payload: CreateBookPayload): Promise<Book> {
  const { data } = await apiClient.post<{ success: boolean; book: Book }>('/books', payload);
  return data.book;
}

export async function updateBook(
  id: number,
  payload: UpdateBookPayload,
): Promise<Book> {
  const { data } = await apiClient.patch<{ success: boolean; book: Book }>(`/books/${id}`, payload);
  return data.book;
}

export async function deleteBook(id: number): Promise<void> {
  await apiClient.delete(`/books/${id}`);
}