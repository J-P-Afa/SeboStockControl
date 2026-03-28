import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../../common';
import { BOOK_REPOSITORY } from '../../domain/book.repository.interface';
import type { IBookRepository } from '../../domain/book.repository.interface';

@Injectable()
export class DeleteBookUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY)
    private readonly bookRepo: IBookRepository,
  ) {}

  async execute(id: number): Promise<Result<void>> {
    try {
      const existing = await this.bookRepo.findById(id);

      if (!existing) {
        return Result.fail('BOOK_NOT_FOUND', 'Book não encontrado');
      }

      await this.bookRepo.delete(id);

      return Result.ok();
    } catch (error) {
      console.error(error);
      return Result.fail('DELETE_BOOK_ERROR', 'Erro ao excluir book');
    }
  }
}
