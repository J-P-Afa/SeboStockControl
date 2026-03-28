import { Module } from '@nestjs/common';
import { EstoqueController } from './presentation/controllers/estoque.controller';
import { PrismaEstoqueRepository } from './infrastructure/repositories/prisma-estoque.repository';
import { GetEstoqueHistoryUseCase } from './application/use-cases/get-estoque-history.use-case';

import { ESTOQUE_REPOSITORY } from './domain/repositories/stock.repository.interface';

@Module({
  controllers: [EstoqueController],
  providers: [
    { provide: ESTOQUE_REPOSITORY, useClass: PrismaEstoqueRepository },
    GetEstoqueHistoryUseCase,
  ],
  exports: [ESTOQUE_REPOSITORY],
})
export class StockModule {}
