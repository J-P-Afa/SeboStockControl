import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  DashboardRepository,
  DashboardKPIs,
  CategoryData,
  BookSalesData,
  RecentTransactionData,
  SalesTrendData,
  DashboardFilters,
  DashboardBookAttribute,
  DashboardBookAttributeValue,
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

interface RawBookSalesData {
  book_id: number;
  book_name: string;
  quantidade_vendida: number;
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

interface RawBookAttributeValue {
  value: string;
  label: string;
}

const NUMERIC_BOOK_ATTRIBUTE_COLUMNS: Partial<
  Record<DashboardBookAttribute, Prisma.Sql>
> = {
  classificacaoId: Prisma.sql`l.classificacao_id`,
  genreId: Prisma.sql`l.genre_id`,
  publisherId: Prisma.sql`l.publisher_id`,
  languageId: Prisma.sql`l.language_id`,
};

const TEXT_BOOK_ATTRIBUTE_COLUMNS: Partial<
  Record<DashboardBookAttribute, Prisma.Sql>
> = {
  condition: Prisma.sql`l.condition::text`,
  status: Prisma.sql`l.status::text`,
  editionType: Prisma.sql`l.edition_type::text`,
};

const TEXT_ATTRIBUTE_VALUES: Partial<Record<DashboardBookAttribute, string[]>> =
  {
    condition: ['novo', 'usado'],
    status: ['completo', 'em_lancamento'],
    editionType: ['normal', 'variante'],
  };

const STATIC_BOOK_ATTRIBUTE_VALUES: Partial<
  Record<DashboardBookAttribute, DashboardBookAttributeValue[]>
> = {
  condition: [
    { value: 'novo', label: 'Novo' },
    { value: 'usado', label: 'Usado' },
  ],
  status: [
    { value: 'completo', label: 'Completo' },
    { value: 'em_lancamento', label: 'Em lançamento' },
  ],
  editionType: [
    { value: 'normal', label: 'Normal' },
    { value: 'variante', label: 'Variante' },
  ],
};

@Injectable()
export class PrismaDashboardRepository implements DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildDashboardWhere(
    filters: DashboardFilters = {},
    fallbackTrendDays?: number,
  ): Prisma.Sql {
    const clauses: Prisma.Sql[] = [Prisma.sql`ts.is_venda = TRUE`];
    const hasExplicitDateRange = Boolean(filters.startDate || filters.endDate);

    if (filters.startDate) {
      clauses.push(
        Prisma.sql`s.data_saida >= CAST(${filters.startDate} AS DATE)`,
      );
    }

    if (filters.endDate) {
      clauses.push(
        Prisma.sql`s.data_saida < CAST(${filters.endDate} AS DATE) + INTERVAL '1 day'`,
      );
    }

    if (!hasExplicitDateRange && fallbackTrendDays) {
      clauses.push(
        Prisma.sql`s.data_saida >= CURRENT_DATE - CAST(${fallbackTrendDays} || ' days' AS INTERVAL)`,
      );
    }

    const bookAttributeClause = this.buildBookAttributeClause(filters);
    if (bookAttributeClause) {
      clauses.push(bookAttributeClause);
    }

    return Prisma.sql`WHERE ${Prisma.join(clauses, ' AND ')}`;
  }

  private buildBookAttributeClause(
    filters: DashboardFilters,
  ): Prisma.Sql | undefined {
    const { bookAttribute, bookAttributeValues } = filters;

    if (!bookAttribute || !bookAttributeValues?.length) {
      return undefined;
    }

    const numericColumn = NUMERIC_BOOK_ATTRIBUTE_COLUMNS[bookAttribute];
    if (numericColumn) {
      const numericValues = bookAttributeValues
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0);

      return numericValues.length > 0
        ? Prisma.sql`${numericColumn} IN (${Prisma.join(numericValues)})`
        : Prisma.sql`FALSE`;
    }

    const textColumn = TEXT_BOOK_ATTRIBUTE_COLUMNS[bookAttribute];
    if (textColumn) {
      const allowedValues = TEXT_ATTRIBUTE_VALUES[bookAttribute] ?? [];
      const textValues = bookAttributeValues.filter((value) =>
        allowedValues.includes(value),
      );

      return textValues.length > 0
        ? Prisma.sql`${textColumn} IN (${Prisma.join(textValues)})`
        : Prisma.sql`FALSE`;
    }

    return undefined;
  }

  async getKPIs(filters: DashboardFilters = {}): Promise<DashboardKPIs> {
    const where = this.buildDashboardWhere(filters);
    const result = await this.prisma.$queryRaw<RawKPIRow[]>`
      SELECT 
        SUM(s.valor_total) AS total_vendas,
        SUM(s.lucro_venda) AS lucro_liquido,
        CASE WHEN SUM(s.valor_total) > 0 THEN (SUM(s.lucro_venda) / SUM(s.valor_total)) * 100 ELSE 0 END AS margem_lucro,
        CASE WHEN COUNT(s.id) > 0 THEN SUM(s.valor_total) / COUNT(s.id) ELSE 0 END AS ticket_medio
      FROM saida s
      INNER JOIN tipo_saida ts ON s.tipo_saida_id = ts.id
      INNER JOIN books l ON s.book_id = l.id
      ${where}
    `;

    const row = result[0] || ({} as RawKPIRow);

    return {
      totalVendas: Number(row.total_vendas) || 0,
      lucroLiquido: Number(row.lucro_liquido) || 0,
      margemLucro: Number(row.margem_lucro) || 0,
      ticketMedio: Number(row.ticket_medio) || 0,
    };
  }

  async getTopCategories(
    filters: DashboardFilters = {},
    limit = 5,
  ): Promise<CategoryData[]> {
    const where = this.buildDashboardWhere(filters);
    const result = await this.prisma.$queryRaw<RawCategoryData[]>`
      SELECT 
        c.descricao AS category,
        SUM(s.valor_total) AS total_vendas,
        SUM(s.lucro_venda) AS lucro_liquido
      FROM saida s
      INNER JOIN tipo_saida ts ON s.tipo_saida_id = ts.id
      INNER JOIN books l ON s.book_id = l.id
      INNER JOIN classificacao c ON l.classificacao_id = c.id
      ${where}
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

  async getTopBooks(
    filters: DashboardFilters = {},
    limit = 5,
  ): Promise<BookSalesData[]> {
    const where = this.buildDashboardWhere(filters);
    const result = await this.prisma.$queryRaw<RawBookSalesData[]>`
      SELECT 
        l.id AS book_id,
        l.title AS book_name,
        SUM(s.quantidade) AS quantidade_vendida,
        SUM(s.valor_total) AS total_vendas,
        SUM(s.lucro_venda) AS lucro_liquido
      FROM saida s
      INNER JOIN tipo_saida ts ON s.tipo_saida_id = ts.id
      INNER JOIN books l ON s.book_id = l.id
      ${where}
      GROUP BY l.id, l.title
      ORDER BY total_vendas DESC, quantidade_vendida DESC
      LIMIT ${limit}
    `;

    return result.map((row) => ({
      bookId: Number(row.book_id),
      bookName: String(row.book_name),
      quantitySold: Number(row.quantidade_vendida) || 0,
      totalSales: Number(row.total_vendas) || 0,
      netProfit: Number(row.lucro_liquido) || 0,
    }));
  }

  async getRecentTransactions(
    filters: DashboardFilters = {},
    limit = 10,
  ): Promise<RecentTransactionData[]> {
    const where = this.buildDashboardWhere(filters);
    const result = await this.prisma.$queryRaw<RawTransactionRow[]>`
      SELECT 
        s.id,
        l.title AS book_name,
        TO_CHAR(s.data_saida, 'YYYY-MM-DD') AS date,
        s.valor_total,
        s.lucro_venda AS profit
      FROM saida s
      INNER JOIN tipo_saida ts ON s.tipo_saida_id = ts.id
      INNER JOIN books l ON s.book_id = l.id
      ${where}
      ORDER BY s.data_saida DESC, s.created_at DESC
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

  async getSalesTrend(
    filters: DashboardFilters = {},
    days = 30,
  ): Promise<SalesTrendData[]> {
    const where = this.buildDashboardWhere(filters, days);
    const result = await this.prisma.$queryRaw<RawSalesTrend[]>`
      SELECT 
        TO_CHAR(s.data_saida, 'YYYY-MM-DD') AS date,
        SUM(s.valor_total) AS total_vendas,
        SUM(s.lucro_venda) AS lucro_liquido
      FROM saida s
      INNER JOIN tipo_saida ts ON s.tipo_saida_id = ts.id
      INNER JOIN books l ON s.book_id = l.id
      ${where}
      GROUP BY TO_CHAR(s.data_saida, 'YYYY-MM-DD')
      ORDER BY date ASC
    `;

    return result.map((row) => ({
      date: String(row.date),
      totalSales: Number(row.total_vendas) || 0,
      netProfit: Number(row.lucro_liquido) || 0,
    }));
  }

  async getBookAttributeValues(
    attribute: DashboardBookAttribute,
  ): Promise<DashboardBookAttributeValue[]> {
    const staticValues = STATIC_BOOK_ATTRIBUTE_VALUES[attribute];
    if (staticValues) {
      return staticValues;
    }

    const result = await this.findLookupAttributeValues(attribute);

    return result.map((row) => ({
      value: String(row.value),
      label: String(row.label),
    }));
  }

  private findLookupAttributeValues(
    attribute: DashboardBookAttribute,
  ): Promise<RawBookAttributeValue[]> {
    switch (attribute) {
      case 'classificacaoId':
        return this.prisma.$queryRaw<RawBookAttributeValue[]>`
          SELECT id::text AS value, descricao AS label
          FROM classificacao
          WHERE is_active = TRUE
          ORDER BY descricao ASC
        `;
      case 'genreId':
        return this.prisma.$queryRaw<RawBookAttributeValue[]>`
          SELECT id::text AS value, description AS label
          FROM genres
          WHERE "isActive" = TRUE
          ORDER BY description ASC
        `;
      case 'publisherId':
        return this.prisma.$queryRaw<RawBookAttributeValue[]>`
          SELECT id::text AS value, description AS label
          FROM publishers
          WHERE "isActive" = TRUE
          ORDER BY description ASC
        `;
      case 'languageId':
        return this.prisma.$queryRaw<RawBookAttributeValue[]>`
          SELECT id::text AS value, description AS label
          FROM languages
          WHERE "isActive" = TRUE
          ORDER BY description ASC
        `;
      default:
        return Promise.resolve([]);
    }
  }
}
