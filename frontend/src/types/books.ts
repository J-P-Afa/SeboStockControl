import { EditionType, Condition, Status } from './index';

export interface Book {
  id: number;
  title: string;
  isbn13?: string | null;
  isbn10?: string | null;
  listPrice: number | null;
  editionType: EditionType;
  volume?: string | null;
  condition: Condition;
  status: Status;
  publicationYear?: number | null;
  pages?: number | null;
  synopsis?: string | null;
  dimensions?: string | null;
  weight: number;
  publisherId?: number | null;
  languageId?: number | null;
  genreId?: number | null;
  classificacaoId?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Virtual field from relation if included in future
  stock?: number;
}

export interface ExternalBook {
  title: string;
  subtitle?: string | null;
  publisher?: string | null;
  publisherId?: number | null;
  language?: string | null;
  languageId?: number | null;
  genreId?: number | null;
  isbn10?: string | null;
  isbn13?: string | null;
  publicationYear?: number | null;
  pages?: number | null;
  synopsis?: string | null;
  coverUrl?: string | null;
  subjects?: string[] | null;
}

export interface CreateBookPayload {
  title: string;
  isbn13?: string | null;
  isbn10?: string | null;
  listPrice?: number | null;
  editionType: EditionType;
  volume?: string | null;
  condition: Condition;
  status: Status;
  publicationYear?: number | null;
  pages?: number | null;
  synopsis?: string | null;
  dimensions?: string | null;
  weight: number;
  publisherId?: number | null;
  languageId?: number | null;
  genreId?: number | null;
  classificacaoId?: number | null;
}

export type UpdateBookPayload = Partial<CreateBookPayload>;

export interface ListBooksFilters {
  search?: string;
  classificacaoId?: number;
  publisherId?: number;
  languageId?: number;
  genreId?: number;
  condition?: Condition;
  status?: Status;
  isActive?: boolean;
  inStock?: boolean;
}
