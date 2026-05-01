"use client"

import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { BarChart3, Filter, LineChartIcon, RotateCcw } from "lucide-react"

import { Button } from "@/components/atoms/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card"
import { Checkbox } from "@/components/atoms/checkbox"
import { Label } from "@/components/atoms/label"
import { DateField } from "@/components/molecules/date-field"
import {
  ChartMetricTooltip,
  calculateNetMarginPercent,
} from "@/components/molecules/dashboard/chart-metric-tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/molecules/popover"
import { getDefaultDashboardDateRange } from "@/lib/dashboard-filters"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { useSalesComparison } from "@/hooks/use-sales-comparison"
import type {
  SalesComparisonData,
  SalesComparisonDimension,
} from "@/lib/api/dashboard.api"

interface SalesComparisonOption {
  id: number
  label: string
  isActive: boolean
}

interface SalesComparisonDashboardProps {
  title: string
  description: string
  dimension: SalesComparisonDimension
  options: SalesComparisonOption[]
  isLoadingOptions?: boolean
}

interface GroupSummary {
  groupId: number
  groupLabel: string
  totalSales: number
  netProfit: number
  profitSegment: number
  incomeRemainder: number
}

const SERIES_COLORS = [
  "#7C4DFF",
  "#00BFA5",
  "#F59E0B",
  "#EF4444",
  "#2563EB",
  "#DB2777",
  "#16A34A",
  "#9333EA",
]

const PROFIT_COLOR = "#059669"
const INCOME_COLOR = "#7C4DFF"
const MAX_COMPARED_GROUPS = 4

function formatDateLabel(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
  })
}

function buildDateRange(startDate: string, endDate: string) {
  const [startYear, startMonth, startDay] = startDate.split("-").map(Number)
  const [endYear, endMonth, endDay] = endDate.split("-").map(Number)
  const start = new Date(startYear, startMonth - 1, startDay)
  const end = new Date(endYear, endMonth - 1, endDay)
  const dates: string[] = []

  for (
    const date = new Date(start);
    date <= end;
    date.setDate(date.getDate() + 1)
  ) {
    dates.push(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
    )
  }

  return dates
}

function salesKey(groupId: number) {
  return `sales_${groupId}`
}

function profitKey(groupId: number) {
  return `profit_${groupId}`
}

function buildTrendRows(
  data: SalesComparisonData[],
  groups: SalesComparisonOption[],
  startDate: string,
  endDate: string,
) {
  const values = new Map<string, SalesComparisonData>()

  data.forEach((entry) => {
    values.set(`${entry.date}:${entry.groupId}`, entry)
  })

  return buildDateRange(startDate, endDate).map((date) => {
    const row: Record<string, string | number> = { date }

    groups.forEach((group) => {
      const value = values.get(`${date}:${group.id}`)
      row[salesKey(group.id)] = value?.totalSales ?? 0
      row[profitKey(group.id)] = value?.netProfit ?? 0
    })

    return row
  })
}

function buildGroupSummaries(
  data: SalesComparisonData[],
  groups: SalesComparisonOption[],
): GroupSummary[] {
  const summaries = new Map<number, GroupSummary>()

  groups.forEach((group) => {
    summaries.set(group.id, {
      groupId: group.id,
      groupLabel: group.label,
      totalSales: 0,
      netProfit: 0,
      profitSegment: 0,
      incomeRemainder: 0,
    })
  })

  data.forEach((entry) => {
    const summary = summaries.get(entry.groupId)
    if (!summary) return

    summary.totalSales += entry.totalSales
    summary.netProfit += entry.netProfit
  })

  return [...summaries.values()]
    .map((summary) => ({
      ...summary,
      profitSegment: Math.max(summary.netProfit, 0),
      incomeRemainder: Math.max(
        summary.totalSales - Math.max(summary.netProfit, 0),
        0,
      ),
    }))
    .sort((first, second) => second.totalSales - first.totalSales)
}

function buildTopIncomeGroupIds(
  data: SalesComparisonData[],
  groups: SalesComparisonOption[],
) {
  return buildGroupSummaries(data, groups)
    .filter((summary) => summary.totalSales > 0)
    .slice(0, MAX_COMPARED_GROUPS)
    .map((summary) => summary.groupId)
}

function ComparisonGroupPicker({
  options,
  selectedIds,
  disabled,
  onChange,
  onResetAuto,
}: {
  options: SalesComparisonOption[]
  selectedIds: number[]
  disabled?: boolean
  onChange: (values: number[]) => void
  onResetAuto: () => void
}) {
  const selectedLabel =
    selectedIds.length > 0
      ? `${selectedIds.length} selecionado${selectedIds.length > 1 ? "s" : ""}`
      : "Selecione"

  const toggleValue = (value: number) => {
    if (!selectedIds.includes(value) && selectedIds.length >= MAX_COMPARED_GROUPS) {
      return
    }

    onChange(
      selectedIds.includes(value)
        ? selectedIds.filter((item) => item !== value)
        : [...selectedIds, value],
    )
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5 sm:min-w-[16rem]">
      <Label className="text-xs font-semibold uppercase text-muted-foreground">
        Comparar
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
              <span className="truncate">{selectedLabel}</span>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </Button>
          }
        />
        <PopoverContent align="start" className="w-72 p-2">
          <div className="max-h-72 overflow-y-auto">
            {options.map((option) => (
              <Label
                key={option.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-colors hover:bg-muted has-disabled:cursor-not-allowed has-disabled:opacity-50"
              >
                <Checkbox
                  checked={selectedIds.includes(option.id)}
                  disabled={
                    !selectedIds.includes(option.id) &&
                    selectedIds.length >= MAX_COMPARED_GROUPS
                  }
                  onCheckedChange={() => toggleValue(option.id)}
                />
                <span className="truncate text-sm">{option.label}</span>
              </Label>
            ))}
          </div>
          <p className="px-2 pt-2 text-xs text-muted-foreground">
            Máximo de {MAX_COMPARED_GROUPS} categorias.
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={onResetAuto}
            >
              Top 4
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() => onChange([])}
            >
              Limpar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function SalesComparisonDashboard({
  title,
  description,
  dimension,
  options,
  isLoadingOptions = false,
}: SalesComparisonDashboardProps) {
  const defaultDateRange = useMemo(() => getDefaultDashboardDateRange(), [])
  const [startDate, setStartDate] = useState(defaultDateRange.startDate)
  const [endDate, setEndDate] = useState(defaultDateRange.endDate)
  const [manualGroupIds, setManualGroupIds] = useState<number[]>([])
  const [isManualSelection, setIsManualSelection] = useState(false)

  const activeOptions = useMemo(
    () => options.filter((option) => option.isActive),
    [options],
  )

  const queryGroupIds = useMemo(
    () =>
      isManualSelection
        ? manualGroupIds
        : activeOptions.map((option) => option.id),
    [activeOptions, isManualSelection, manualGroupIds],
  )

  const filters = useMemo(
    () => ({
      dimension,
      startDate,
      endDate,
      groupIds: queryGroupIds,
    }),
    [dimension, endDate, queryGroupIds, startDate],
  )

  const { data = [], isFetching, isError } = useSalesComparison(
    filters,
    queryGroupIds.length > 0,
  )

  const automaticGroupIds = useMemo(
    () => buildTopIncomeGroupIds(data, activeOptions),
    [activeOptions, data],
  )

  const selectedGroupIds = (
    isManualSelection ? manualGroupIds : automaticGroupIds
  ).slice(0, MAX_COMPARED_GROUPS)

  const selectedGroups = useMemo(
    () => options.filter((option) => selectedGroupIds.includes(option.id)),
    [options, selectedGroupIds],
  )

  const trendRows = useMemo(
    () => buildTrendRows(data, selectedGroups, startDate, endDate),
    [data, endDate, selectedGroups, startDate],
  )

  const summaries = useMemo(
    () => buildGroupSummaries(data, selectedGroups),
    [data, selectedGroups],
  )

  const hasDisplayedGroups = selectedGroups.length > 0

  const handleManualGroupChange = (values: number[]) => {
    setIsManualSelection(true)
    setManualGroupIds(values.slice(0, MAX_COMPARED_GROUPS))
  }

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

  const handleReset = () => {
    const range = getDefaultDashboardDateRange()
    setStartDate(range.startDate)
    setEndDate(range.endDate)
    setIsManualSelection(false)
    setManualGroupIds([])
  }

  return (
    <section aria-label={title} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          {isFetching ? "Atualizando..." : `${selectedGroupIds.length} séries`}
        </div>
      </div>

      <section className="relative overflow-hidden rounded-lg border border-border/60 bg-card/80 p-4 shadow-sm">
        <div className="absolute left-0 top-0 h-full w-1 bg-secondary" aria-hidden="true" />
        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
          <div className="flex min-w-0 flex-col gap-1.5 lg:flex-[1_1_18rem]">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              Período
            </Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] font-medium uppercase text-muted-foreground/80">
                  Início
                </Label>
                <DateField
                  id={`${dimension}-comparison-start-date`}
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
                  id={`${dimension}-comparison-end-date`}
                  value={endDate}
                  min={startDate}
                  onChange={(event) => handleEndDateChange(event.target.value)}
                />
              </div>
            </div>
          </div>

          <ComparisonGroupPicker
            options={activeOptions}
            selectedIds={selectedGroupIds}
            disabled={isLoadingOptions || activeOptions.length === 0}
            onChange={handleManualGroupChange}
            onResetAuto={() => {
              setIsManualSelection(false)
              setManualGroupIds([])
            }}
          />

          <Button
            type="button"
            variant="outline"
            className="h-11 shrink-0"
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4" />
            Redefinir
          </Button>
        </div>
      </section>

      {isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Não foi possível carregar o comparativo de vendas.
        </div>
      ) : null}

      {selectedGroupIds.length === 0 ? (
        <div className="rounded-lg border border-border/60 bg-muted/30 p-6 text-sm text-muted-foreground">
          {isManualSelection
            ? "Selecione pelo menos uma categoria para comparar."
            : "Nenhuma categoria com faturamento no período."}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-7">
          <Card className="border-none bg-card shadow-sm lg:col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
                <LineChartIcon className="h-5 w-5 text-primary" />
                Faturamento por dia
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[320px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendRows} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    tickFormatter={formatDateLabel}
                    minTickGap={30}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    tickFormatter={(value) => formatCurrency(Number(value))}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      const row = payload[0].payload as Record<string, number>

                      return (
                        <ChartMetricTooltip
                          title={
                            label
                              ? new Date(String(label)).toLocaleDateString("pt-BR", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })
                              : undefined
                          }
                          rows={selectedGroups.map((group, index) => ({
                            label: group.label,
                            totalSales: Number(row[salesKey(group.id)] ?? 0),
                            netProfit: Number(row[profitKey(group.id)] ?? 0),
                            color: SERIES_COLORS[index % SERIES_COLORS.length],
                          }))}
                        />
                      )
                    }}
                  />
                  {selectedGroups.map((group, index) => (
                    <Line
                      key={group.id}
                      type="monotone"
                      dataKey={salesKey(group.id)}
                      name={group.label}
                      stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none bg-card shadow-sm lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
                <BarChart3 className="h-5 w-5 text-secondary" />
                Faturamento e margem
              </CardTitle>
            </CardHeader>
            <CardContent className="flex min-h-[320px] w-full flex-col pt-2">
              <div className="min-h-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={summaries}
                    layout="vertical"
                    margin={{ top: 8, right: 16, bottom: 8, left: 12 }}
                    barCategoryGap={12}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      className="stroke-muted"
                    />
                    <XAxis
                      type="number"
                      tickFormatter={(value) => formatCurrency(Number(value))}
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="groupLabel"
                      width={112}
                      tickFormatter={(value) =>
                        String(value).length > 22
                          ? `${String(value).slice(0, 22)}...`
                          : String(value)
                      }
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const row = payload[0].payload as GroupSummary

                        return (
                          <ChartMetricTooltip
                            title={row.groupLabel}
                            rows={[
                              {
                                label: row.groupLabel,
                                totalSales: row.totalSales,
                                netProfit: row.netProfit,
                              },
                            ]}
                          />
                        )
                      }}
                    />
                    <Bar
                      dataKey="profitSegment"
                      name="Lucro líquido"
                      stackId="income"
                      fill={PROFIT_COLOR}
                      barSize={10}
                      radius={[4, 0, 0, 4]}
                    />
                    <Bar
                      dataKey="incomeRemainder"
                      name="Faturamento restante"
                      stackId="income"
                      fill={INCOME_COLOR}
                      barSize={10}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: PROFIT_COLOR }} />
                  Lucro líquido
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: INCOME_COLOR }} />
                  Faturamento restante
                </div>
              </div>
              {hasDisplayedGroups ? (
                <div className="mt-3 grid grid-cols-1 gap-2">
                  {summaries.map((summary) => (
                    <div key={summary.groupId} className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-xs text-muted-foreground">
                        {summary.groupLabel}
                      </span>
                      <span className="ml-auto shrink-0 font-mono text-xs font-medium">
                        {formatPercent(
                          calculateNetMarginPercent(
                            summary.totalSales,
                            summary.netProfit,
                          ),
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Nenhuma venda encontrada no período.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  )
}
