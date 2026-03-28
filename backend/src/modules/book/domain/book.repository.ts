import { BookEntity } from './book.entity';

export interface GetBooksInput {
  title?: string;
  genreId?: number;
  publisherId?: number;
  languageId?: number;
  condition?: string;
  status?: string;
}

export interface BookRepository {
  create(book: BookEntity): Promise<BookEntity>;
  findAll(filters?: GetBooksInput): Promise<BookEntity[]>;
  findById(id: number): Promise<BookEntity | null>;
  findByIsbn13AndCondition(isbn13: string, condition: string): Promise<BookEntity | null>;
  findByIsbn10AndCondition(isbn10: string, condition: string): Promise<BookEntity | null>;
  update(book: BookEntity): Promise<BookEntity>;
  delete(id: number): Promise<boolean>;
}