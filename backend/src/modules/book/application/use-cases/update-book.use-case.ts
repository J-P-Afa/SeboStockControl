import { Inject, Injectable, Logger } from '@nestjs/common';
import { Result } from '../../../../common';
import { BOOK_REPOSITORY } from '../../domain/book.repository.interface';
import type {
  IBookRepository,
  UpdateBookParams,
} from '../../domain/book.repository.interface';
import { BookResponseDto } from '../dtos/book-response.dto';
import { UpdateBookDto } from '../dtos/update-book.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UpdateBookUseCase {
  private readonly logger = new Logger(UpdateBookUseCase.name);

  constructor(
    @Inject(BOOK_REPOSITORY)
    private readonly bookRepo: IBookRepository,
  ) {}

  private toUpdateParams(book: UpdateBookParams): UpdateBookParams {
    return {
      title: book.title,
      subtitle: book.subtitle,
      isbn13: book.isbn13,
      isbn10: book.isbn10,
      listPrice: book.listPrice,
      editionType: book.editionType,
      volume: book.volume,
      collection: book.collection,
      condition: book.condition,
      status: book.status,
      publicationYear: book.publicationYear,
      pages: book.pages,
      synopsis: book.synopsis,
      dimensions: book.dimensions,
      coverUrl: book.coverUrl,
      weight: book.weight,
      publisherId: book.publisherId,
      languageId: book.languageId,
      genreId: book.genreId,
      classificacaoId: book.classificacaoId,
      isActive: book.isActive,
    };
  }

  private normalizeInput(input: UpdateBookDto): UpdateBookParams {
    const { listPrice, weight, ...rest } = input;
    const updateParams: UpdateBookParams = { ...rest };

    if (listPrice !== undefined) {
      updateParams.listPrice = new Prisma.Decimal(listPrice);
    }

    if (weight !== undefined) {
      updateParams.weight = new Prisma.Decimal(weight);
    }

    return updateParams;
  }

  async execute(
    id: number,
    input: UpdateBookDto,
  ): Promise<Result<BookResponseDto>> {
    // 1. Localizar o book existente
    let existing;
    try {
      existing = await this.bookRepo.findById(id);
      if (!existing) {
        return Result.fail('BOOK_NOT_FOUND', 'Book não encontrado');
      }
    } catch (error: unknown) {
      this.logger.error(
        `Failed to find book ${id} for update`,
        error instanceof Error ? error.stack : error,
      );
      return Result.fail(
        'UPDATE_BOOK_ERROR',
        'Erro ao localizar book para atualização',
      );
    }

    // 2. Aplicar atualizações de domínio
    try {
      existing.update(this.normalizeInput(input));
    } catch (error: unknown) {
      return Result.fail(
        'BOOK_VALIDATION_ERROR',
        error instanceof Error ? error.message : 'Erro de validação do book',
      );
    }

    // 3. Persistir mudanças
    try {
      const updated = await this.bookRepo.update(
        id,
        this.toUpdateParams(existing.toJSON()),
      );

      return Result.ok(BookResponseDto.fromEntity(updated));
    } catch (error: unknown) {
      this.logger.error(
        `Failed to persist update for book ${id}`,
        error instanceof Error ? error.stack : error,
      );

      return Result.fail('UPDATE_BOOK_ERROR', 'Erro ao atualizar book');
    }
  }
}
