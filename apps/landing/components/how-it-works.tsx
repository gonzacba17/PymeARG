"use client"

import { useEffect, useRef, useState } from "react"
import { Link2, Bot, BarChart3, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const steps = [
  {
    number: "1",
    icon: Link2,
    title: "Conectás Mercado Pago",
    description: "Sincronización automática de todas tus transacciones",
  },
  {
    number: "2",
    icon: Bot,
    title: "IA Clasifica",
    description: "Categorías inteligentes sin trabajo manual",
  },
  {
    number: "3",
    icon: BarChart3,
    title: "Tomás decisiones",
    description: "Dashboard en tiempo real con proyecciones claras",
  },
]

export function HowItWorks() {
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
    <section ref={sectionRef} className="bg-muted/50 py-16 md:py-24">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4 text-balance">
          Empezá en 3 minutos
        </h2>
        <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto">
          Sin configuraciones complicadas, sin integraciones técnicas
        </p>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection Lines - Desktop only */}
          <div className="hidden md:block absolute top-16 left-1/3 w-1/3 h-0.5 bg-border">
            <ArrowRight className="absolute -right-3 -top-2.5 w-6 h-6 text-muted-foreground" />
          </div>
          <div className="hidden md:block absolute top-16 right-1/3 w-1/3 h-0.5 bg-border">
            <ArrowRight className="absolute -right-3 -top-2.5 w-6 h-6 text-muted-foreground" />
          </div>

          {steps.map((step, index) => (
            <div
              key={index}
              className={`text-center transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center">
                  {step.number}
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            size="lg"
            className="bg-success hover:bg-success/90 text-success-foreground h-14 px-8 text-lg font-semibold"
          >
            Probar Ahora
          </Button>
        </div>
      </div>
    </section>
  )
}
