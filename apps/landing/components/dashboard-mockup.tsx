"use client"

import { TrendingUp, TrendingDown, Bell, ArrowUpRight, ArrowDownRight } from "lucide-react"

export function DashboardMockup() {
  return (
    <div className="bg-card p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">La Esquina Café</p>
          <h3 className="text-xl font-bold text-foreground">Dashboard</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-warning rounded-full" />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Balance Actual</p>
          <p className="text-lg font-bold text-foreground">$542.350</p>
          <div className="flex items-center gap-1 text-success text-xs">
            <TrendingUp className="w-3 h-3" />
            <span>+12%</span>
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Ingresos Mes</p>
          <p className="text-lg font-bold text-foreground">$1.234.500</p>
          <div className="flex items-center gap-1 text-success text-xs">
            <TrendingUp className="w-3 h-3" />
            <span>+8%</span>
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Gastos Mes</p>
          <p className="text-lg font-bold text-foreground">$692.150</p>
          <div className="flex items-center gap-1 text-destructive text-xs">
            <TrendingDown className="w-3 h-3" />
            <span>+3%</span>
          </div>
        </div>
      </div>

      {/* Cash Flow Chart */}
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-foreground">Proyección 30 días</p>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-muted-foreground">Optimista</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">Realista</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-warning" />
              <span className="text-muted-foreground">Pesimista</span>
            </div>
          </div>
        </div>
        {/* Simple Chart Visualization */}
        <div className="h-32 flex items-end gap-1">
          {[40, 55, 45, 60, 50, 70, 65, 80, 75, 85, 90, 95].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col gap-0.5">
              <div
                className="bg-success/60 rounded-t-sm transition-all duration-300"
                style={{ height: `${height + 10}%` }}
              />
              <div className="bg-primary rounded-t-sm transition-all duration-300" style={{ height: `${height}%` }} />
              <div
                className="bg-warning/60 rounded-t-sm transition-all duration-300"
                style={{ height: `${height - 15}%` }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Últimos movimientos</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Venta mostrador</p>
                <p className="text-xs text-muted-foreground">Mercado Pago</p>
              </div>
            </div>
            <p className="text-sm font-medium text-success">+$12.500</p>
          </div>
          <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Alquiler local</p>
                <p className="text-xs text-muted-foreground">Transferencia</p>
              </div>
            </div>
            <p className="text-sm font-medium text-destructive">-$85.000</p>
          </div>
        </div>
      </div>

      {/* Alert */}
      <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 flex items-start gap-3">
        <Bell className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Alerta de cash flow</p>
          <p className="text-xs text-muted-foreground">El saldo proyectado en 15 días podría ser bajo</p>
        </div>
      </div>
    </div>
  )
}
