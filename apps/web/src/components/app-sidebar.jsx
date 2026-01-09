import { Home, FileText, TrendingUp, Settings, HelpCircle } from 'lucide-react'
import { Separator } from './ui/separator'


const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/', active: true },
  { icon: FileText, label: 'Movimientos', href: '/movimientos', active: false },
  { icon: TrendingUp, label: 'Proyecciones', href: '/proyecciones', active: false },
  { icon: Settings, label: 'Configuración', href: '/configuracion', active: false },
]

export function AppSidebar() {
  return (
    <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
      <div className="flex min-h-0 flex-1 flex-col bg-sidebar border-r border-sidebar-border">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center px-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ai to-ai/80 flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-semibold text-sidebar-foreground">Pulso</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <a
                key={item.label}
                href={item.href}
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

        {/* Footer */}
        <div className="shrink-0 p-3">
          <Separator className="mb-3" />
          <a
            href="#"
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
          >
            <HelpCircle className="h-5 w-5 shrink-0" />
            Ayuda
          </a>
        </div>
      </div>
    </aside>
  )
}
