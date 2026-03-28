import { Module } from '@nestjs/common';
import { IdiomaController } from './idioma.controller';
import { PrismaIdiomaRepository } from './prisma-idioma.repository';
import { IDIOMA_REPOSITORY } from './constants';

@Module({
  controllers: [IdiomaController],
  providers: [{ provide: IDIOMA_REPOSITORY, useClass: PrismaIdiomaRepository }],
  exports: [IDIOMA_REPOSITORY],
})
export class IdiomaModule {}
