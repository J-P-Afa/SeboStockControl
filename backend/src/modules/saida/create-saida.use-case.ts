import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Result } from '../../common';
import { CreateSaidaDto } from './create-saida.dto';
import { EstoqueEntity } from '../stock/domain/entities/estoque.entity';
import { Prisma, Saida } from '@prisma/client';

@Injectable()
export class CreateSaidaUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateSaidaDto): Promise<Result<Saida>> {
    const book = await this.prisma.book.findUnique({
      where: { id: dto.bookId },
    });
    if (!book) {
      return Result.fail('LIVRO_NOT_FOUND', 'Book não encontrado');
    }

    if (!book.isActive) {
      return Result.fail(
        'LIVRO_INATIVO',
        'Book inisActive — movimentação não permitida',
      );
    }

    const tipoSaida = await this.prisma.tipoSaida.findUnique({
      where: { id: dto.tipoSaidaId },
    });
    if (!tipoSaida) {
      return Result.fail(
        'TIPO_SAIDA_NOT_FOUND',
        'Tipo de saída não encontrado',
      );
    }

    // RULE [SAI-02]: Vendas exigem canal, forma de pagto e valor > 0
    if (tipoSaida.isVenda) {
      if (!dto.canalVendaId || !dto.formaPagamentoId) {
        return Result.fail(
          'SAIDA_CANAL_REQUIRED',
          'Vendas exigem canal e forma de pagamento',
        );
      }
      if (dto.valorUnitario <= 0) {
        return Result.fail(
          'SAIDA_VALOR_REQUIRED',
          'Vendas exigem valor unitário positivo',
        );
      }
    } else {
      // RULE [SAI-03]: Não-vendas devem ter valorUnitario = 0
      if (dto.valorUnitario > 0) {
        return Result.fail(
          'SAIDA_VALOR_MUST_BE_ZERO',
          'Saídas que não são venda devem ter valor zero',
        );
      }
    }

    const valorUnitario = new Prisma.Decimal(dto.valorUnitario);
    const valorTotal = valorUnitario.mul(dto.quantidade);
    const dataSaida = new Date(dto.dataSaida);

    try {
      const saida = await this.prisma.$transaction(async (tx) => {
        const record = await tx.estoque.findUnique({
          where: { bookId: dto.bookId },
        });
        if (!record || record.quantidade < dto.quantidade) {
          throw new Error('ESTOQUE_INSUFICIENTE');
        }

        const estoque = EstoqueEntity.restore({
          bookId: record.bookId,
          quantidade: record.quantidade,
          custoMedio: record.custoMedio,
          dataUltimaEntrada: record.dataUltimaEntrada,
          dataUltimaSaida: record.dataUltimaSaida,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        });

        // RULE [SAI-04]: Decrementar estoque
        estoque.decrement(dto.quantidade);

        const estoqueJson = estoque.toJSON();
        await tx.estoque.update({
          where: { bookId: dto.bookId },
          data: {
            quantidade: estoqueJson.quantidade,
            dataUltimaSaida: estoqueJson.dataUltimaSaida,
          },
        });

        // Snapshots (RULE [SAI-03])
        const snapshotCustoUnitario = record.custoMedio;
        const snapshotCustoTotal = snapshotCustoUnitario.mul(dto.quantidade);

        let valorComissaoPlataforma = new Prisma.Decimal(0);
        let snapshotComissaoPlataforma = new Prisma.Decimal(0);
        let valorTaxaPagamento = new Prisma.Decimal(0);
        let snapshotTaxaPagamento = new Prisma.Decimal(0);

        if (tipoSaida.isVenda && dto.canalVendaId && dto.formaPagamentoId) {
          const canal = await tx.canalVenda.findUnique({
            where: { id: dto.canalVendaId },
          });
          const forma = await tx.formaPagamento.findUnique({
            where: { id: dto.formaPagamentoId },
          });

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
      });

      return Result.ok(saida);
    } catch (error) {
      if (error instanceof Error && error.message === 'ESTOQUE_INSUFICIENTE') {
        return Result.fail(
          'ESTOQUE_INSUFICIENTE',
          'Estoque insuficiente para realizar a saída',
        );
      }
      console.error(error);
      return Result.fail(
        'SAIDA_TRANSACTION_FAILED',
        'Falha ao registrar saída',
      );
    }
  }
}
