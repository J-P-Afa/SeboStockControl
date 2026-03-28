import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../../common';
import { BOOK_REPOSITORY } from '../../domain/book.repository.interface';
import type { IBookRepository } from '../../domain/book.repository.interface';
import { BookResponseDto } from '../dtos';

/**
 * Caso de Uso: Busca de Book por ISBN (10 ou 13)
 * @ai-context Usado pelo leitor de código de barras na tela de entrada.
 */
@Injectable()
export class GetBookByIsbnUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY)
    private readonly bookRepository: IBookRepository,
  ) {}

  async execute(isbn: string): Promise<Result<BookResponseDto>> {
    const book = await this.bookRepository.findByIsbn(isbn);
    if (!book) {
      return Result.fail(
        'BOOK_NOT_FOUND',
        `Livro com ISBN ${isbn} não encontrado`,
      );
    }
    return Result.ok(BookResponseDto.fromEntity(book));
  }
}
