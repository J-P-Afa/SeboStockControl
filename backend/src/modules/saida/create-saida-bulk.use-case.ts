import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Result } from '../../common';
import { CreateSaidaBulkDto } from './create-saida-bulk.dto';
import { CreateSaidaDto } from './create-saida.dto';
import { EstoqueEntity } from '../stock/domain/entities/estoque.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class CreateSaidaBulkUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateSaidaBulkDto): Promise<Result<any[]>> {
    try {
      const results = await this.prisma.$transaction(async (tx) => {
        const createdSaidas = [];

        for (const item of dto.items) {
          const saida = await this.processItem(item, tx);
          createdSaidas.push(saida);
        }

        return createdSaidas;
      });

      return Result.ok(results);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        if (error.message.startsWith('LIVRO_NOT_FOUND')) return Result.fail('LIVRO_NOT_FOUND', error.message.split(':')[1]);
        if (error.message.startsWith('LIVRO_INATIVO')) return Result.fail('LIVRO_INATIVO', error.message.split(':')[1]);
        if (error.message.startsWith('TIPO_SAIDA_NOT_FOUND')) return Result.fail('TIPO_SAIDA_NOT_FOUND', error.message.split(':')[1]);
        if (error.message.startsWith('SAIDA_CANAL_REQUIRED')) return Result.fail('SAIDA_CANAL_REQUIRED', error.message.split(':')[1]);
        if (error.message.startsWith('SAIDA_VALOR_REQUIRED')) return Result.fail('SAIDA_VALOR_REQUIRED', error.message.split(':')[1]);
        if (error.message.startsWith('SAIDA_VALOR_MUST_BE_ZERO')) return Result.fail('SAIDA_VALOR_MUST_BE_ZERO', error.message.split(':')[1]);
        if (error.message === 'ESTOQUE_INSUFICIENTE') return Result.fail('ESTOQUE_INSUFICIENTE', 'Estoque insuficiente para um ou mais itens');
      }
      return Result.fail('SAIDA_BULK_TRANSACTION_FAILED', 'Falha ao registrar saídas em lote');
    }
  }

  private async processItem(dto: CreateSaidaDto, tx: Prisma.TransactionClient) {
    const book = await tx.book.findUnique({ where: { id: dto.bookId } });
    if (!book) throw new Error(`LIVRO_NOT_FOUND:Livro ${dto.bookId} não encontrado`);
    if (!book.isActive) throw new Error(`LIVRO_INATIVO:Livro ${book.title} está inativo`);

    const tipoSaida = await tx.tipoSaida.findUnique({ where: { id: dto.tipoSaidaId } });
    if (!tipoSaida) throw new Error('TIPO_SAIDA_NOT_FOUND:Tipo de saída não encontrado');

    if (tipoSaida.isVenda) {
      if (!dto.canalVendaId || !dto.formaPagamentoId) throw new Error('SAIDA_CANAL_REQUIRED:Vendas exigem canal e forma de pagamento');
      if (dto.valorUnitario <= 0) throw new Error('SAIDA_VALOR_REQUIRED:Vendas exigem valor unitário positivo');
    } else {
      if (dto.valorUnitario > 0) throw new Error('SAIDA_VALOR_MUST_BE_ZERO:Saídas que não são venda devem ter valor zero');
    }

    const valorUnitario = new Prisma.Decimal(dto.valorUnitario);
    const valorTotal = valorUnitario.mul(dto.quantidade);
    const dataSaida = new Date(dto.dataSaida);

    const record = await tx.estoque.findUnique({ where: { bookId: dto.bookId } });
    if (!record || record.quantidade < dto.quantidade) throw new Error('ESTOQUE_INSUFICIENTE');

    const estoque = EstoqueEntity.restore({
      bookId: record.bookId,
      quantidade: record.quantidade,
      custoMedio: record.custoMedio,
      dataUltimaEntrada: record.dataUltimaEntrada,
      dataUltimaSaida: record.dataUltimaSaida,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });

    estoque.decrement(dto.quantidade);
    const estoqueJson = estoque.toJSON();

    await tx.estoque.update({
      where: { bookId: dto.bookId },
      data: {
        quantidade: estoqueJson.quantidade,
        dataUltimaSaida: estoqueJson.dataUltimaSaida,
      },
    });

    const snapshotCustoUnitario = record.custoMedio;
    const snapshotCustoTotal = snapshotCustoUnitario.mul(dto.quantidade);
    
    let valorComissaoPlataforma = new Prisma.Decimal(0);
    let snapshotComissaoPlataforma = new Prisma.Decimal(0);
    let valorTaxaPagamento = new Prisma.Decimal(0);
    let snapshotTaxaPagamento = new Prisma.Decimal(0);

    if (tipoSaida.isVenda && dto.canalVendaId && dto.formaPagamentoId) {
      const canal = await tx.canalVenda.findUnique({ where: { id: dto.canalVendaId } });
      const forma = await tx.formaPagamento.findUnique({ where: { id: dto.formaPagamentoId } });

      if (canal) {
        snapshotComissaoPlataforma = canal.comissaoVariavel;
        const variavel = new Prisma.Decimal(canal.comissaoVariavel ?? 0);
        const fixa = new Prisma.Decimal(canal.comissaoFixa ?? 0);
        valorComissaoPlataforma = valorTotal.mul(variavel).add(fixa);
      }
      if (forma) {
        snapshotTaxaPagamento = forma.taxa;
        const taxa = new Prisma.Decimal(forma.taxa ?? 0);
        valorTaxaPagamento = valorTotal.mul(taxa);
      }
    }

    const lucroVenda = valorTotal
      .sub(snapshotCustoTotal)
      .sub(valorComissaoPlataforma)
      .sub(valorTaxaPagamento);

    return tx.saida.create({
      data: {
        bookId: dto.bookId,
        usuarioId: dto.usuarioId,
        tipoSaidaId: dto.tipoSaidaId,
        canalVendaId: dto.canalVendaId,
        formaPagamentoId: dto.formaPagamentoId,
        quantidade: dto.quantidade,
        valorUnitario,
        valorTotal,
        dataSaida,
        snapshotCustoUnitario,
        snapshotCustoTotal,
        snapshotComissaoPlataforma,
        valorComissaoPlataforma,
        snapshotTaxaPagamento,
        valorTaxaPagamento,
        lucroVenda,
        observacao: dto.observacao,
      },
    });
  }
}
