"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/atoms/button"
import { Checkbox } from "@/components/atoms/checkbox"
import { Label } from "@/components/atoms/label"
import { KPICard } from "@/components/molecules/dashboard/kpi-card"
import { DateField } from "@/components/molecules/date-field"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/molecules/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/molecules/select"
import { RecentTransactionsTable } from "@/components/organisms/dashboard/recent-transactions-table"
import { SalesTrendChart } from "@/components/organisms/dashboard/sales-trend-chart"
import { TopCategoriesChart } from "@/components/organisms/dashboard/top-categories-chart"
import {
  DASHBOARD_BOOK_ATTRIBUTE_OPTIONS,
  getDashboardBookAttributeLabel,
  getDefaultDashboardDateRange,
  type DashboardBookAttribute,
  type DashboardBookAttributeValue,
  type DashboardFilters,
} from "@/lib/dashboard-filters"
import { dashboardApi } from "@/lib/api/dashboard.api"
import {
  CalendarRange,
  DollarSign,
  Filter,
  Loader2,
  Percent,
  RotateCcw,
  ShoppingCart,
  TrendingUp,
} from "lucide-react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

interface DashboardValuePickerProps {
  label: string
  options: DashboardBookAttributeValue[]
  selectedValues: string[]
  disabled: boolean
  isLoading: boolean
  onChange: (values: string[]) => void
}

function DashboardValuePicker({
  label,
  options,
  selectedValues,
  disabled,
  isLoading,
  onChange,
}: DashboardValuePickerProps) {
  const selectedLabel =
    selectedValues.length > 0
      ? `${selectedValues.length} selecionado${selectedValues.length > 1 ? "s" : ""}`
      : "Todos"

  const toggleValue = (value: string) => {
    onChange(
      selectedValues.includes(value)
        ? selectedValues.filter((item) => item !== value)
        : [...selectedValues, value],
    )
  }

  return (
    <div className="flex min-w-[14rem] flex-1 flex-col gap-1.5">
      <Label className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </Label>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full justify-between font-normal"
              disabled={disabled}
            >
              <span className="truncate">
                {disabled
                  ? "Selecione um atributo"
                  : isLoading
                    ? "Carregando..."
                    : selectedLabel}
              </span>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </Button>
          }
        />
        <PopoverContent align="start" className="w-64 p-2">
          <div className="max-h-64 overflow-y-auto">
            {options.map((option) => (
              <Label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-colors hover:bg-muted"
              >
                <Checkbox
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={() => toggleValue(option.value)}
                />
                <span className="truncate text-sm">{option.label}</span>
              </Label>
            ))}
            {!isLoading && options.length === 0 ? (
              <p className="px-2 py-2 text-sm text-muted-foreground">
                Nenhum valor encontrado.
              </p>
            ) : null}
          </div>
          {selectedValues.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 h-8 w-full"
              onClick={() => onChange([])}
            >
              Limpar valores
            </Button>
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default function DashboardPage() {
  const defaultDateRange = useMemo(() => getDefaultDashboardDateRange(), [])
  const [startDate, setStartDate] = useState(defaultDateRange.startDate)
  const [endDate, setEndDate] = useState(defaultDateRange.endDate)
  const [bookAttribute, setBookAttribute] = useState<DashboardBookAttribute | null>(null)
  const [bookAttributeValues, setBookAttributeValues] = useState<string[]>([])

  const filters = useMemo<DashboardFilters>(
    () => ({
      startDate,
      endDate,
      bookAttribute:
        bookAttribute && bookAttributeValues.length > 0
          ? bookAttribute
          : undefined,
      bookAttributeValues:
        bookAttribute && bookAttributeValues.length > 0
          ? bookAttributeValues
          : undefined,
    }),
    [bookAttribute, bookAttributeValues, endDate, startDate],
  )

  const { data: attributeValues = [], isFetching: isLoadingAttributeValues } = useQuery({
    queryKey: ["dashboard", "book-attribute-values", bookAttribute],
    queryFn: () => dashboardApi.getBookAttributeValues(bookAttribute as DashboardBookAttribute),
    enabled: Boolean(bookAttribute),
  })

  const { data: kpis, isLoading: isLoadingKPIs } = useQuery({
    queryKey: ["dashboard", "kpis", filters],
    queryFn: () => dashboardApi.getKPIs(filters),
    placeholderData: keepPreviousData,
  })

  const { data: salesTrend, isLoading: isLoadingTrend } = useQuery({
    queryKey: ["dashboard", "sales-trend", filters],
    queryFn: () => dashboardApi.getSalesTrend(filters),
    placeholderData: keepPreviousData,
  })

  const { data: topCategories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["dashboard", "top-categories", filters],
    queryFn: () => dashboardApi.getTopCategories(filters),
    placeholderData: keepPreviousData,
  })

  const { data: recentTransactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["dashboard", "recent-transactions", filters],
    queryFn: () => dashboardApi.getRecentTransactions(filters),
    placeholderData: keepPreviousData,
  })

  const isLoading = isLoadingKPIs || isLoadingTrend || isLoadingCategories || isLoadingTransactions

  const handleStartDateChange = (value: string) => {
    setStartDate(value)
    if (value && endDate && value > endDate) {
      setEndDate(value)
    }
  }

  const handleEndDateChange = (value: string) => {
    setEndDate(value)
    if (value && startDate && value < startDate) {
      setStartDate(value)
    }
  }

  const handleBookAttributeChange = (value: string | null) => {
    setBookAttribute(value && value !== "none" ? (value as DashboardBookAttribute) : null)
    setBookAttributeValues([])
  }

  const handleResetFilters = () => {
    const range = getDefaultDashboardDateRange()
    setStartDate(range.startDate)
    setEndDate(range.endDate)
    setBookAttribute(null)
    setBookAttributeValues([])
  }

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

      <section className="relative overflow-hidden rounded-lg border border-border/60 bg-card/80 p-4 shadow-sm">
        <div className="absolute left-0 top-0 h-full w-1 bg-primary" aria-hidden="true" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex min-w-[18rem] flex-col gap-1.5">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              Período
            </Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] font-medium uppercase text-muted-foreground/80">
                  Início
                </Label>
                <DateField
                  id="dashboard-start-date"
                  value={startDate}
                  max={endDate}
                  onChange={(event) => handleStartDateChange(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] font-medium uppercase text-muted-foreground/80">
                  Fim
                </Label>
                <DateField
                  id="dashboard-end-date"
                  value={endDate}
                  min={startDate}
                  onChange={(event) => handleEndDateChange(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex min-w-[13rem] flex-1 flex-col gap-1.5">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              Atributo
            </Label>
            <Select
              value={bookAttribute ?? "none"}
              onValueChange={handleBookAttributeChange}
            >
              <SelectTrigger className="h-11 w-full bg-background/50">
                <SelectValue placeholder="Atributo">
                  {getDashboardBookAttributeLabel(bookAttribute)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="none">Sem atributo</SelectItem>
                {DASHBOARD_BOOK_ATTRIBUTE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DashboardValuePicker
            label="Valores"
            options={attributeValues}
            selectedValues={bookAttributeValues}
            disabled={!bookAttribute}
            isLoading={isLoadingAttributeValues}
            onChange={setBookAttributeValues}
          />

          <Button
            type="button"
            variant="outline"
            className="h-11 shrink-0"
            onClick={handleResetFilters}
          >
            <RotateCcw className="h-4 w-4" />
            Limpar
          </Button>

          <div
            className="hidden items-center gap-2 rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground xl:flex"
            aria-hidden="true"
          >
            <CalendarRange className="h-4 w-4 text-primary" />
            {startDate} até {endDate}
          </div>
        </div>
      </section>

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
