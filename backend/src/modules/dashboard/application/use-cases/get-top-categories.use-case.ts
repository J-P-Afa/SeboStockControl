import { Injectable, Logger, Inject } from '@nestjs/common';
import { Result } from '../../../../common/interfaces/result.interface';
import type { DashboardRepository } from '../../domain/dashboard.repository';
import { CategoryData } from '../../domain/dashboard.repository';

@Injectable()
export class GetTopCategoriesUseCase {
  private readonly logger = new Logger(GetTopCategoriesUseCase.name);

  constructor(
    @Inject('DashboardRepository')
    private readonly repository: DashboardRepository,
  ) {}

  async execute(): Promise<Result<CategoryData[]>> {
    try {
      const data = await this.repository.getTopCategories(5);
      return Result.ok(data);
    } catch (error) {
      this.logger.error('Failed to retrieve top categories', error);
      return Result.fail(
        'GET_TOP_CATEGORIES_ERROR',
        'Falha ao processar categorias.',
      );
    }
  }
}
