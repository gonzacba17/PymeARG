"use client"

import { useEffect, useRef, useState } from "react"
import { BarChart3, Bell, Bot } from "lucide-react"

const features = [
  {
    icon: BarChart3,
    title: "Proyecciones de Cash Flow",
    description:
      "Sabé exactamente cuánto vas a tener en 7, 15 o 30 días. 3 escenarios (optimista, realista, pesimista) basados en tu historial real.",
    mockupType: "chart",
  },
  {
    icon: Bell,
    title: "Alertas Inteligentes",
    description: "Te avisamos antes de que sea tarde: cash bajo, gastos inusuales, vencimientos importantes.",
    mockupType: "alerts",
  },
  {
    icon: Bot,
    title: "Clasificación Automática con IA",
    description: "Olvidate de categorizar manualmente. La IA aprende de tus movimientos y clasifica todo por vos.",
    mockupType: "ai",
  },
]

function FeatureMockup({ type }: { type: string }) {
  if (type === "chart") {
    return (
      <div className="bg-card rounded-xl p-4 border border-border shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-foreground">Proyección de Cash Flow</p>
          <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">En vivo</span>
        </div>
        <div className="h-40 flex items-end gap-2">
          {[30, 45, 35, 55, 50, 65, 60, 75, 70, 85, 80, 90].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-primary/80 rounded-t hover:bg-primary transition-colors"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Hoy</span>
          <span>+30 días</span>
        </div>
      </div>
    )
  }

  if (type === "alerts") {
    return (
      <div className="bg-card rounded-xl p-4 border border-border shadow-lg space-y-3">
        <p className="text-sm font-medium text-foreground">Alertas Activas</p>
        <div className="bg-warning/10 border-l-4 border-warning p-3 rounded-r-lg">
          <p className="text-sm font-medium text-foreground">⚠️ Cash bajo proyectado</p>
          <p className="text-xs text-muted-foreground">En 12 días el saldo podría ser menor a $50.000</p>
        </div>
        <div className="bg-primary/10 border-l-4 border-primary p-3 rounded-r-lg">
          <p className="text-sm font-medium text-foreground">📅 Vencimiento próximo</p>
          <p className="text-xs text-muted-foreground">Alquiler - $85.000 - vence en 5 días</p>
        </div>
        <div className="bg-success/10 border-l-4 border-success p-3 rounded-r-lg">
          <p className="text-sm font-medium text-foreground">✅ Ingreso esperado</p>
          <p className="text-xs text-muted-foreground">Cobro cliente ABC - $120.000</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-border shadow-lg">
      <p className="text-sm font-medium text-foreground mb-4">Clasificación IA</p>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
          <span className="text-sm text-foreground">Venta mostrador - MP</span>
          <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">Ventas</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
          <span className="text-sm text-foreground">Transferencia EDESUR</span>
          <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded-full">Servicios</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
          <span className="text-sm text-foreground">Pago proveedor café</span>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Proveedores</span>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Bot className="w-4 h-4" />
        <span>Clasificado automáticamente con 98% de precisión</span>
      </div>
    </div>
  )
}

export function Solution() {
  const [visibleItems, setVisibleItems] = useState<number[]>([])
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-index"))
          if (entry.isIntersecting && !visibleItems.includes(index)) {
            setVisibleItems((prev) => [...prev, index])
          }
        })
      },
      { threshold: 0.3 },
    )

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [visibleItems])

  return (
    <section id="funciones" className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4 text-balance">
          PULSO te da el control que necesitás
        </h2>
        <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
          Todo lo que necesitás para tomar mejores decisiones financieras, sin complicaciones
        </p>

        <div className="space-y-24">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={(el) => {
                itemRefs.current[index] = el
              }}
              data-index={index}
              className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center transition-all duration-700 ${
                visibleItems.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
            >
              <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{feature.title}</h3>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
              <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                <FeatureMockup type={feature.mockupType} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
