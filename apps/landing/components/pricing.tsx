"use client"

import { useEffect, useRef, useState } from "react"
import { Check, X, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Gratis",
    subtitle: "Para empezar",
    price: "GRATIS",
    features: [
      { text: "Hasta 100 movimientos", included: true },
      { text: "1 cuenta de MP", included: true },
      { text: "Proyecciones 7 días", included: true },
      { text: "Alertas básicas", included: true },
      { text: "Sin soporte", included: false },
    ],
    cta: "Empezar Gratis",
    highlighted: false,
  },
  {
    name: "Pro",
    subtitle: "Para crecer",
    price: "$9.900",
    period: "/mes",
    badge: "Más Popular",
    features: [
      { text: "Movimientos ilimitados", included: true },
      { text: "3 cuentas", included: true },
      { text: "Proyecciones 90 días", included: true },
      { text: "Alertas personalizadas", included: true },
      { text: "Soporte prioritario", included: true },
    ],
    cta: "Probar 14 días gratis",
    highlighted: true,
  },
]

export function Pricing() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="pricing" className="bg-muted/50 py-16 md:py-24">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4 text-balance">
          Precios simples y transparentes
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
          Sin sorpresas, sin costos ocultos. Elegí el plan que mejor se adapte a tu negocio
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-card rounded-2xl p-8 border-2 transition-all duration-500 ${
                plan.highlighted ? "border-success shadow-xl scale-105" : "border-border"
              } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-success text-success-foreground text-sm font-semibold px-4 py-1 rounded-full">
                    🔥 {plan.badge}
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-muted-foreground">{plan.subtitle}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    {feature.included ? (
                      <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-success" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <X className="w-3 h-3 text-muted-foreground" />
                      </div>
                    )}
                    <span className={feature.included ? "text-foreground" : "text-muted-foreground"}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className={`w-full h-14 text-lg font-semibold ${
                  plan.highlighted
                    ? "bg-success hover:bg-success/90 text-success-foreground"
                    : "bg-primary hover:bg-primary/90"
                }`}
              >
                {plan.cta}
                {plan.highlighted && " ⭐"}
              </Button>

              {/* Disclaimer */}
              <p className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" />
                {plan.highlighted ? "Cancelá cuando quieras" : "Sin tarjeta de crédito"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
