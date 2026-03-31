import {
  DashboardRepository,
  DashboardKPIs,
  CategoryData,
  RecentTransactionData,
  SalesTrendData,
} from '../domain/dashboard.repository';

export class InMemoryDashboardRepository implements DashboardRepository {
  public kpis: DashboardKPIs = {
    totalVendas: 0,
    lucroLiquido: 0,
    margemLucro: 0,
    ticketMedio: 0,
  };
  public categories: CategoryData[] = [];
  public transactions: RecentTransactionData[] = [];
  public trends: SalesTrendData[] = [];

  getKPIs(): Promise<DashboardKPIs> {
    return Promise.resolve(this.kpis);
  }

  getTopCategories(limit?: number): Promise<CategoryData[]> {
    return Promise.resolve(this.categories.slice(0, limit));
  }

  getRecentTransactions(limit?: number): Promise<RecentTransactionData[]> {
    return Promise.resolve(this.transactions.slice(0, limit));
  }

  getSalesTrend(): Promise<SalesTrendData[]> {
    return Promise.resolve(this.trends);
  }
}
