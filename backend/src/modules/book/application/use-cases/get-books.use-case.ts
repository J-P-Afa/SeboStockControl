import { Inject, Injectable } from '@nestjs/common';
import type { BookRepository } from '../../domain/book.repository';

interface GetBooksInput {
  title?: string;
  genreId?: number;
  publisherId?: number;
  languageId?: number;
  condition?: string;
  status?: string;
}

@Injectable()
export class GetBooksUseCase {
  constructor(
    @Inject('BookRepository')
    private readonly bookRepo: BookRepository
  ) {}

  async execute(filters?: GetBooksInput) {
    try {
      const books = await this.bookRepo.findAll(filters);

      return { success: true, data: books };
    } catch (error) {
      return { success: false, error: 'Erro ao buscar livros' };
    }
  }
}