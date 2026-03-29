import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Result } from '../../../common/interfaces/result.interface';

export interface DashboardKPIs {
  totalVendas: number;
  lucroLiquido: number;
  margemLucro: number;
  ticketMedio: number;
}

interface RawKPI {
  total_vendas: number | null;
  lucro_liquido: number | null;
  margem_lucro: number | null;
  ticket_medio: number | null;
}

interface RawKPIRow {
  total_vendas: number;
  lucro_liquido: number;
  margem_lucro: number;
  ticket_medio: number;
}

@Injectable()
export class GetKPIsUseCase {
  private readonly logger = new Logger(GetKPIsUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<Result<DashboardKPIs>> {
    try {
      const result = await this.prisma.$queryRaw<RawKPIRow[]>`
        SELECT 
          SUM(s.valor_total) AS total_vendas,
          SUM(s.lucro_venda) AS lucro_liquido,
          CASE WHEN SUM(s.valor_total) > 0 THEN (SUM(s.lucro_venda) / SUM(s.valor_total)) * 100 ELSE 0 END AS margem_lucro,
          CASE WHEN COUNT(s.id) > 0 THEN SUM(s.valor_total) / COUNT(s.id) ELSE 0 END AS ticket_medio
        FROM saida s
        INNER JOIN tipo_saida ts ON s.id_tipo_saida = ts.id
        WHERE ts.is_venda = TRUE
      `;

      const kpiRow = result[0] || {} as RawKPIRow;

      const kpis: DashboardKPIs = {
        totalVendas: Number(kpiRow.total_vendas) || 0,
        lucroLiquido: Number(kpiRow.lucro_liquido) || 0,
        margemLucro: Number(kpiRow.margem_lucro) || 0,
        ticketMedio: Number(kpiRow.ticket_medio) || 0,
      };

      return Result.ok(kpis);
    } catch (error) {
      this.logger.error('Failed to retrieve KPIs', error);
      return Result.fail(
        'GET_KPIS_ERROR',
        'Falha ao processar indicadores gerais.',
      );
    }
  }
}
