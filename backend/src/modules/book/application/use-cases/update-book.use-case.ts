import { Inject, Injectable, Logger } from '@nestjs/common';
import { Result } from '../../../../common';
import { BOOK_REPOSITORY } from '../../domain/book.repository.interface';
import type { IBookRepository, UpdateBookParams } from '../../domain/book.repository.interface';
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
    try {
      const existing = await this.bookRepo.findById(id);

      if (!existing) {
        return Result.fail('BOOK_NOT_FOUND', 'Book não encontrado');
      }

      existing.update({
        ...input,
        listPrice: input.listPrice
          ? new Prisma.Decimal(input.listPrice)
          : undefined,
        weight: input.weight ? new Prisma.Decimal(input.weight) : undefined,
      });

      const updated = await this.bookRepo.update(
        id,
        existing.toJSON() as UpdateBookParams,
      );

      return Result.ok(BookResponseDto.fromEntity(updated));
    } catch (error: any) {
      this.logger.error(`Failed to update book ${id}`, error.stack);

      // Se for um erro de domínio (lançado pelo BookEntity), retornamos a mensagem específica
      if (error instanceof Error && error.name === 'Error') {
        return Result.fail('BOOK_VALIDATION_ERROR', error.message);
      }

      return Result.fail('UPDATE_BOOK_ERROR', 'Erro ao atualizar book');
    }
  }
}
