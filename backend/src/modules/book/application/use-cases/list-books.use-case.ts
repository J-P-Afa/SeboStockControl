import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../../common';
import { BOOK_REPOSITORY } from '../../domain/book.repository.interface';
import type { IBookRepository, LivroFilters } from '../../domain/book.repository.interface';
import { BookResponseDto } from '../dtos';

/**
 * Caso de Uso: Listagem de Livros
 * @ai-context Suporta filtros opcionais por classificação, editora, idioma, estado e ativo.
 */
@Injectable()
export class ListBooksUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY)
    private readonly bookRepository: IBookRepository,
  ) {}

  async execute(filters?: LivroFilters): Promise<Result<BookResponseDto[]>> {
    const livros = await this.bookRepository.findAll(filters);
    return Result.ok(livros.map(BookResponseDto.fromEntity));
  }
}
