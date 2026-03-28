import { Controller, Get, Param, ParseIntPipe, NotFoundException, Inject } from '@nestjs/common';
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

  @Get('livro/:livroId')
  async findByLivro(@Param('livroId', ParseIntPipe) livroId: number) {
    const item = await this.repo.findByLivroId(livroId);
    if (!item) throw new NotFoundException('Estoque não encontrado para este livro');
    return { success: true, data: item };
  }
}
