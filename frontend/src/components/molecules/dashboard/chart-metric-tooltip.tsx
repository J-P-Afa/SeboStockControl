import { formatCurrency, formatPercent } from "@/lib/utils"

interface ChartMetricTooltipProps {
  title?: string
  rows: Array<{
    label: string
    totalSales: number
    netProfit: number
    color?: string
    quantity?: number
  }>
}

export function calculateNetMarginPercent(totalSales: number, netProfit: number) {
  return totalSales > 0 ? (netProfit / totalSales) * 100 : 0
}

export function ChartMetricTooltip({ title, rows }: ChartMetricTooltipProps) {
  return (
    <div className="min-w-56 rounded-lg border border-border bg-popover/90 p-3 shadow-xl backdrop-blur-md">
      {title ? (
        <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
          {title}
        </p>
      ) : null}
      <div className="flex flex-col gap-2">
        {rows.map((row) => {
          const margin = calculateNetMarginPercent(row.totalSales, row.netProfit)

          return (
            <div
              key={row.label}
              className="border-b border-border/60 pb-2 last:border-b-0 last:pb-0"
            >
              <div className="mb-1 flex min-w-0 items-center gap-2">
                {row.color ? (
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: row.color }}
                  />
                ) : null}
                <span className="truncate text-xs font-semibold text-popover-foreground">
                  {row.label}
                </span>
                {typeof row.quantity === "number" ? (
                  <span className="ml-auto shrink-0 font-mono text-[0.7rem] text-muted-foreground">
                    {row.quantity} un.
                  </span>
                ) : null}
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
                <span className="text-muted-foreground">Faturamento:</span>
                <span className="text-right font-mono font-bold text-popover-foreground">
                  {formatCurrency(row.totalSales)}
                </span>
                <span className="text-muted-foreground">Lucro líquido:</span>
                <span className="text-right font-mono font-bold text-emerald-500">
                  {formatCurrency(row.netProfit)}
                </span>
                <span className="text-muted-foreground">Margem líquida:</span>
                <span className="text-right font-mono font-bold text-secondary-foreground dark:text-secondary">
                  {formatPercent(margin)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
