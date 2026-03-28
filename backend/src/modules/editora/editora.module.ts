import { Module } from '@nestjs/common';
import { EditoraController } from './editora.controller';
import { PrismaEditoraRepository } from './prisma-editora.repository';
import { EDITORA_REPOSITORY } from './constants';

@Module({
  controllers: [EditoraController],
  providers: [{ provide: EDITORA_REPOSITORY, useClass: PrismaEditoraRepository }],
  exports: [EDITORA_REPOSITORY],
})
export class EditoraModule {}
