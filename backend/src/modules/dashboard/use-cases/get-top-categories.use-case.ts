import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Result } from '../../../common/interfaces/result.interface';

export interface CategoryData {
  category: string;
  totalSales: number;
  netProfit: number;
}

interface RawCategoryData {
  category: string;
  total_vendas: number;
  lucro_liquido: number;
}

@Injectable()
export class GetTopCategoriesUseCase {
  private readonly logger = new Logger(GetTopCategoriesUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<Result<CategoryData[]>> {
    try {
      const result = await this.prisma.$queryRaw<RawCategoryData[]>`
        SELECT 
          c.descricao AS category,
          SUM(s.valor_total) AS total_vendas,
          SUM(s.lucro_venda) AS lucro_liquido
        FROM saida s
        INNER JOIN tipo_saida ts ON s.id_tipo_saida = ts.id
        INNER JOIN livro l ON s.id_livro = l.id
        INNER JOIN classificacao c ON l.id_classificacao = c.id
        WHERE ts.is_venda = TRUE
        GROUP BY c.id, c.descricao
        ORDER BY total_vendas DESC
        LIMIT 5
      `;

      const mappedData = result.map((row) => ({
        category: String(row.category),
        totalSales: Number(row.total_vendas) || 0,
        netProfit: Number(row.lucro_liquido) || 0,
      }));

      return Result.ok(mappedData);
    } catch (error) {
      this.logger.error('Failed to retrieve top categories', error);
      return Result.fail(
        'GET_TOP_CATEGORIES_ERROR',
        'Falha ao processar categorias.',
      );
    }
  }
}
