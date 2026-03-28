import { PaginatedResult } from '../../../common';
import { GenreEntity } from './genre.entity';

export interface GenreRepository {
  create(genre: GenreEntity): Promise<GenreEntity>;
  findById(id: number): Promise<GenreEntity | null>;
  findByDescription(description: string): Promise<GenreEntity | null>;
  findAll(
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    filters?: { search?: string; isActive?: boolean },
  ): Promise<PaginatedResult<GenreEntity>>;
  update(genre: GenreEntity): Promise<GenreEntity>;
  delete(id: number): Promise<boolean>;
}
