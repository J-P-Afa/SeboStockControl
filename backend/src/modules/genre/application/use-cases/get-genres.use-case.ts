import { Inject, Injectable } from '@nestjs/common';
import { Result, PaginatedResult } from '../../../../common';
import type { GenreRepository } from '../../domain/genre.repository';
import { GenreResponseDto } from '../dtos/genre-response.dto';

@Injectable()
export class GetGenresUseCase {
  constructor(
    @Inject('GenreRepository')
    private readonly genreRepo: GenreRepository,
  ) {}

  async execute(
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
    filters?: {
      search?: string;
      isActive?: boolean;
    },
  ): Promise<Result<PaginatedResult<GenreResponseDto>>> {
    const result = await this.genreRepo.findAll(
      page,
      limit,
      sortBy,
      sortOrder,
      filters,
    );

    return Result.ok({
      ...result,
      items: result.items.map(GenreResponseDto.fromEntity),
    });
  }
}