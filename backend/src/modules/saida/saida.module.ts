import { Module } from '@nestjs/common';
import { SaidaController } from './saida.controller';
import { CreateSaidaUseCase } from './create-saida.use-case';

@Module({
  controllers: [SaidaController],
  providers: [CreateSaidaUseCase],
})
export class SaidaModule {}
