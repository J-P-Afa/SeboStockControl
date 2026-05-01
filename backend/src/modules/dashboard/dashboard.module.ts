import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { GetKPIsUseCase } from './application/use-cases/get-kpis.use-case';
import { GetSalesTrendUseCase } from './application/use-cases/get-sales-trend.use-case';
import { GetTopCategoriesUseCase } from './application/use-cases/get-top-categories.use-case';
import { GetTopBooksUseCase } from './application/use-cases/get-top-books.use-case';
import { GetRecentTransactionsUseCase } from './application/use-cases/get-recent-transactions.use-case';
import { GetBookAttributeValuesUseCase } from './application/use-cases/get-book-attribute-values.use-case';
import { GetSalesComparisonUseCase } from './application/use-cases/get-sales-comparison.use-case';
import { DatabaseModule } from '../database/database.module';
import { PrismaDashboardRepository } from './infrastructure/prisma-dashboard.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [DashboardController],
  providers: [
    GetKPIsUseCase,
    GetSalesTrendUseCase,
    GetTopCategoriesUseCase,
    GetTopBooksUseCase,
    GetRecentTransactionsUseCase,
    GetBookAttributeValuesUseCase,
    GetSalesComparisonUseCase,
    {
      provide: 'DashboardRepository',
      useClass: PrismaDashboardRepository,
    },
  ],
})
export class DashboardModule {}
