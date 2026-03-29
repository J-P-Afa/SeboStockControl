"use client"

import { KPICard } from "@/components/molecules/dashboard/kpi-card"
import { RecentTransactionsTable } from "@/components/organisms/dashboard/recent-transactions-table"
import { SalesTrendChart } from "@/components/organisms/dashboard/sales-trend-chart"
import { TopCategoriesChart } from "@/components/organisms/dashboard/top-categories-chart"
import { dashboardApi } from "@/lib/api/dashboard.api"
import { DollarSign, TrendingUp, Percent, ShoppingCart, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

export default function DashboardPage() {
  const { data: kpis, isLoading: isLoadingKPIs } = useQuery({
    queryKey: ["dashboard", "kpis"],
    queryFn: dashboardApi.getKPIs,
  })

  const { data: salesTrend, isLoading: isLoadingTrend } = useQuery({
    queryKey: ["dashboard", "sales-trend"],
    queryFn: dashboardApi.getSalesTrend,
  })

  const { data: topCategories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["dashboard", "top-categories"],
    queryFn: dashboardApi.getTopCategories,
  })

  const { data: recentTransactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["dashboard", "recent-transactions"],
    queryFn: dashboardApi.getRecentTransactions,
  })

  const isLoading = isLoadingKPIs || isLoadingTrend || isLoadingCategories || isLoadingTransactions

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Visão geral de vendas e performance financeira do seu sebo.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Vendas Totais"
          value={kpis?.totalVendas ?? 0}
          icon={ShoppingCart}
          type="currency"
          trend={{ value: 12, label: "desde ontem", isPositive: true }}
        />
        <KPICard
          title="Lucro Líquido"
          value={kpis?.lucroLiquido ?? 0}
          icon={DollarSign}
          type="currency"
          trend={{ value: 8.5, label: "este mês", isPositive: true }}
        />
        <KPICard
          title="Margem de Lucro"
          value={kpis?.margemLucro ?? 0}
          icon={Percent}
          type="percent"
        />
        <KPICard
          title="Ticket Médio"
          value={kpis?.ticketMedio ?? 0}
          icon={TrendingUp}
          type="currency"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        <SalesTrendChart data={salesTrend ?? []} className="lg:col-span-4" />
        <TopCategoriesChart data={topCategories ?? []} className="lg:col-span-3" />
      </div>

      {/* Recent Transactions */}
      <RecentTransactionsTable transactions={recentTransactions ?? []} />
    </div>
  )
}

