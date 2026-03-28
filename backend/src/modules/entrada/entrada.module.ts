import { Module } from '@nestjs/common';
import { EntradaController } from './entrada.controller';
import { CreateEntradaUseCase } from './create-entrada.use-case';
import { GetLastEntradaUseCase } from './get-last-entrada.use-case';
import { BulkCreateEntradaUseCase } from './bulk-create-entrada.use-case';

export const ENTRADA_MODULE_NAME = 'EntradaModule';

@Module({
  controllers: [EntradaController],
  providers: [
    CreateEntradaUseCase,
    GetLastEntradaUseCase,
    BulkCreateEntradaUseCase,
  ],
})
export class EntradaModule {}
