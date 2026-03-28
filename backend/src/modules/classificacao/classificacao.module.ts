import { Module } from '@nestjs/common';
import { ClassificacaoController } from './classificacao.controller';
import { PrismaClassificacaoRepository } from './prisma-classificacao.repository';
import { CLASSIFICACAO_REPOSITORY } from './constants';

@Module({
  controllers: [ClassificacaoController],
  providers: [{ provide: CLASSIFICACAO_REPOSITORY, useClass: PrismaClassificacaoRepository }],
  exports: [CLASSIFICACAO_REPOSITORY],
})
export class ClassificacaoModule {}
