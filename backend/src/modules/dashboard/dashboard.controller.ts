import { Controller, Get, UseGuards } from '@nestjs/common';
import { GetKPIsUseCase } from './application/use-cases/get-kpis.use-case';
import { GetSalesTrendUseCase } from './application/use-cases/get-sales-trend.use-case';
import { GetTopCategoriesUseCase } from './application/use-cases/get-top-categories.use-case';
import { GetRecentTransactionsUseCase } from './application/use-cases/get-recent-transactions.use-case';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('admin:dashboard:read')
export class DashboardController {
  constructor(
    private readonly getKPIsUseCase: GetKPIsUseCase,
    private readonly getSalesTrendUseCase: GetSalesTrendUseCase,
    private readonly getTopCategoriesUseCase: GetTopCategoriesUseCase,
    private readonly getRecentTransactionsUseCase: GetRecentTransactionsUseCase,
  ) {}

  @Get('kpis')
  async getKPIs() {
    return this.getKPIsUseCase.execute();
  }

  @Get('sales-trend')
  async getSalesTrend() {
    return this.getSalesTrendUseCase.execute();
  }

  @Get('top-categories')
  async getTopCategories() {
    return this.getTopCategoriesUseCase.execute();
  }

  @Get('recent-transactions')
  async getRecentTransactions() {
    return this.getRecentTransactionsUseCase.execute();
  }
}
