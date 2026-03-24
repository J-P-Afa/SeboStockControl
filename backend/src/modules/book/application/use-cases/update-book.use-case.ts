import { Result } from '../../../../common/interfaces/result.interface';
import { BookRepository } from '../../domain/book.repository';
import type { Book } from '../../domain/book.entity';

export class UpdateBookUseCase {
  constructor(private readonly bookRepo: BookRepository) {}

  async execute(bookId: number, data: Partial<Omit<Book, 'id'>>) {
    const book = await this.bookRepo.findById(bookId);
    if (!book) return Result.fail('BOOK_NOT_FOUND', 'Book not found');

    const updatedBook = await this.bookRepo.update(bookId, data);
    return Result.ok(updatedBook);
  }
}
