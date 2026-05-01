import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card"
import { cn, formatCurrency, formatPercent } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface KPICardProps {
  title: string
  value: number
  icon: LucideIcon
  type?: "currency" | "percent" | "number"
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  className?: string
}

export function KPICard({
  title,
  value,
  icon: Icon,
  type = "number",
  trend,
  className,
}: KPICardProps) {
  const formattedValue =
    type === "currency"
      ? formatCurrency(value)
      : type === "percent"
      ? formatPercent(value)
      : value.toLocaleString("pt-BR")

  return (
    <Card className={cn("relative overflow-hidden border-none bg-card shadow-sm transition-all hover:bg-accent", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <Icon size={18} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight text-foreground">
          {formattedValue}
        </div>
        {trend && (
          <p
            className={cn(
              "mt-1 text-xs font-medium",
              trend.isPositive ? "text-emerald-500" : "text-rose-500"
            )}
          >
            {trend.isPositive ? "+" : ""}
            {trend.value}% <span className="text-muted-foreground">{trend.label}</span>
          </p>
        )}
      </CardContent>
      {/* Decorative glass effect - following Luminous Noir nuance */}
      <div className="absolute -right-4 -top-4 -z-0 h-24 w-24 rounded-full bg-primary/5 blur-3xl" />
    </Card>
  )
}
