import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { AlertTriangle, TrendingDown, Calendar, Sparkles } from "lucide-react"
import { cn } from "../../lib/utils"
import { Badge } from "../ui/badge"

const alerts = [
  {
    id: "1",
    type: "warning",
    title: "Vence Monotributo",
    description: "El pago mensual vence en 3 días",
    date: "12 Ene",
  },
  {
    id: "2",
    type: "critical",
    title: "Saldo bajo proyectado",
    description: "Podrías quedarte sin fondos el viernes",
    isAI: true,
  },
  {
    id: "3",
    type: "info",
    title: "Pago recurrente detectado",
    description: "AWS $45,000 - se repite cada mes",
    isAI: true,
  },
]

function AlertCard({ alert }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border",
        alert.type === "critical" && "bg-destructive/5 border-destructive/20",
        alert.type === "warning" && "bg-warning/10 border-warning/30",
        alert.type === "info" && "bg-ai/5 border-ai/20",
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          alert.type === "critical" && "bg-destructive/10",
          alert.type === "warning" && "bg-warning/20",
          alert.type === "info" && "bg-ai/10",
        )}
      >
        {alert.type === "critical" && <TrendingDown className="w-4 h-4 text-destructive" />}
        {alert.type === "warning" && <AlertTriangle className="w-4 h-4 text-warning-foreground" />}
        {alert.type === "info" && <Calendar className="w-4 h-4 text-ai" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">{alert.title}</p>
          {alert.isAI && <Sparkles className="w-3.5 h-3.5 text-ai ai-sparkle shrink-0" />}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
        {alert.date && (
          <Badge variant="secondary" className="mt-2 text-xs">
            {alert.date}
          </Badge>
        )}
      </div>
    </div>
  )
}

export function SmartAlerts() {
  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          Alertas Inteligentes
          <Badge variant="secondary" className="text-xs font-normal">
            {alerts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </CardContent>
    </Card>
  )
}
