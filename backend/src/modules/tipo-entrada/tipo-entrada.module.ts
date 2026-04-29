import { Module } from '@nestjs/common';
import { TIPO_ENTRADA_REPOSITORY } from './constants';
import { PrismaTipoEntradaRepository } from './prisma-tipo-entrada.repository';
import { TipoEntradaController } from './tipo-entrada.controller';

@Module({
  controllers: [TipoEntradaController],
  providers: [
    {
      provide: TIPO_ENTRADA_REPOSITORY,
      useClass: PrismaTipoEntradaRepository,
    },
  ],
  exports: [TIPO_ENTRADA_REPOSITORY],
})
export class TipoEntradaModule {}
