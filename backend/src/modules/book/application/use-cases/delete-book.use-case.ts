import { Inject, Injectable } from '@nestjs/common';
import type { BookRepository } from '../../domain/book.repository';

@Injectable()
export class DeleteBookUseCase {
  constructor(
    @Inject('BookRepository')
    private readonly bookRepo: BookRepository
  ) {}

  async execute(id: number) {
    try {
      const existing = await this.bookRepo.findById(id);

      if (!existing) {
        return { success: false, error: 'Livro não encontrado' };
      }

      await this.bookRepo.delete(id);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro ao excluir livro' };
    }
  }
}