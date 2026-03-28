import { Module } from '@nestjs/common';
import { TipoSaidaController } from './tipo-saida.controller';
import { PrismaTipoSaidaRepository } from './prisma-tipo-saida.repository';
import { TIPO_SAIDA_REPOSITORY } from './constants';

@Module({
  controllers: [TipoSaidaController],
  providers: [{ provide: TIPO_SAIDA_REPOSITORY, useClass: PrismaTipoSaidaRepository }],
  exports: [TIPO_SAIDA_REPOSITORY],
})
export class TipoSaidaModule {}
