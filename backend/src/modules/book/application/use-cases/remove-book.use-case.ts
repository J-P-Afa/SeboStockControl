import { Result } from '../../../../common/interfaces/result.interface';
import { BookRepository } from '../../domain/book.repository';

export class RemoveBookUseCase {
  constructor(private readonly bookRepo: BookRepository) {}

  async execute(bookId: number, amount: number) {
    const book = await this.bookRepo.findById(bookId);
    if (!book) return Result.fail('BOOK_NOT_FOUND', 'Book not found');
    if (book.stock < amount) return Result.fail('INSUFFICIENT_STOCK', 'Not enough stock');

    book.stock -= amount;
    await this.bookRepo.update(bookId, { stock: book.stock });
    return Result.ok(book);
  }
}