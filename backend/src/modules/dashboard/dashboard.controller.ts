import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GetKPIsUseCase } from './application/use-cases/get-kpis.use-case';
import { GetSalesTrendUseCase } from './application/use-cases/get-sales-trend.use-case';
import { GetTopCategoriesUseCase } from './application/use-cases/get-top-categories.use-case';
import { GetRecentTransactionsUseCase } from './application/use-cases/get-recent-transactions.use-case';
import { GetBookAttributeValuesUseCase } from './application/use-cases/get-book-attribute-values.use-case';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import {
  DashboardBookAttributeValuesQueryDto,
  DashboardFiltersQueryDto,
} from './presentation/dtos/dashboard-filters-query.dto';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('dashboard:read')
export class DashboardController {
  constructor(
    private readonly getKPIsUseCase: GetKPIsUseCase,
    private readonly getSalesTrendUseCase: GetSalesTrendUseCase,
    private readonly getTopCategoriesUseCase: GetTopCategoriesUseCase,
    private readonly getRecentTransactionsUseCase: GetRecentTransactionsUseCase,
    private readonly getBookAttributeValuesUseCase: GetBookAttributeValuesUseCase,
  ) {}

  @Get('kpis')
  async getKPIs(@Query() query: DashboardFiltersQueryDto) {
    return this.getKPIsUseCase.execute(query);
  }

  @Get('sales-trend')
  async getSalesTrend(@Query() query: DashboardFiltersQueryDto) {
    return this.getSalesTrendUseCase.execute(query);
  }

  @Get('top-categories')
  async getTopCategories(@Query() query: DashboardFiltersQueryDto) {
    return this.getTopCategoriesUseCase.execute(query);
  }

  @Get('recent-transactions')
  async getRecentTransactions(@Query() query: DashboardFiltersQueryDto) {
    return this.getRecentTransactionsUseCase.execute(query);
  }

  @Get('book-attribute-values')
  async getBookAttributeValues(
    @Query() query: DashboardBookAttributeValuesQueryDto,
  ) {
    return this.getBookAttributeValuesUseCase.execute(query.attribute);
  }
}
