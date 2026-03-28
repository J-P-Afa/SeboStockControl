import { Inject, Injectable } from '@nestjs/common';
import type { BookRepository } from '../../domain/book.repository';

@Injectable()
export class GetBookByIdUseCase {
  constructor(
    @Inject('BookRepository')
    private readonly bookRepo: BookRepository
  ) {}

  async execute(id: number) {
    try {
      const book = await this.bookRepo.findById(id);

      if (!book) {
        return { success: false, error: 'Livro não encontrado' };
      }

      return { success: true, data: book };
    } catch (error) {
      return { success: false, error: 'Erro ao buscar livro' };
    }
  }
}