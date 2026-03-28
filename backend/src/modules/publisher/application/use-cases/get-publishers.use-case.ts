import { Inject, Injectable } from '@nestjs/common';
import { Result, PaginatedResult } from '../../../../common';
import type { PublisherRepository } from '../../domain/publisher.repository';
import { PublisherResponseDto } from '../dtos/publisher-response.dto';

@Injectable()
export class GetPublishersUseCase {
  constructor(
    @Inject('PublisherRepository')
    private readonly publisherRepo: PublisherRepository,
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
  ): Promise<Result<PaginatedResult<PublisherResponseDto>>> {
    const result = await this.publisherRepo.findAll(
      page,
      limit,
      sortBy,
      sortOrder,
      filters,
    );

    return Result.ok({
      ...result,
      items: result.items.map(PublisherResponseDto.fromEntity),
    });
  }
}
