import { Card, CardContent } from "../ui/card"
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "../../lib/utils"

function KPICard({ title, value, change, changeLabel, type }) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0

  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p
              className={cn(
                "text-2xl font-semibold tracking-tight font-mono",
                type === "income" && "text-success",
                type === "expense" && "text-destructive",
              )}
            >
              {value}
            </p>
          </div>
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              type === "neutral" && "bg-secondary",
              type === "income" && "bg-success/10",
              type === "expense" && "bg-destructive/10",
            )}
          >
            {type === "neutral" && <Wallet className="w-5 h-5 text-muted-foreground" />}
            {type === "income" && <TrendingUp className="w-5 h-5 text-success" />}
            {type === "expense" && <TrendingDown className="w-5 h-5 text-destructive" />}
          </div>
        </div>

        {change !== undefined && (
          <div className="mt-3 flex items-center gap-1.5">
            {isPositive && <ArrowUpRight className="w-4 h-4 text-success" />}
            {isNegative && <ArrowDownRight className="w-4 h-4 text-destructive" />}
            <span className={cn("text-sm font-medium", isPositive && "text-success", isNegative && "text-destructive")}>
              {isPositive ? "+" : ""}
              {change}%
            </span>
            {changeLabel && <span className="text-sm text-muted-foreground">{changeLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function KPICards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <KPICard title="Saldo Actual" value="$2,847,350" type="neutral" />
      <KPICard title="Ingresos del Mes" value="$1,234,500" change={12.5} changeLabel="vs mes anterior" type="income" />
      <KPICard title="Egresos del Mes" value="$876,200" change={-3.2} changeLabel="vs mes anterior" type="expense" />
    </div>
  )
}
