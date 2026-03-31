import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../../common';
import { BOOK_REPOSITORY } from '../../domain/book.repository.interface';
import type {
  IBookRepository,
  BookFilters,
} from '../../domain/book.repository.interface';
import { BookResponseDto } from '../dtos';

/**
 * Caso de Uso: Listagem de Books
 * @ai-context Suporta filtros opcionais por classificação, publisher, language, estado e isActive.
 */
@Injectable()
export class ListBooksUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY)
    private readonly bookRepository: IBookRepository,
  ) {}

  async execute(filters?: BookFilters): Promise<Result<BookResponseDto[]>> {
    try {
      const books = await this.bookRepository.findAll(filters);
      return Result.ok(books.map((b) => BookResponseDto.fromEntity(b)));
    } catch (error) {
      console.error(error);
      return Result.fail('LIST_BOOKS_ERROR', 'Erro ao listar books');
    }
  }
}
