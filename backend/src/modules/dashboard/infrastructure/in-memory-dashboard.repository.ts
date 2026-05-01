import {
  DashboardRepository,
  DashboardKPIs,
  CategoryData,
  BookSalesData,
  RecentTransactionData,
  SalesTrendData,
  SalesComparisonData,
  SalesComparisonFilters,
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
  public topBooks: BookSalesData[] = [];
  public transactions: RecentTransactionData[] = [];
  public trends: SalesTrendData[] = [];
  public salesComparison: SalesComparisonData[] = [];
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

  getTopBooks(
    filters?: DashboardFilters,
    limit?: number,
  ): Promise<BookSalesData[]> {
    void filters;
    return Promise.resolve(this.topBooks.slice(0, limit));
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

  getSalesComparison(
    filters: SalesComparisonFilters,
  ): Promise<SalesComparisonData[]> {
    void filters;
    return Promise.resolve(this.salesComparison);
  }

  getBookAttributeValues(
    attribute: DashboardBookAttribute,
  ): Promise<DashboardBookAttributeValue[]> {
    void attribute;
    return Promise.resolve(this.bookAttributeValues);
  }
}
