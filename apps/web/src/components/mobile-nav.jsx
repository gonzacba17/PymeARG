import { useState } from 'react'
import { Menu, X, Home, FileText, TrendingUp, Settings, HelpCircle } from 'lucide-react'

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/', active: true },
  { icon: FileText, label: 'Movimientos', href: '/movimientos', active: false },
  { icon: TrendingUp, label: 'Proyecciones', href: '/proyecciones', active: false },
  { icon: Settings, label: 'Configuración', href: '/configuracion', active: false },
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-x-6 bg-background border-b border-border px-4 shadow-sm md:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-foreground"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex-1 text-sm font-semibold text-foreground">Pulso</div>
      </div>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="relative z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setIsOpen(false)}
          />

          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-sidebar border-r border-sidebar-border">
            <div className="flex h-14 items-center justify-between px-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ai to-ai/80 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <span className="text-xl font-semibold text-sidebar-foreground">Pulso</span>
              </div>
              <button
                type="button"
                className="-m-2.5 p-2.5 text-sidebar-foreground"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                      ${
                        item.active
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </a>
                )
              })}
            </nav>

            <div className="shrink-0 p-3 border-t border-sidebar-border">
              <a
                href="#"
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
              >
                <HelpCircle className="h-5 w-5 shrink-0" />
                Ayuda
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
