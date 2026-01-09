import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Sparkles, ArrowUpRight } from "lucide-react"
import { cn } from "../../lib/utils"

const transactions = [
  {
    id: "1",
    description: "Mercado Pago - Venta Online",
    category: "Ventas",
    amount: 45000,
    type: "income",
    date: "Hoy",
    status: "confirmed",
  },
  {
    id: "2",
    description: "AWS Services",
    category: "Infraestructura",
    amount: -12500,
    type: "expense",
    date: "Hoy",
    isAIClassified: true,
    status: "confirmed",
  },
  {
    id: "3",
    description: "Transferencia entrante",
    category: "Por clasificar",
    amount: 180000,
    type: "income",
    date: "Ayer",
    status: "pending",
  },
  {
    id: "4",
    description: "Spotify Business",
    category: "Suscripciones",
    amount: -2500,
    type: "expense",
    date: "Ayer",
    isAIClassified: true,
    status: "confirmed",
  },
  {
    id: "5",
    description: "Pago Cliente - Factura #234",
    category: "Servicios",
    amount: 350000,
    type: "income",
    date: "2 días",
    status: "confirmed",
  },
]

const formatCurrency = (amount) => {
  const absAmount = Math.abs(amount)
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absAmount)
}

export function RecentTransactions() {
  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Movimientos Recientes</CardTitle>
        <a
          href="#" 
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          Ver todos
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                  {tx.status === "pending" && (
                    <Badge variant="outline" className="text-xs shrink-0">
                      Pendiente
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      tx.category === "Por clasificar" && "bg-warning/10 text-warning-foreground border-warning/30",
                    )}
                  >
                    {tx.category}
                  </Badge>
                  {tx.isAIClassified && <Sparkles className="w-3 h-3 text-ai ai-sparkle" />}
                  <span className="text-xs text-muted-foreground">{tx.date}</span>
                </div>
              </div>
              <p
                className={cn(
                  "text-sm font-mono font-medium tabular-nums ml-4",
                  tx.type === "income" ? "text-success" : "text-destructive",
                )}
              >
                {tx.type === "income" ? "+" : "-"}
                {formatCurrency(tx.amount)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
