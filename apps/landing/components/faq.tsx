"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "¿Necesito conocimientos de contabilidad?",
    answer:
      "No, para nada. PULSO está diseñado para dueños de PyMEs que quieren entender sus números sin ser contadores. Todo está explicado de forma simple y visual.",
  },
  {
    question: "¿Cómo funciona la proyección de cash flow?",
    answer:
      "Analizamos tu historial de transacciones de los últimos 6 meses y usamos inteligencia artificial para proyectar tres escenarios: optimista, realista y pesimista. Las proyecciones se actualizan automáticamente con cada nueva transacción.",
  },
  {
    question: "¿Qué pasa si no uso Mercado Pago?",
    answer:
      "Por ahora, PULSO funciona exclusivamente con Mercado Pago. Estamos trabajando para agregar más integraciones pronto, incluyendo bancos y otras billeteras virtuales.",
  },
  {
    question: "¿Puedo cargar movimientos manualmente?",
    answer:
      "Sí, podés agregar movimientos manuales para gastos en efectivo o transacciones que no pasen por Mercado Pago. La IA aprenderá de estos movimientos para mejorar las clasificaciones.",
  },
  {
    question: "¿Mis datos están seguros?",
    answer:
      "Absolutamente. Usamos encriptación de grado bancario, nunca guardamos tus credenciales de Mercado Pago (usamos OAuth), y cumplimos con todas las regulaciones de protección de datos de Argentina.",
  },
  {
    question: "¿Puedo cancelar cuando quiera?",
    answer:
      "Sí, podés cancelar tu suscripción en cualquier momento desde tu cuenta. No hay contratos ni permanencias mínimas. Si cancelás, seguís teniendo acceso hasta el fin de tu período pagado.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4 text-balance">
          Preguntas frecuentes
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
          Todo lo que necesitás saber antes de empezar
        </p>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left text-foreground hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
