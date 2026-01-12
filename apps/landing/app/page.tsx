import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { PainPoints } from "@/components/pain-points"
import { Solution } from "@/components/solution"
import { HowItWorks } from "@/components/how-it-works"
import { MercadoPagoIntegration } from "@/components/mercado-pago-integration"
import { Testimonials } from "@/components/testimonials"
import { Pricing } from "@/components/pricing"
import { FAQ } from "@/components/faq"
import { FinalCTA } from "@/components/final-cta"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <PainPoints />
      <Solution />
      <HowItWorks />
      <MercadoPagoIntegration />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  )
}
