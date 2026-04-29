import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Result } from '../../common';
import { BulkCreateEntradaDto } from './bulk-create-entrada.dto';
import { EstoqueEntity } from '../stock/domain/entities/estoque.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class BulkCreateEntradaUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: BulkCreateEntradaDto): Promise<Result<any[]>> {
    const dataEntrada = new Date(dto.dataEntrada);

    try {
      const results = await this.prisma.$transaction(async (tx) => {
        const createdEntradas = [];

        for (const item of dto.items) {
          const book = await tx.book.findUnique({ where: { id: item.bookId } });
          if (!book) throw new Error(`LIVRO_NOT_FOUND:${item.bookId}`);
          if (!book.isActive) throw new Error(`LIVRO_INATIVO:${item.bookId}`);

          const tipoEntrada = await tx.tipoEntrada.findUnique({
            where: { id: item.tipoEntradaId },
          });
          if (!tipoEntrada || !tipoEntrada.isActive) {
            throw new Error(`TIPO_ENTRADA_NOT_FOUND:${item.tipoEntradaId}`);
          }

          const custoUnitario = tipoEntrada.isDoacao
            ? new Prisma.Decimal(0)
            : new Prisma.Decimal(item.custoUnitario ?? 0);
          const valorTotal = custoUnitario.mul(item.quantidade);

          const record = await tx.estoque.findUnique({
            where: { bookId: item.bookId },
          });
          const estoque = record
            ? EstoqueEntity.restore({
                bookId: record.bookId,
                quantidade: record.quantidade,
                custoMedio: record.custoMedio,
                dataUltimaEntrada: record.dataUltimaEntrada,
                dataUltimaSaida: record.dataUltimaSaida,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt,
              })
            : EstoqueEntity.create(item.bookId);

          estoque.applyEntrada(item.quantidade, custoUnitario);
          const estoqueJson = estoque.toJSON();

          await tx.estoque.upsert({
            where: { bookId: item.bookId },
            create: {
              bookId: estoqueJson.bookId,
              quantidade: estoqueJson.quantidade,
              custoMedio: estoqueJson.custoMedio,
              dataUltimaEntrada: dataEntrada,
            },
            update: {
              quantidade: estoqueJson.quantidade,
              custoMedio: estoqueJson.custoMedio,
              dataUltimaEntrada: dataEntrada,
            },
          });

          const entrada = await tx.entrada.create({
            data: {
              bookId: item.bookId,
              usuarioId: dto.usuarioId,
              tipoEntradaId: item.tipoEntradaId,
              dataEntrada,
              quantidade: item.quantidade,
              custoUnitario,
              valorTotal,
              fornecedor: dto.fornecedor || item.fornecedor,
              numeroNotaFiscal: dto.numeroNotaFiscal || item.numeroNotaFiscal,
              observacao: item.observacao || dto.observacao,
            },
          });
          createdEntradas.push(entrada);
        }

        return createdEntradas;
      });

      return Result.ok(results);
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const [code, details] = errorMessage.split(':');
      return Result.fail(
        code || 'BULK_ENTRADA_FAILED',
        details || 'Falha ao processar lote de entradas',
      );
    }
  }
}
