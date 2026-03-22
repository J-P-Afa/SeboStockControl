import { Book } from './book.entity';

export interface BookRepository {
  create(data: Partial<Book>): Promise<Book>;
  findById(id: number): Promise<Book | null>;
  update(id: number, data: Partial<Book>): Promise<Book>;
}