import { Injectable, Logger, Inject } from '@nestjs/common';
import { Result } from '../../../../common/interfaces/result.interface';
import type { DashboardRepository } from '../../domain/dashboard.repository';
import { DashboardKPIs } from '../../domain/dashboard.repository';

@Injectable()
export class GetKPIsUseCase {
  private readonly logger = new Logger(GetKPIsUseCase.name);

  constructor(
    @Inject('DashboardRepository')
    private readonly repository: DashboardRepository,
  ) {}

  async execute(): Promise<Result<DashboardKPIs>> {
    try {
      const kpis = await this.repository.getKPIs();
      return Result.ok(kpis);
    } catch (error) {
      this.logger.error('Failed to retrieve KPIs', error);
      return Result.fail(
        'GET_KPIS_ERROR',
        'Falha ao processar indicadores gerais.',
      );
    }
  }
}
