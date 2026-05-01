import { BookEntity } from './book.entity';
import { EditionType, Condition, Status } from '@prisma/client';
import { Prisma } from '@prisma/client';

export const BOOK_REPOSITORY = Symbol('BOOK_REPOSITORY');

export interface CreateBookParams {
  title: string;
  subtitle?: string | null;
  isbn13?: string | null;
  isbn10?: string | null;
  listPrice?: Prisma.Decimal | null;
  editionType: EditionType;
  volume?: string | null;
  collection?: string | null;
  condition: Condition;
  status: Status;
  publicationYear?: number | null;
  pages?: number | null;
  synopsis?: string | null;
  dimensions?: string | null;
  weight: Prisma.Decimal;
  publisherId?: number | null;
  languageId?: number | null;
  genreId?: number | null;
  classificacaoId?: number | null;
  isActive?: boolean;
}

export interface UpdateBookParams {
  title?: string;
  subtitle?: string | null;
  isbn13?: string | null;
  isbn10?: string | null;
  listPrice?: Prisma.Decimal | null;
  editionType?: EditionType;
  volume?: string | null;
  collection?: string | null;
  condition?: Condition;
  status?: Status;
  publicationYear?: number | null;
  pages?: number | null;
  synopsis?: string | null;
  dimensions?: string | null;
  weight?: Prisma.Decimal;
  publisherId?: number | null;
  languageId?: number | null;
  genreId?: number | null;
  classificacaoId?: number | null;
  isActive?: boolean;
}

export interface BookFilters {
  id?: number;
  isbn?: string;
  search?: string;
  classificacaoId?: number;
  publisherId?: number;
  publisherIds?: number[];
  languageId?: number;
  languageIds?: number[];
  genreId?: number;
  /** @ai-context Filtro por edição: normal | variante */
  editionType?: EditionType;
  editionTypes?: EditionType[];
  /** @ai-context Filtro por volume (ex: "1", "2", "Único") */
  volume?: string;
  /** @ai-context Filtro por coleção */
  collection?: string;
  condition?: Condition;
  conditions?: Condition[];
  status?: Status;
  statuses?: Status[];
  isActive?: boolean;
  /** @ai-context Filtro por itens que possuem estoque positivo */
  inStock?: boolean;

  // Pagination and Sorting
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IBookRepository {
  findById(id: number): Promise<BookEntity | null>;
  findAll(
    filters?: BookFilters,
  ): Promise<{ items: BookEntity[]; total: number }>;
  findByIsbn(isbn: string): Promise<BookEntity | null>;
  findByIsbn13AndCondition(
    isbn13: string,
    condition: Condition,
  ): Promise<BookEntity | null>;
  findByIsbn10AndCondition(
    isbn10: string,
    condition: Condition,
  ): Promise<BookEntity | null>;
  create(data: CreateBookParams): Promise<BookEntity>;
  update(id: number, data: UpdateBookParams): Promise<BookEntity>;
  delete(id: number): Promise<void>;
}
