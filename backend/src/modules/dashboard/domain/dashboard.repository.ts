export interface DashboardKPIs {
  totalVendas: number;
  lucroLiquido: number;
  margemLucro: number;
  ticketMedio: number;
}

export interface CategoryData {
  category: string;
  totalSales: number;
  netProfit: number;
}

export interface BookSalesData {
  bookId: number;
  bookName: string;
  quantitySold: number;
  totalSales: number;
  netProfit: number;
}

export interface RecentTransactionData {
  id: number;
  bookName: string;
  date: string;
  quantity: number;
  totalValue: number;
  profit: number;
}

export interface SalesTrendData {
  date: string;
  totalSales: number;
  netProfit: number;
}

export const SALES_COMPARISON_DIMENSIONS = [
  'canalVenda',
  'formaPagamento',
  'genreId',
  'languageId',
  'publisherId',
] as const;

export type SalesComparisonDimension =
  (typeof SALES_COMPARISON_DIMENSIONS)[number];

export interface SalesComparisonFilters extends DashboardFilters {
  dimension: SalesComparisonDimension;
  groupIds?: number[];
}

export interface SalesComparisonData {
  date: string;
  groupId: number;
  groupLabel: string;
  totalSales: number;
  netProfit: number;
}

export const DASHBOARD_BOOK_ATTRIBUTES = [
  'classificacaoId',
  'genreId',
  'publisherId',
  'languageId',
  'condition',
  'status',
  'editionType',
] as const;

export type DashboardBookAttribute = (typeof DASHBOARD_BOOK_ATTRIBUTES)[number];

export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  search?: string;
  bookAttribute?: DashboardBookAttribute;
  bookAttributeValues?: string[];
}

export interface DashboardBookAttributeValue {
  value: string;
  label: string;
}

export interface DashboardRepository {
  getKPIs(filters?: DashboardFilters): Promise<DashboardKPIs>;
  getTopCategories(
    filters?: DashboardFilters,
    limit?: number,
  ): Promise<CategoryData[]>;
  getTopBooks(
    filters?: DashboardFilters,
    limit?: number,
  ): Promise<BookSalesData[]>;
  getRecentTransactions(
    filters?: DashboardFilters,
    limit?: number,
  ): Promise<RecentTransactionData[]>;
  getSalesTrend(
    filters?: DashboardFilters,
    days?: number,
  ): Promise<SalesTrendData[]>;
  getSalesComparison(
    filters: SalesComparisonFilters,
  ): Promise<SalesComparisonData[]>;
  getBookAttributeValues(
    attribute: DashboardBookAttribute,
  ): Promise<DashboardBookAttributeValue[]>;
}
