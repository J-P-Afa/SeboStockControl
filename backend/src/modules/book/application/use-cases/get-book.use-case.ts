import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../../common';
import { BOOK_REPOSITORY } from '../../domain/book.repository.interface';
import type { IBookRepository } from '../../domain/book.repository.interface';
import { BookResponseDto } from '../dtos';

/**
 * Caso de Uso: Busca de Book por ID
 * @ai-context Retorna Result.fail se não encontrado — controllers mapeiam para 404.
 */
@Injectable()
export class GetBookUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY)
    private readonly bookRepository: IBookRepository,
  ) {}

  async execute(id: number): Promise<Result<BookResponseDto>> {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      return Result.fail('BOOK_NOT_FOUND', 'Book não encontrado');
    }
    return Result.ok(BookResponseDto.fromEntity(book));
  }
}
