import './index.css'
import { AppSidebar } from './components/app-sidebar'
import { MobileNav } from './components/mobile-nav'
import { KPICards } from './components/dashboard/kpi-cards'
import { ProjectionChart } from './components/dashboard/projection-chart'
import { SmartAlerts } from './components/dashboard/smart-alerts'
import { RecentTransactions } from './components/dashboard/recent-transactions'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <MobileNav />
      
      <main className="md:pl-64 pt-14 md:pt-0 pb-20 md:pb-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-balance">
              Buenos días, Martín
            </h1>
            <p className="text-muted-foreground mt-1">
              ¿Cómo viene tu mes? Acá tenés el resumen.
            </p>
          </div>

          {/* KPI Cards */}
          <div className="mb-6">
            <KPICards />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart - Takes 2 columns */}
            <div className="lg:col-span-2">
              <ProjectionChart />
            </div>

            {/* Alerts - Takes 1 column */}
            <div className="lg:col-span-1">
              <SmartAlerts />
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="mt-6">
            <RecentTransactions />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App

