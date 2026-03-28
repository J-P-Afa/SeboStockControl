import { Inject, Injectable } from '@nestjs/common';
import type { BookRepository } from '../../domain/book.repository';
import { EditionType, Condition, Status } from '@prisma/client';

interface UpdateBookInput {
  title?: string;
  isbn13?: string | null;
  isbn10?: string | null;
  editionType?: EditionType;
  volume?: string | null;
  condition?: Condition;
  status?: Status;
  weight?: number;
  publisherId?: number;
  languageId?: number;
  genreId?: number;
  isActive?: boolean;
}

@Injectable()
export class UpdateBookUseCase {
  constructor(
    @Inject('BookRepository')
    private readonly bookRepo: BookRepository
  ) {}

  async execute(id: number, input: UpdateBookInput) {
    try {
      const existing = await this.bookRepo.findById(id);

      if (!existing) {
        return { success: false, error: 'Livro não encontrado' };
      }

      existing.update(input);

      const updated = await this.bookRepo.update(existing);

      return { success: true, data: updated };
    } catch (error) {
      return { success: false, error: 'Erro ao atualizar livro' };
    }
  }
}