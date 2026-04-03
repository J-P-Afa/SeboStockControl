import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { ESTOQUE_REPOSITORY } from '../../domain/repositories/stock.repository.interface';
import type { IStockRepository } from '../../domain/repositories/stock.repository.interface';
import { GetEstoqueHistoryUseCase } from '../../application/use-cases/get-estoque-history.use-case';
import {
  Result,
  PermissionsGuard,
  RequirePermission,
} from '../../../../common';

@Controller('estoques')
@UseGuards(PermissionsGuard)
export class EstoqueController {
  constructor(
    @Inject(ESTOQUE_REPOSITORY)
    private readonly repo: IStockRepository,
    private readonly getEstoqueHistoryUseCase: GetEstoqueHistoryUseCase,
  ) {}

  @Get()
  @RequirePermission('stock:read')
  async findAll() {
    return this.repo.findAll();
  }

  @Get('book/:bookId')
  @RequirePermission('stock:read')
  async findByBook(@Param('bookId', ParseIntPipe) bookId: number) {
    const item = await this.repo.findByBookId(bookId);
    if (!item) {
      return Result.fail(
        'STOCK_NOT_FOUND',
        'Estoque não encontrado para este book',
      );
    }
    return item;
  }

  @Get('book/:bookId/history')
  @RequirePermission('stock:read')
  async getHistory(@Param('bookId', ParseIntPipe) bookId: number) {
    return this.getEstoqueHistoryUseCase.execute(bookId);
  }
}
