"use client"

import { Button } from "@/components/ui/button"
import { Check, Rocket, Link2 } from "lucide-react"
import { DashboardMockup } from "@/components/dashboard-mockup"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                Controlá el cash flow de tu PyME en tiempo real
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Conectá Mercado Pago y dejá que la IA clasifique tus movimientos automáticamente
              </p>
            </div>

            {/* Feature List */}
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center">
                  <Check className="w-3 h-3 text-success" />
                </div>
                <span className="text-foreground">Proyecciones de 30 días</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center">
                  <Check className="w-3 h-3 text-success" />
                </div>
                <span className="text-foreground">Alertas inteligentes</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center">
                  <Check className="w-3 h-3 text-success" />
                </div>
                <span className="text-foreground">Sin setup complicado</span>
              </li>
            </ul>

            {/* Social Proof */}
            <p className="text-sm text-muted-foreground">
              Más de <span className="font-semibold text-foreground">500 PyMEs</span> confían en PULSO
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-success hover:bg-success/90 text-success-foreground h-14 px-8 text-lg font-semibold"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Empezar Gratis - 14 días
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg border-primary text-primary hover:bg-primary/5 bg-transparent"
              >
                <Link2 className="w-5 h-5 mr-2" />
                Conectar con Mercado Pago
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">No requiere tarjeta de crédito</p>
          </div>

          {/* Right - Dashboard Mockup */}
          <div className="relative lg:pl-8">
            <div className="relative z-10 rounded-xl shadow-2xl overflow-hidden border border-border bg-card">
              <DashboardMockup />
            </div>
            {/* Background decoration */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 to-success/5 rounded-2xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  )
}
