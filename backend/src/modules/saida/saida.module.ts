import { Module } from '@nestjs/common';
import { SaidaController } from './saida.controller';
import { CreateSaidaUseCase } from './create-saida.use-case';
import { CreateSaidaBulkUseCase } from './create-saida-bulk.use-case';

@Module({
  controllers: [SaidaController],
  providers: [CreateSaidaUseCase, CreateSaidaBulkUseCase],
})
export class SaidaModule {}
