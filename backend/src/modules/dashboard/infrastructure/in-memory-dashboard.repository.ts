import { 
  DashboardRepository, 
  DashboardKPIs, 
  CategoryData, 
  RecentTransactionData, 
  SalesTrendData 
} from '../domain/dashboard.repository';

export class InMemoryDashboardRepository implements DashboardRepository {
  public kpis: DashboardKPIs = {
    totalVendas: 0,
    lucroLiquido: 0,
    margemLucro: 0,
    ticketMedio: 0
  };
  public categories: CategoryData[] = [];
  public transactions: RecentTransactionData[] = [];
  public trends: SalesTrendData[] = [];

  async getKPIs(): Promise<DashboardKPIs> {
    return this.kpis;
  }

  async getTopCategories(limit?: number): Promise<CategoryData[]> {
    return this.categories.slice(0, limit);
  }

  async getRecentTransactions(limit?: number): Promise<RecentTransactionData[]> {
    return this.transactions.slice(0, limit);
  }

  async getSalesTrend(days?: number): Promise<SalesTrendData[]> {
    return this.trends;
  }
}
