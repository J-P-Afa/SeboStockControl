import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { ESTOQUE_REPOSITORY } from '../../domain/repositories/stock.repository.interface';
import type { IStockRepository } from '../../domain/repositories/stock.repository.interface';
import { GetEstoqueHistoryUseCase } from '../../application/use-cases/get-estoque-history.use-case';

@Controller('estoques')
export class EstoqueController {
  constructor(
    @Inject(ESTOQUE_REPOSITORY)
    private readonly repo: IStockRepository,
    private readonly getEstoqueHistoryUseCase: GetEstoqueHistoryUseCase,
  ) {}

  @Get()
  async findAll() {
    return { success: true, data: await this.repo.findAll() };
  }

  @Get('book/:bookId')
  async findByBook(@Param('bookId', ParseIntPipe) bookId: number) {
    const item = await this.repo.findByBookId(bookId);
    if (!item)
      throw new NotFoundException('Estoque não encontrado para este book');
    return { success: true, data: item };
  }

  @Get('book/:bookId/history')
  async getHistory(@Param('bookId', ParseIntPipe) bookId: number) {
    const result = await this.getEstoqueHistoryUseCase.execute(bookId);
    if (!result.success) throw new NotFoundException(result.error?.message);
    return { success: true, data: result.data };
  }
}
