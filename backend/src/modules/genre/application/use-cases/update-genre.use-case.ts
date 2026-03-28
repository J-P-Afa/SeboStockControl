import { Inject, Injectable } from '@nestjs/common';
import type { GenreRepository } from '../../domain/genre.repository';

interface UpdateGenreInput {
  id: number;
  description?: string;
  isActive?: boolean;
}

@Injectable()
export class UpdateGenreUseCase {
  constructor(
    @Inject('GenreRepository')
    private readonly genreRepo: GenreRepository,
  ) {}

  async execute(input: UpdateGenreInput) {
    const genre = await this.genreRepo.findById(input.id);

    if (!genre) {
      return { success: false, error: 'Gênero não encontrado' };
    }

    try {
      if (input.description !== undefined) {
        genre.updateDescription(input.description);
      }

      if (input.isActive !== undefined) {
        if (input.isActive) {
          genre.activate();
        } else {
          genre.deactivate();
        }
      }

      const updated = await this.genreRepo.update(genre);

      return { success: true, data: updated };
    } catch {
      return { success: false, error: 'Erro ao atualizar gênero' };
    }
  }
}
