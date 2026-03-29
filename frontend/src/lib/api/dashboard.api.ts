import { apiClient as client } from "./client"

export interface DashboardKPIs {
  totalVendas: number
  lucroLiquido: number
  margemLucro: number
  ticketMedio: number
}

export interface SalesTrend {
  date: string
  totalSales: number
  netProfit: number
}

export interface CategoryData {
  category: string
  totalSales: number
  netProfit: number
}

export interface RecentTransaction {
  id: number
  bookName: string
  date: string
  totalValue: number
  profit: number
}

export const dashboardApi = {
  getKPIs: async () => {
    const { data } = await client.get<{ data: DashboardKPIs }>("/dashboard/kpis")
    return data.data
  },
  getSalesTrend: async () => {
    const { data } = await client.get<{ data: SalesTrend[] }>("/dashboard/sales-trend")
    return data.data
  },
  getTopCategories: async () => {
    const { data } = await client.get<{ data: CategoryData[] }>("/dashboard/top-categories")
    return data.data
  },
  getRecentTransactions: async () => {
    const { data } = await client.get<{ data: RecentTransaction[] }>(
      "/dashboard/recent-transactions"
    )
    return data.data
  },
}
