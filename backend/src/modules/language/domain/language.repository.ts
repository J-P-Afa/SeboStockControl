import { PaginatedResult } from '../../../common';
import { LanguageEntity } from './language.entity';

export interface LanguageRepository {
  create(language: LanguageEntity): Promise<LanguageEntity>;
  findById(id: number): Promise<LanguageEntity | null>;
  findByDescription(description: string): Promise<LanguageEntity | null>;
  findAll(
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    filters?: { search?: string; isActive?: boolean },
  ): Promise<PaginatedResult<LanguageEntity>>;
  update(language: LanguageEntity): Promise<LanguageEntity>;
  delete(id: number): Promise<boolean>;
}
