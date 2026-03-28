import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Result } from '../../common';
import { CreateEntradaDto } from './create-entrada.dto';
import { EstoqueEntity } from '../stock/domain/entities/estoque.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class CreateEntradaUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateEntradaDto): Promise<Result<any>> {
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

    const custoUnitario = new Prisma.Decimal(dto.custoUnitario ?? 0);

    const valorTotal = custoUnitario.mul(dto.quantidade);
    const dataEntrada = new Date(dto.dataEntrada);

    try {
      const entrada = await this.prisma.$transaction(async (tx) => {
        const record = await tx.estoque.findUnique({
          where: { bookId: dto.bookId },
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
          : EstoqueEntity.create(dto.bookId);

        estoque.applyEntrada(dto.quantidade, custoUnitario);

        const estoqueJson = estoque.toJSON();
        await tx.estoque.upsert({
          where: { bookId: dto.bookId },
          create: {
            bookId: estoqueJson.bookId,
            quantidade: estoqueJson.quantidade,
            custoMedio: estoqueJson.custoMedio,
            dataUltimaEntrada: estoqueJson.dataUltimaEntrada,
          },
          update: {
            quantidade: estoqueJson.quantidade,
            custoMedio: estoqueJson.custoMedio,
            dataUltimaEntrada: estoqueJson.dataUltimaEntrada,
          },
        });

        return tx.entrada.create({
          data: {
            bookId: dto.bookId,
            usuarioId: dto.usuarioId,
            dataEntrada,
            quantidade: dto.quantidade,
            custoUnitario,
            valorTotal,
            fornecedor: dto.fornecedor,
            numeroNotaFiscal: dto.numeroNotaFiscal,
            observacao: dto.observacao,
          },
        });
      });

      return Result.ok(entrada);
    } catch (error) {
      console.error(error);
      return Result.fail(
        'ENTRADA_TRANSACTION_FAILED',
        'Falha ao registrar entrada',
      );
    }
  }
}
