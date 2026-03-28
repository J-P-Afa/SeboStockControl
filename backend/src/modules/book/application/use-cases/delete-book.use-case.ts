import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../../common';
import { BOOK_REPOSITORY } from '../../domain/book.repository.interface';
import type { IBookRepository } from '../../domain/book.repository.interface';

/**
 * Caso de Uso: Remoção de Livro (soft delete via ativo = false)
 * @ai-context Não permite exclusão física; use ativo=false via UpdateBookUseCase.
 * Este use-case faz hard delete apenas se não houver movimentações associadas.
 */
@Injectable()
export class DeleteBookUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY)
    private readonly bookRepository: IBookRepository,
  ) {}

  async execute(id: number): Promise<Result<void>> {
    const existing = await this.bookRepository.findById(id);
    if (!existing) {
      return Result.fail('BOOK_NOT_FOUND', 'Livro não encontrado');
    }

    await this.bookRepository.delete(id);
    return Result.ok(undefined);
  }
}
