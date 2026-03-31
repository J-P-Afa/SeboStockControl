import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { 
  DashboardRepository, 
  DashboardKPIs, 
  CategoryData, 
  RecentTransactionData, 
  SalesTrendData 
} from '../domain/dashboard.repository';

interface RawKPIRow {
  total_vendas: number | null;
  lucro_liquido: number | null;
  margem_lucro: number | null;
  ticket_medio: number | null;
}

interface RawCategoryData {
  category: string;
  total_vendas: number;
  lucro_liquido: number;
}

interface RawTransactionRow {
  id: number;
  book_name: string;
  date: string;
  valor_total: number;
  profit: number;
}

interface RawSalesTrend {
  date: string;
  total_vendas: number;
  lucro_liquido: number;
}

@Injectable()
export class PrismaDashboardRepository implements DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getKPIs(): Promise<DashboardKPIs> {
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

    const row = result[0] || ({} as RawKPIRow);

    return {
      totalVendas: Number(row.total_vendas) || 0,
      lucroLiquido: Number(row.lucro_liquido) || 0,
      margemLucro: Number(row.margem_lucro) || 0,
      ticketMedio: Number(row.ticket_medio) || 0,
    };
  }

  async getTopCategories(limit = 5): Promise<CategoryData[]> {
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
      LIMIT ${limit}
    `;

    return result.map((row) => ({
      category: String(row.category),
      totalSales: Number(row.total_vendas) || 0,
      netProfit: Number(row.lucro_liquido) || 0,
    }));
  }

  async getRecentTransactions(limit = 10): Promise<RecentTransactionData[]> {
    const result = await this.prisma.$queryRaw<RawTransactionRow[]>`
      SELECT 
        s.id,
        l.descricao AS book_name,
        TO_CHAR(s.data, 'YYYY-MM-DD') AS date,
        s.valor_total,
        s.lucro_venda AS profit
      FROM saida s
      INNER JOIN tipo_saida ts ON s.id_tipo_saida = ts.id
      INNER JOIN livro l ON s.id_livro = l.id
      WHERE ts.is_venda = TRUE
      ORDER BY s.data DESC, s.created_at DESC
      LIMIT ${limit}
    `;

    return result.map((row) => ({
      id: Number(row.id),
      bookName: String(row.book_name),
      date: String(row.date),
      totalValue: Number(row.valor_total) || 0,
      profit: Number(row.profit) || 0,
    }));
  }

  async getSalesTrend(days = 30): Promise<SalesTrendData[]> {
    const result = await this.prisma.$queryRaw<RawSalesTrend[]>`
      SELECT 
        TO_CHAR(s.data, 'YYYY-MM-DD') AS date,
        SUM(s.valor_total) AS total_vendas,
        SUM(s.lucro_venda) AS lucro_liquido
      FROM saida s
      INNER JOIN tipo_saida ts ON s.id_tipo_saida = ts.id
      WHERE ts.is_venda = TRUE
        AND s.data >= CURRENT_DATE - CAST(${days} || ' days' AS INTERVAL)
      GROUP BY s.data
      ORDER BY s.data ASC
    `;

    return result.map((row) => ({
      date: String(row.date),
      totalSales: Number(row.total_vendas) || 0,
      profit: Number(row.lucro_liquido) || 0,
    }));
  }
}
