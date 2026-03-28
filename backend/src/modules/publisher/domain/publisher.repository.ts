import { PaginatedResult } from '../../../common';
import { PublisherEntity } from './publisher.entity';

export interface PublisherRepository {
  create(publisher: PublisherEntity): Promise<PublisherEntity>;
  findById(id: number): Promise<PublisherEntity | null>;
  findByDescription(description: string): Promise<PublisherEntity | null>;
  findAll(
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    filters?: { search?: string; isActive?: boolean },
  ): Promise<PaginatedResult<PublisherEntity>>;
  update(publisher: PublisherEntity): Promise<PublisherEntity>;
  delete(id: number): Promise<boolean>;
}
