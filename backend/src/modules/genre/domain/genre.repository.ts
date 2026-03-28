import { GenreEntity } from './genre.entity';

export interface GenreRepository {
  create(genre: GenreEntity): Promise<GenreEntity>;
  findById(id: number): Promise<GenreEntity | null>;
  findAll(): Promise<GenreEntity[]>;
  update(genre: GenreEntity): Promise<GenreEntity>;
  delete(id: number): Promise<boolean>;
}