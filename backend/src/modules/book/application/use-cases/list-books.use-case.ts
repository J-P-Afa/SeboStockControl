import { Inject, Injectable } from '@nestjs/common';
import { Result, PaginatedResult } from '../../../../common';
import { BOOK_REPOSITORY } from '../../domain/book.repository.interface';
import type {
  IBookRepository,
  BookFilters,
} from '../../domain/book.repository.interface';
import { BookResponseDto } from '../dtos';

/**
 * Caso de Uso: Listagem de Books
 * @ai-context Suporta filtros opcionais por classificação, publisher, language, estado e isActive, com paginação.
 */
@Injectable()
export class ListBooksUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY)
    private readonly bookRepository: IBookRepository,
  ) {}

  async execute(
    filters?: BookFilters,
  ): Promise<Result<PaginatedResult<BookResponseDto>>> {
    try {
      const { items, total } = await this.bookRepository.findAll(filters);

      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const totalPages = Math.ceil(total / limit);

      return Result.ok({
        items: items.map((b) => BookResponseDto.fromEntity(b)),
        total,
        page,
        limit,
        totalPages,
      });
    } catch (error) {
      console.error(error);
      return Result.fail('LIST_BOOKS_ERROR', 'Erro ao listar books');
    }
  }
}
