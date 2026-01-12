import { Button } from "@/components/ui/button"
import { Rocket } from "lucide-react"

export function FinalCTA() {
  return (
    <section className="relative bg-gradient-to-r from-primary to-primary/80 py-16 md:py-24 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 text-balance">
            Empezá a controlar tus finanzas hoy
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Sumáte a más de 500 PyMEs que ya toman mejores decisiones financieras
          </p>

          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90 h-16 px-10 text-lg font-semibold shadow-lg"
          >
            <Rocket className="w-5 h-5 mr-2" />
            Crear Cuenta Gratis - 14 días de prueba
          </Button>

          <p className="text-primary-foreground/70 text-sm mt-4">No requiere tarjeta de crédito</p>
        </div>
      </div>
    </section>
  )
}
