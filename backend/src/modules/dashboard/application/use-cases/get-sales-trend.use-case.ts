import { Injectable, Logger, Inject } from '@nestjs/common';
import { Result } from '../../../../common/interfaces/result.interface';
import { DashboardRepository, SalesTrendData } from '../../domain/dashboard.repository';

@Injectable()
export class GetSalesTrendUseCase {
  private readonly logger = new Logger(GetSalesTrendUseCase.name);

  constructor(
    @Inject('DashboardRepository')
    private readonly repository: DashboardRepository,
  ) {}

  async execute(): Promise<Result<SalesTrendData[]>> {
    try {
      const trends = await this.repository.getSalesTrend(30);
      return Result.ok(trends);
    } catch (error) {
      this.logger.error('Failed to retrieve sales trends', error);
      return Result.fail(
        'GET_SALES_TREND_ERROR',
        'Falha ao processar tendência de vendas.',
      );
    }
  }
}
