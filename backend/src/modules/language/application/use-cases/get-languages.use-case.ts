import { Inject, Injectable } from '@nestjs/common';
import { Result, PaginatedResult } from '../../../../common';
import type { LanguageRepository } from '../../domain/language.repository';
import { LanguageResponseDto } from '../dtos/language-response.dto';

@Injectable()
export class GetLanguagesUseCase {
  constructor(
    @Inject('LanguageRepository')
    private readonly languageRepo: LanguageRepository,
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
  ): Promise<Result<PaginatedResult<LanguageResponseDto>>> {
    const result = await this.languageRepo.findAll(
      page,
      limit,
      sortBy,
      sortOrder,
      filters,
    );

    return Result.ok({
      ...result,
      items: result.items.map(LanguageResponseDto.fromEntity),
    });
  }
}
