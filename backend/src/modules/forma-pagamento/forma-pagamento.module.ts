import { Module } from '@nestjs/common';
import { FormaPagamentoController } from './forma-pagamento.controller';
import { PrismaFormaPagamentoRepository } from './prisma-forma-pagamento.repository';
import { FORMA_PAGAMENTO_REPOSITORY } from './constants';

@Module({
  controllers: [FormaPagamentoController],
  providers: [
    {
      provide: FORMA_PAGAMENTO_REPOSITORY,
      useClass: PrismaFormaPagamentoRepository,
    },
  ],
  exports: [FORMA_PAGAMENTO_REPOSITORY],
})
export class FormaPagamentoModule {}
