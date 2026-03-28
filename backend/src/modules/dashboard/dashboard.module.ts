import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { GetKPIsUseCase } from './use-cases/get-kpis.use-case';
import { GetSalesTrendUseCase } from './use-cases/get-sales-trend.use-case';
import { GetTopCategoriesUseCase } from './use-cases/get-top-categories.use-case';
import { GetRecentTransactionsUseCase } from './use-cases/get-recent-transactions.use-case';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DashboardController],
  providers: [
    GetKPIsUseCase,
    GetSalesTrendUseCase,
    GetTopCategoriesUseCase,
    GetRecentTransactionsUseCase,
  ],
})
export class DashboardModule {}
