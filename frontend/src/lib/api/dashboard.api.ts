import { apiClient as client } from "./client"
import {
  buildDashboardSearchParams,
  type DashboardBookAttribute,
  type DashboardBookAttributeValue,
  type DashboardFilters,
} from "@/lib/dashboard-filters"

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

export type SalesComparisonDimension = "canalVenda" | "formaPagamento"

export interface SalesComparisonFilters extends DashboardFilters {
  dimension: SalesComparisonDimension
  groupIds?: number[]
}

export interface SalesComparisonData {
  date: string
  groupId: number
  groupLabel: string
  totalSales: number
  netProfit: number
}

export interface BookSalesData {
  bookId: number
  bookName: string
  quantitySold: number
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
  getKPIs: async (filters?: DashboardFilters) => {
    const { data } = await client.get<DashboardKPIs>("/dashboard/kpis", {
      params: buildDashboardSearchParams(filters),
    })
    return data
  },
  getSalesTrend: async (filters?: DashboardFilters) => {
    const { data } = await client.get<SalesTrend[]>("/dashboard/sales-trend", {
      params: buildDashboardSearchParams(filters),
    })
    return data
  },
  getSalesComparison: async (filters: SalesComparisonFilters) => {
    const params = buildDashboardSearchParams(filters)
    params.set("dimension", filters.dimension)
    filters.groupIds
      ?.filter((value) => Number.isInteger(value) && value > 0)
      .forEach((value) => params.append("groupIds", String(value)))

    const { data } = await client.get<SalesComparisonData[]>(
      "/dashboard/sales-comparison",
      { params },
    )
    return data
  },
  getTopBooks: async (filters?: DashboardFilters) => {
    const { data } = await client.get<BookSalesData[]>("/dashboard/top-books", {
      params: buildDashboardSearchParams(filters),
    })
    return data
  },
  getRecentTransactions: async (filters?: DashboardFilters) => {
    const { data } = await client.get<RecentTransaction[]>(
      "/dashboard/recent-transactions",
      {
        params: buildDashboardSearchParams(filters),
      }
    )
    return data
  },
  getBookAttributeValues: async (attribute: DashboardBookAttribute) => {
    const { data } = await client.get<DashboardBookAttributeValue[]>(
      "/dashboard/book-attribute-values",
      {
        params: { attribute },
      }
    )
    return data
  },
}
