"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card"
import { cn, formatCurrency } from "@/lib/utils"

interface BookSalesData {
  bookId: number
  bookName: string
  quantitySold: number
  totalSales: number
  netProfit: number
}

interface TopBooksChartProps {
  data: BookSalesData[]
  className?: string
}

interface BookSalesChartData extends BookSalesData {
  profitSegment: number
  incomeRemainder: number
}

const PROFIT_COLOR = "#059669"
const INCOME_COLOR = "#7C4DFF"

function formatBookName(name: string) {
  return name.length > 24 ? `${name.slice(0, 24)}...` : name
}

export function TopBooksChart({ data, className }: TopBooksChartProps) {
  const chartData: BookSalesChartData[] = data.map((entry) => {
    const profitSegment = Math.max(entry.netProfit, 0)

    return {
      ...entry,
      profitSegment,
      incomeRemainder: Math.max(entry.totalSales - profitSegment, 0),
    }
  })

  return (
    <Card className={cn("bg-card border-none shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
          Livros com Maior Faturamento
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-[360px] w-full flex-col pt-2">
        <div className="min-h-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 8, right: 16, bottom: 8, left: 12 }}
              barCategoryGap={12}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
              <XAxis
                type="number"
                tickFormatter={(value) => formatCurrency(Number(value))}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="bookName"
                width={112}
                tickFormatter={formatBookName}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const row = payload[0].payload as BookSalesChartData

                    return (
                      <div className="rounded-lg border border-border bg-popover/90 p-3 shadow-xl backdrop-blur-md">
                        <p className="mb-1 text-xs font-semibold text-popover-foreground uppercase">
                          {row.bookName}
                        </p>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-xs text-muted-foreground">Unidades:</span>
                            <span className="text-xs font-mono font-bold">
                              {row.quantitySold}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-xs text-muted-foreground">Faturamento:</span>
                            <span className="text-xs font-mono font-bold text-[#7C4DFF]">
                              {formatCurrency(row.totalSales)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-xs text-muted-foreground">Lucro líquido:</span>
                            <span className="text-xs font-mono font-bold text-emerald-500">
                              {formatCurrency(row.netProfit)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
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
                name="Faturamento"
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
        <div className="mt-3 grid grid-cols-1 gap-2">
          {data.map((entry) => (
            <div key={entry.bookId} className="flex min-w-0 items-center gap-2">
              <span className="truncate text-xs text-muted-foreground">{entry.bookName}</span>
              <span className="ml-auto shrink-0 text-xs font-mono font-medium">
                {entry.quantitySold} un.
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
