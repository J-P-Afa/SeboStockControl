import { GenreEntity } from './genre.entity';

export interface GenreRepository {
  create(genre: GenreEntity): Promise<GenreEntity>;
  findById(id: number): Promise<GenreEntity | null>;
  findAll(
  page: number,
  limit: number,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  filters?: {
    search?: string;
    isActive?: boolean;
  },
): Promise<{
  items: GenreEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}>;
  update(genre: GenreEntity): Promise<GenreEntity>;
  delete(id: number): Promise<boolean>;
}