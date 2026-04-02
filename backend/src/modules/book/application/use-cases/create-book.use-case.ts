import { Inject, Injectable, Logger } from '@nestjs/common';
import { Result } from '../../../../common';
import { BOOK_REPOSITORY } from '../../domain/book.repository.interface';
import type { IBookRepository } from '../../domain/book.repository.interface';
import { BookEntity } from '../../domain/book.entity';
import { BookResponseDto } from '../dtos/book-response.dto';
import { CreateBookDto } from '../dtos/create-book.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CreateBookUseCase {
  private readonly logger = new Logger(CreateBookUseCase.name);

  constructor(
    @Inject(BOOK_REPOSITORY)
    private readonly bookRepo: IBookRepository,
  ) {}

  async execute(input: CreateBookDto): Promise<Result<BookResponseDto>> {
    try {
      if (input.isbn13) {
        const existingByIsbn13 = await this.bookRepo.findByIsbn13AndCondition(
          input.isbn13,
          input.condition,
        );

        if (existingByIsbn13) {
          return Result.fail(
            'ISBN13_ALREADY_EXISTS',
            'ISBN13 já existe para o mesmo estado do book',
          );
        }
      }

      if (input.isbn10) {
        const existingByIsbn10 = await this.bookRepo.findByIsbn10AndCondition(
          input.isbn10,
          input.condition,
        );

        if (existingByIsbn10) {
          return Result.fail(
            'ISBN10_ALREADY_EXISTS',
            'ISBN10 já existe para o mesmo estado do book',
          );
        }
      }

      const book = BookEntity.create({
        ...input,
        listPrice: input.listPrice ? new Prisma.Decimal(input.listPrice) : null,
        weight: new Prisma.Decimal(input.weight ?? 0),
        isActive: true,
      });

      const saved = await this.bookRepo.create(book.toJSON());

      return Result.ok(BookResponseDto.fromEntity(saved));
    } catch (error: any) {
      this.logger.error('Failed to create book', error.stack);

      // Se for um erro de domínio (lançado pelo BookEntity), retornamos a mensagem específica
      if (error instanceof Error && error.name === 'Error') {
        return Result.fail('BOOK_VALIDATION_ERROR', error.message);
      }

      return Result.fail('CREATE_BOOK_ERROR', 'Erro ao criar book');
    }
  }
}
