import Link from "next/link"
import { Twitter, Linkedin, Mail } from "lucide-react"

const footerLinks = {
  producto: [
    { name: "Funciones", href: "#funciones" },
    { name: "Pricing", href: "#pricing" },
    { name: "Integraciones", href: "#" },
  ],
  empresa: [
    { name: "Sobre Nosotros", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Contacto", href: "#contacto" },
  ],
  legal: [
    { name: "Términos", href: "#" },
    { name: "Privacidad", href: "#" },
    { name: "Cookies", href: "#" },
  ],
}

const socialLinks = [
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
  { name: "Email", icon: Mail, href: "mailto:hola@pulso.ar" },
]

export function Footer() {
  return (
    <footer id="contacto" className="bg-card border-t border-border py-12 md:py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-8 md:gap-12">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-foreground">PULSO</span>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              Control financiero inteligente para PyMEs argentinas. Conectá tu Mercado Pago y tomá mejores decisiones.
            </p>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Producto</h4>
            <ul className="space-y-3">
              {footerLinks.producto.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2026 PULSO - Control Financiero para PyMEs Argentinas</p>
          <p className="text-sm text-muted-foreground">Hecho con ❤️ en Argentina</p>
        </div>
      </div>
    </footer>
  )
}
