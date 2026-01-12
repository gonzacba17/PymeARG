"use client"

import { useEffect, useRef, useState } from "react"

const painPoints = [
  {
    emoji: "😰",
    title: '"No sé cuánto cash tendré el mes que viene"',
    description: "Vivir en la incertidumbre financiera es agotador",
  },
  {
    emoji: "📊",
    title: '"Pierdo horas en Excel clasificando movimientos"',
    description: "Tiempo que podrías dedicar a tu negocio",
  },
  {
    emoji: "💸",
    title: '"Me entero tarde que me quedé sin plata"',
    description: "Las sorpresas financieras pueden ser devastadoras",
  },
]

export function PainPoints() {
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
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12 text-balance">
          ¿Te suena familiar?
        </h2>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {painPoints.map((point, index) => (
            <div
              key={index}
              className={`bg-card rounded-xl p-6 md:p-8 shadow-sm border border-border hover:shadow-md transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <span className="text-5xl mb-4 block">{point.emoji}</span>
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">{point.title}</h3>
              <p className="text-muted-foreground">{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
