"use client"

import { useEffect, useRef, useState } from "react"
import { Star } from "lucide-react"

const testimonials = [
  {
    quote: "Antes perdía 5 horas por semana en Excel. Ahora tengo todo automatizado",
    name: "María",
    business: "Dietética",
    location: "La Plata",
    initials: "M",
  },
  {
    quote: "Me salvó de quedarme sin plata para pagar el alquiler. Las alertas son oro",
    name: "Juan",
    business: "Ferretería",
    location: "Rosario",
    initials: "J",
  },
  {
    quote: "Finalmente entiendo mis números. Puedo tomar decisiones con confianza",
    name: "Laura",
    business: "Consultora",
    location: "CABA",
    initials: "L",
  },
]

export function Testimonials() {
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
    <section ref={sectionRef} className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4 text-balance">
          Lo que dicen nuestros usuarios
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
          PyMEs reales que transformaron su gestión financiera
        </p>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`bg-card rounded-xl p-6 md:p-8 border border-border hover:shadow-lg transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">{testimonial.initials}</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.business}, {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
