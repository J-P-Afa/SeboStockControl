import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Result } from '../../../common/interfaces/result.interface';

export interface SalesTrendData {
  date: string;
  totalSales: number;
  netProfit: number;
}

interface RawSalesTrend {
  date: string;
  total_vendas: number;
  lucro_liquido: number;
}

@Injectable()
export class GetSalesTrendUseCase {
  private readonly logger = new Logger(GetSalesTrendUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<Result<SalesTrendData[]>> {
    try {
      const result = await this.prisma.$queryRaw<RawSalesTrend[]>`
        SELECT 
          TO_CHAR(s.data, 'YYYY-MM-DD') AS date,
          SUM(s.valor_total) AS total_vendas,
          SUM(s.lucro_venda) AS lucro_liquido
        FROM saida s
        INNER JOIN tipo_saida ts ON s.id_tipo_saida = ts.id
        WHERE ts.is_venda = TRUE
          AND s.data >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY s.data
        ORDER BY s.data ASC
      `;

      const mappedData = result.map((row) => ({
        date: String(row.date),
        totalSales: Number(row.total_vendas) || 0,
        netProfit: Number(row.lucro_liquido) || 0,
      }));

      return Result.ok(mappedData);
    } catch (error) {
      this.logger.error('Failed to retrieve sales trends', error);
      return Result.fail(
        'GET_SALES_TREND_ERROR',
        'Falha ao processar tendência de vendas.',
      );
    }
  }
}
