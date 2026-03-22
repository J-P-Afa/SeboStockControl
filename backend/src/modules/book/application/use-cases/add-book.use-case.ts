import { Result } from '../../../../common/interfaces/result.interface';
import { BookRepository } from '../../domain/book.repository';

export class AddBookUseCase {
  constructor(private readonly bookRepo: BookRepository) {}

  async execute(data: { title: string; author: string; stock: number; price: number}) {
    const book = await this.bookRepo.create(data);
    return Result.ok(book);
  }
}