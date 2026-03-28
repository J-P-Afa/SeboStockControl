import { Inject, Injectable } from '@nestjs/common';
import type { BookRepository } from '../../domain/book.repository';
import { BookEntity } from '../../domain/book.entity';
import { EditionType, Condition, Status } from '@prisma/client';

interface CreateBookInput {
  title: string;
  isbn13?: string;
  isbn10?: string;
  editionType: EditionType;
  volume?: string;
  condition: Condition;
  status: Status;
  weight: number;
  publisherId: number;
  languageId: number;
  genreId: number;
}

@Injectable()
export class CreateBookUseCase {
  constructor(
    @Inject('BookRepository')
    private readonly bookRepo: BookRepository
  ) {}

  async execute(input: CreateBookInput) {
    try {
      if (input.isbn13) {
        const existingByIsbn13 = await this.bookRepo.findByIsbn13AndCondition(
          input.isbn13,
          input.condition,
        );

        if (existingByIsbn13) {
          return {
            success: false,
            error: 'ISBN13 já existe para o mesmo estado do livro',
          };
        }
      }

      if (input.isbn10) {
        const existingByIsbn10 = await this.bookRepo.findByIsbn10AndCondition(
          input.isbn10,
          input.condition,
        );

        if (existingByIsbn10) {
          return {
            success: false,
            error: 'ISBN10 já existe para o mesmo estado do livro',
          };
        }
      }

      const book = BookEntity.create({
        ...input,
        isbn13: input.isbn13 ?? null,
        isbn10: input.isbn10 ?? null,
        volume: input.volume ?? null,
        isActive: true,
      });

      const saved = await this.bookRepo.create(book);

      return { success: true, data: saved };
    } catch (error) {
      return { success: false, error: 'Erro ao criar livro' };
    }
  }
}