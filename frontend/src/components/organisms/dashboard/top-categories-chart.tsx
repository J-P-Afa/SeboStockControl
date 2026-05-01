"use client"

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card"
import { cn, formatCurrency } from "@/lib/utils"

interface CategoryData {
  category: string
  totalSales: number
  netProfit: number
}

interface TopCategoriesChartProps {
  data: CategoryData[]
  className?: string
}

const COLORS = ["#7C4DFF", "#00BFA5", "#3D5AFE", "#FF4081", "#FFD740"]

export function TopCategoriesChart({ data, className }: TopCategoriesChartProps) {
  return (
    <Card className={cn("bg-card border-none shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
          Categorias Mais Lucrativas
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="netProfit"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border border-border bg-popover/90 p-3 shadow-xl backdrop-blur-md">
                      <p className="mb-1 text-xs font-semibold text-popover-foreground uppercase">
                        {payload[0].name}
                      </p>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs text-muted-foreground">Lucro Líquido:</span>
                          <span className="text-xs font-mono font-bold text-emerald-500">
                            {formatCurrency(Number(payload[0].value))}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
          {data.map((entry, index) => (
            <div key={entry.category} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs text-muted-foreground truncate">{entry.category}</span>
              <span className="ml-auto text-xs font-mono font-medium">{formatCurrency(entry.netProfit)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
