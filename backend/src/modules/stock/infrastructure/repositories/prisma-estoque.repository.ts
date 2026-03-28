import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { IStockRepository, EstoqueWithLivro } from '../../domain/repositories/stock.repository.interface';
import { EstoqueEntity } from '../../domain/entities/estoque.entity';

/**
 * @ai-context Estoque é read-only do ponto de vista de APIs externas.
 * Escrita exclusiva pelos módulos de Entrada e Saída via transações atômicas.
 */
@Injectable()
export class PrismaEstoqueRepository implements IStockRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByLivroId(livroId: number): Promise<EstoqueWithLivro | null> {
    // @ts-ignore
    const record = await this.prisma.estoque.findUnique({
      where: { livroId },
      include: { livro: true },
    });
    if (!record) return null;
    return this.mapToEntity(record);
  }

  async findAll(): Promise<EstoqueWithLivro[]> {
    // @ts-ignore
    const records = await this.prisma.estoque.findMany({
      include: { livro: { select: { descricao: true, estado: true, isbn13: true } } },
      orderBy: { livro: { descricao: 'asc' } },
    });
    return records.map(this.mapToEntity);
  }

  private mapToEntity(record: any): EstoqueWithLivro {
    const entity = EstoqueEntity.restore({
      livroId: record.livroId,
      quantidade: record.quantidade,
      custoUnitarioMedio: Number(record.custoUnitarioMedio),
      custoTotal: Number(record.custoTotal),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });

    return Object.assign(entity, {
      livro: {
        descricao: record.livro.descricao,
        estado: record.livro.estado,
        isbn13: record.livro.isbn13,
      },
    }) as EstoqueWithLivro;
  }
}
