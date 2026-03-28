import { Inject, Injectable } from '@nestjs/common';
import type { GenreRepository } from '../../domain/genre.repository';

@Injectable()
export class GetGenresUseCase {
  constructor(
  @Inject('GenreRepository')
  private readonly genreRepo: GenreRepository
) {}

  async execute() {
    const genres = await this.genreRepo.findAll();

    return { success: true, data: genres };
  }
}