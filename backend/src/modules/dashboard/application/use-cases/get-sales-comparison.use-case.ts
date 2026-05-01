import { Injectable, Logger, Inject } from '@nestjs/common';
import { Result } from '../../../../common/interfaces/result.interface';
import type { DashboardRepository } from '../../domain/dashboard.repository';
import {
  SalesComparisonData,
  SalesComparisonFilters,
} from '../../domain/dashboard.repository';

@Injectable()
export class GetSalesComparisonUseCase {
  private readonly logger = new Logger(GetSalesComparisonUseCase.name);

  constructor(
    @Inject('DashboardRepository')
    private readonly repository: DashboardRepository,
  ) {}

  async execute(
    filters: SalesComparisonFilters,
  ): Promise<Result<SalesComparisonData[]>> {
    try {
      const comparison = await this.repository.getSalesComparison(filters);
      return Result.ok(comparison);
    } catch (error) {
      this.logger.error('Failed to retrieve sales comparison', error);
      return Result.fail(
        'GET_SALES_COMPARISON_ERROR',
        'Falha ao processar comparativo de vendas.',
      );
    }
  }
}
