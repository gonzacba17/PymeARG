"use client"

import { useEffect, useRef, useState } from "react"
import { Shield, Check, Zap, Smartphone } from "lucide-react"

const features = [
  { icon: Shield, text: "Conexión 100% segura con OAuth" },
  { icon: Check, text: "Nunca pedimos ni guardamos tus credenciales" },
  { icon: Zap, text: "Sincronización automática cada 15 minutos" },
  { icon: Smartphone, text: "Compatible con cuentas personales y comerciales" },
]

export function MercadoPagoIntegration() {
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
    <section
      ref={sectionRef}
      className="relative bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16 md:py-24 overflow-hidden"
    >
      <div className="container mx-auto px-6">
        <div
          className={`text-center transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Logos */}
          <div className="flex items-center justify-center gap-4 md:gap-6 mb-8">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-[#009EE3] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl md:text-3xl">MP</span>
            </div>
            <span className="text-3xl">❤️</span>
            <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-2xl md:text-3xl">P</span>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Integración oficial con Mercado Pago
          </h2>
          <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
            Conexión segura y directa con la plataforma de pagos más usada de Argentina
          </p>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`flex flex-col items-center gap-3 p-4 bg-card rounded-xl border border-border transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${(index + 1) * 100}ms` }}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-foreground text-center">{feature.text}</p>
              </div>
            ))}
          </div>

          {/* OAuth Screenshot Mockup */}
          <div
            className={`max-w-sm mx-auto bg-card rounded-xl border border-border p-6 shadow-xl transition-all duration-700 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#009EE3] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">MP</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Mercado Pago</p>
                <p className="text-xs text-muted-foreground">Autorización de acceso</p>
              </div>
            </div>
            <div className="border-t border-border pt-4 space-y-3">
              <p className="text-sm text-foreground text-left">
                <strong>PULSO</strong> solicita acceso a:
              </p>
              <ul className="space-y-2 text-left">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-success" />
                  Ver tus movimientos
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-success" />
                  Leer información de tu cuenta
                </li>
              </ul>
              <div className="pt-4 flex gap-3">
                <button className="flex-1 py-2 px-4 bg-muted text-muted-foreground rounded-lg text-sm">Cancelar</button>
                <button className="flex-1 py-2 px-4 bg-[#009EE3] text-white rounded-lg text-sm font-medium">
                  Autorizar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
