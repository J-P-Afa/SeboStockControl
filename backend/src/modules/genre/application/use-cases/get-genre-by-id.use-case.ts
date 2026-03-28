import { Inject, Injectable } from '@nestjs/common';
import type { GenreRepository } from '../../domain/genre.repository';

@Injectable()
export class GetGenreByIdUseCase {
  constructor(
  @Inject('GenreRepository')
  private readonly genreRepo: GenreRepository
) {}

  async execute(id: number) {
    const genre = await this.genreRepo.findById(id);

    if (!genre) {
      return { success: false, error: 'Gênero não encontrado' };
    }

    return { success: true, data: genre };
  }
}