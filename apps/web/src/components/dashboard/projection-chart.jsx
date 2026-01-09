import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const data = [
  { date: "1 Dic", real: 2400000, optimista: null, realista: null, pesimista: null },
  { date: "8 Dic", real: 2650000, optimista: null, realista: null, pesimista: null },
  { date: "15 Dic", real: 2380000, optimista: null, realista: null, pesimista: null },
  { date: "22 Dic", real: 2720000, optimista: null, realista: null, pesimista: null },
  { date: "29 Dic", real: 2847350, optimista: null, realista: null, pesimista: null },
  { date: "Hoy", real: 2847350, optimista: 2847350, realista: 2847350, pesimista: 2847350 },
  { date: "5 Ene", real: null, optimista: 3100000, realista: 2900000, pesimista: 2600000 },
  { date: "12 Ene", real: null, optimista: 3400000, realista: 2950000, pesimista: 2400000 },
  { date: "19 Ene", real: null, optimista: 3650000, realista: 3000000, pesimista: 2200000 },
  { date: "26 Ene", real: null, optimista: 3900000, realista: 3100000, pesimista: 2050000 },
]

const formatCurrency = (value) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  return `$${(value / 1000).toFixed(0)}K`
}

export function ProjectionChart() {
  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          La Curva de la Verdad
          <span className="text-xs font-normal text-muted-foreground">— Proyección 30 días</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
                width={60}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} iconType="line" />
              <Line
                type="monotone"
                dataKey="real"
                name="Real"
                stroke="hsl(var(--foreground))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--foreground))", strokeWidth: 0, r: 3 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="optimista"
                name="Optimista"
                stroke="hsl(var(--success))"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="realista"
                name="Realista"
                stroke="hsl(var(--ai))"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="pesimista"
                name="Pesimista"
                stroke="hsl(var(--destructive))"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
