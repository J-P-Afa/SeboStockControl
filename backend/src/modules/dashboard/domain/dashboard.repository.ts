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

export interface RecentTransactionData {
  id: number;
  bookName: string;
  date: string;
  totalValue: number;
  profit: number;
}

export interface SalesTrendData {
  date: string;
  totalSales: number;
  profit: number;
}

export interface DashboardRepository {
  getKPIs(): Promise<DashboardKPIs>;
  getTopCategories(limit?: number): Promise<CategoryData[]>;
  getRecentTransactions(limit?: number): Promise<RecentTransactionData[]>;
  getSalesTrend(days?: number): Promise<SalesTrendData[]>;
}
