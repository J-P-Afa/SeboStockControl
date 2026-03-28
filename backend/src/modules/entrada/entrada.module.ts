import { Module } from '@nestjs/common';
import { EntradaController } from './entrada.controller';
import { CreateEntradaUseCase } from './create-entrada.use-case';

export const ENTRADA_MODULE_NAME = 'EntradaModule';

@Module({
  controllers: [EntradaController],
  providers: [CreateEntradaUseCase],
})
export class EntradaModule {}
