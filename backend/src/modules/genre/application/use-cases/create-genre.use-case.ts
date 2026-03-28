import { Inject, Injectable } from '@nestjs/common';
import type { GenreRepository } from '../../domain/genre.repository';
import { GenreEntity } from '../../domain/genre.entity';

interface CreateGenreInput {
  description: string;
}

@Injectable()
export class CreateGenreUseCase {
  constructor(
    @Inject('GenreRepository')
    private readonly genreRepo: GenreRepository,
  ) {}

  async execute(input: CreateGenreInput) {
    try {
      const genre = GenreEntity.create({
        description: input.description,
        isActive: true,
      });

      const saved = await this.genreRepo.create(genre);

      return { success: true, data: saved };
    } catch (error) {
      return { success: false, error: 'Erro ao criar gênero' };
    }
  }
}
