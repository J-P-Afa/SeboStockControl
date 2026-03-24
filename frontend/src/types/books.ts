export interface Book {
  id: number;
  title: string;
  author: string;
  stock: number;
  price: number;
  publisher?: string | null;
  edition?: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateBookPayload {
  title: string;
  author: string;
  stock?: number;
  price: number;
  publisher?: string | null;
  edition?: string | null;
}

export interface UpdateBookPayload {
  title?: string;
  author?: string;
  stock?: number;
  price?: number;
  publisher?: string | null;
  edition?: string | null;
}

export interface ListBooksFilters {
  search?: string;
  author?: string;
  publisher?: string | null;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}
