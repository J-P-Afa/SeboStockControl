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

@Controller('estoques')
export class EstoqueController {
  constructor(
    @Inject(ESTOQUE_REPOSITORY)
    private readonly repo: IStockRepository,
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
}
