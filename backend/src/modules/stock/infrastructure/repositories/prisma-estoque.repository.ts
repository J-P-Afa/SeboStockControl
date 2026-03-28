import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import {
  IStockRepository,
  EstoqueWithBook,
} from '../../domain/repositories/stock.repository.interface';
import { EstoqueEntity } from '../../domain/entities/estoque.entity';

/**
 * @ai-context Estoque é read-only do ponto de vista de APIs externas.
 * Escrita exclusiva pelos módulos de Entrada e Saída via transações atômicas.
 */
@Injectable()
export class PrismaEstoqueRepository implements IStockRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByBookId(bookId: number): Promise<EstoqueWithBook | null> {
    const record = await this.prisma.estoque.findUnique({
      where: { bookId },
      include: {
        book: {
          select: {
            title: true,
            condition: true,
            isbn13: true,
          },
        },
      },
    });
    if (!record) return null;
    return this.mapToEntity(record);
  }

  async findAll(): Promise<EstoqueWithBook[]> {
    const records = await this.prisma.estoque.findMany({
      include: {
        book: {
          select: {
            title: true,
            condition: true,
            isbn13: true,
          },
        },
      },
      orderBy: { book: { title: 'asc' } },
    });
    return records.map((r) => this.mapToEntity(r));
  }

  private mapToEntity(
    record: Prisma.EstoqueGetPayload<{
      include: {
        book: { select: { title: true; condition: true; isbn13: true } };
      };
    }>,
  ): EstoqueWithBook {
    const entity = EstoqueEntity.restore({
      bookId: record.bookId,
      quantidade: record.quantidade,
      custoMedio: record.custoMedio,
      dataUltimaEntrada: record.dataUltimaEntrada,
      dataUltimaSaida: record.dataUltimaSaida,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });

    return Object.assign(entity, {
      book: {
        title: record.book.title,
        condition: record.book.condition,
        isbn13: record.book.isbn13,
      },
    }) as EstoqueWithBook;
  }
}
