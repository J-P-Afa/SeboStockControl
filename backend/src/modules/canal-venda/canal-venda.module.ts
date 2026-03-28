import { Module } from '@nestjs/common';
import { CanalVendaController } from './canal-venda.controller';
import { PrismaCanalVendaRepository } from './prisma-canal-venda.repository';
import { CANAL_VENDA_REPOSITORY } from './constants';

@Module({
  controllers: [CanalVendaController],
  providers: [{ provide: CANAL_VENDA_REPOSITORY, useClass: PrismaCanalVendaRepository }],
  exports: [CANAL_VENDA_REPOSITORY],
})
export class CanalVendaModule {}
