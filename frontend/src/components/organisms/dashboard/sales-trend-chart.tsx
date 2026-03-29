"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card"
import { cn, formatCurrency } from "@/lib/utils"

interface SalesTrend {
  date: string
  totalSales: number
  netProfit: number
}

interface SalesTrendChartProps {
  data: SalesTrend[]
  className?: string
}

export function SalesTrendChart({ data, className }: SalesTrendChartProps) {
  return (
    <Card className={cn("bg-surface-container border-none shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold tracking-tight">
          Tendência de Vendas (Últimos 30 Dias)
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C4DFF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7C4DFF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00BFA5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00BFA5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#2c2c2c"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#666", fontSize: 12 }}
              tickFormatter={(date) =>
                new Date(date).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })
              }
              minTickGap={30}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#666", fontSize: 12 }}
              tickFormatter={(value) => `R$ ${value}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border border-neutral-800 bg-surface-container-highest p-3 shadow-xl backdrop-blur-md">
                      <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase">
                        {label ? new Date(label).toLocaleDateString("pt-BR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }) : ""}
                      </p>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-2 text-xs text-white">
                            <span className="h-2 w-2 rounded-full bg-[#7C4DFF]" />
                            Vendas
                          </span>
                          <span className="text-xs font-mono font-bold text-white">
                            {formatCurrency(Number(payload[0].value))}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-2 text-xs text-white">
                            <span className="h-2 w-2 rounded-full bg-[#00BFA5]" />
                            Lucro
                          </span>
                          <span className="text-xs font-mono font-bold text-white">
                            {formatCurrency(Number(payload[1].value))}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey="totalSales"
              stroke="#7C4DFF"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSales)"
              name="Vendas"
            />
            <Area
              type="monotone"
              dataKey="netProfit"
              stroke="#00BFA5"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorProfit)"
              name="Lucro"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
