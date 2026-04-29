import {
  DashboardRepository,
  DashboardKPIs,
  CategoryData,
  RecentTransactionData,
  SalesTrendData,
  DashboardFilters,
  DashboardBookAttribute,
  DashboardBookAttributeValue,
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
  public bookAttributeValues: DashboardBookAttributeValue[] = [];

  getKPIs(filters?: DashboardFilters): Promise<DashboardKPIs> {
    void filters;
    return Promise.resolve(this.kpis);
  }

  getTopCategories(
    filters?: DashboardFilters,
    limit?: number,
  ): Promise<CategoryData[]> {
    void filters;
    return Promise.resolve(this.categories.slice(0, limit));
  }

  getRecentTransactions(
    filters?: DashboardFilters,
    limit?: number,
  ): Promise<RecentTransactionData[]> {
    void filters;
    return Promise.resolve(this.transactions.slice(0, limit));
  }

  getSalesTrend(
    filters?: DashboardFilters,
    days?: number,
  ): Promise<SalesTrendData[]> {
    void filters;
    void days;
    return Promise.resolve(this.trends);
  }

  getBookAttributeValues(
    attribute: DashboardBookAttribute,
  ): Promise<DashboardBookAttributeValue[]> {
    void attribute;
    return Promise.resolve(this.bookAttributeValues);
  }
}
