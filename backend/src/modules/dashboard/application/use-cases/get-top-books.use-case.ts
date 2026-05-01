import { Injectable, Logger, Inject } from '@nestjs/common';
import { Result } from '../../../../common/interfaces/result.interface';
import type { DashboardRepository } from '../../domain/dashboard.repository';
import {
  BookSalesData,
  DashboardFilters,
} from '../../domain/dashboard.repository';

@Injectable()
export class GetTopBooksUseCase {
  private readonly logger = new Logger(GetTopBooksUseCase.name);

  constructor(
    @Inject('DashboardRepository')
    private readonly repository: DashboardRepository,
  ) {}

  async execute(
    filters: DashboardFilters = {},
  ): Promise<Result<BookSalesData[]>> {
    try {
      const data = await this.repository.getTopBooks(filters, 5);
      return Result.ok(data);
    } catch (error) {
      this.logger.error('Failed to retrieve top books', error);
      return Result.fail(
        'GET_TOP_BOOKS_ERROR',
        'Falha ao processar livros mais vendidos.',
      );
    }
  }
}
