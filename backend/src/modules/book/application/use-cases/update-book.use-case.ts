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
      existing.update({
        ...input,
        listPrice: input.listPrice
          ? new Prisma.Decimal(input.listPrice)
          : undefined,
        weight: input.weight ? new Prisma.Decimal(input.weight) : undefined,
      });
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
        existing.toJSON() as UpdateBookParams,
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
