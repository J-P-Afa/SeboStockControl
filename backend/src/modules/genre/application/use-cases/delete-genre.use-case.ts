import { Inject, Injectable } from '@nestjs/common';
import type { GenreRepository } from '../../domain/genre.repository';

@Injectable()
export class DeleteGenreUseCase {
  constructor(
  @Inject('GenreRepository')
  private readonly genreRepo: GenreRepository
) {}

  async execute(id: number) {
    const exists = await this.genreRepo.findById(id);

    if (!exists) {
      return { success: false, error: 'Gênero não encontrado' };
    }

    const deleted = await this.genreRepo.delete(id);

    if (!deleted) {
      return { success: false, error: 'Erro ao deletar gênero' };
    }

    return { success: true };
  }
}