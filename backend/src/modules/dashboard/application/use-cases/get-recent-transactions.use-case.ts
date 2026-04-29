import { Injectable, Logger, Inject } from '@nestjs/common';
import { Result } from '../../../../common/interfaces/result.interface';
import type { DashboardRepository } from '../../domain/dashboard.repository';
import {
  DashboardFilters,
  RecentTransactionData,
} from '../../domain/dashboard.repository';

@Injectable()
export class GetRecentTransactionsUseCase {
  private readonly logger = new Logger(GetRecentTransactionsUseCase.name);

  constructor(
    @Inject('DashboardRepository')
    private readonly repository: DashboardRepository,
  ) {}

  async execute(
    filters: DashboardFilters = {},
  ): Promise<Result<RecentTransactionData[]>> {
    try {
      const transactions = await this.repository.getRecentTransactions(
        filters,
        10,
      );
      return Result.ok(transactions);
    } catch (error) {
      this.logger.error('Failed to retrieve recent transactions', error);
      return Result.fail(
        'GET_RECENT_TRANSACTIONS_ERROR',
        'Falha ao recuperar transações recentes.',
      );
    }
  }
}
