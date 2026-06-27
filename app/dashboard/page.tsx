import { supabase } from '../lib/supabase'
import RevenueChart from '../components/RevenueChart'

export default async function Dashboard() {
  const { data: athletes } = await supabase.from('athletes').select('*')
  const { data: competitions } = await supabase.from('competitions').select('*')
  const { data: sessions } = await supabase.from('training_sessions').select('*')
  const { data: payments } = await supabase.from('payments').select('*')

  const upcoming = competitions?.filter(c => c.status === 'upcoming').length || 0
  const pending = payments?.filter(p => p.status === 'pending').length || 0
  const totalPaid = payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount_cents, 0) || 0

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-4xl mx-auto">

        <div className="mb-10">
          <h2 className="text-3xl font-medium text-white tracking-tight">{greeting}, Aaron</h2>
          <p className="text-[#444] mt-1">Temporada 2024–2025 · WeAthletics</p>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl p-5 hover:border-[#252525] transition-colors">
            <p className="text-[#444] text-xs uppercase tracking-widest mb-4">Deportistas</p>
            <p className="text-white text-4xl font-medium tracking-tight">{athletes?.length || 0}</p>
            <p className="text-green-500 text-xs mt-3 flex items-center gap-1">
              <span>↑</span> Activos en el club
            </p>
          </div>
          <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl p-5 hover:border-[#252525] transition-colors">
            <p className="text-[#444] text-xs uppercase tracking-widest mb-4">Competiciones</p>
            <p className="text-blue-400 text-4xl font-medium tracking-tight">{competitions?.length || 0}</p>
            <p className="text-[#444] text-xs mt-3">{upcoming} próximas</p>
          </div>
          <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl p-5 hover:border-[#252525] transition-colors">
            <p className="text-[#444] text-xs uppercase tracking-widest mb-4">Ingresos</p>
            <p className="text-white text-4xl font-medium tracking-tight">€{(totalPaid / 100).toFixed(0)}</p>
            <p className={`text-xs mt-3 ${pending > 0 ? 'text-red-400' : 'text-[#444]'}`}>
              {pending > 0 ? `${pending} pendientes` : 'Todo al día'}
            </p>
          </div>
          <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl p-5 hover:border-[#252525] transition-colors">
            <p className="text-[#444] text-xs uppercase tracking-widest mb-4">Sesiones</p>
            <p className="text-white text-4xl font-medium tracking-tight">{sessions?.length || 0}</p>
            <p className="text-[#444] text-xs mt-3">Esta temporada</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="col-span-2 bg-[#111] border border-[#1A1A1A] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white text-sm font-medium">Ingresos 2025</p>
              <span className="text-[#444] text-xs">últimos 6 meses</span>
            </div>
            <RevenueChart />
          </div>
          <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl p-5">
            <p className="text-white text-sm font-medium mb-4">Accesos rápidos</p>
            <div className="flex flex-col gap-1">
              {[
                { href: '/athletes/nuevo', label: '+ Nuevo deportista' },
                { href: '/competitions/nueva', label: '+ Nueva competición' },
                { href: '/training/nuevo', label: '+ Nueva sesión' },
                { href: '/finances/nuevo', label: '+ Nuevo pago' },
                { href: '/ai', label: '🧠 Asistente IA' },
              ].map((item) => (
                <a key={item.href} href={item.href}
                  className="text-[#555] hover:text-white text-sm py-2 px-3 rounded-lg hover:bg-[#1A1A1A] transition-colors">
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1A1A1A] flex items-center justify-between">
            <p className="text-white text-sm font-medium">Deportistas del club</p>
            <a href="/athletes" className="text-blue-400 text-xs hover:text-blue-300 transition-colors">Ver todos →</a>
          </div>
          <div className="flex flex-col">
            {athletes?.map((athlete, index) => (
              <a href={`/athletes/${athlete.id}`} key={athlete.id}
                className={`flex items-center gap-4 px-6 py-3.5 hover:bg-[#161616] transition-colors ${
                  index < (athletes?.length || 0) - 1 ? 'border-b border-[#161616]' : ''
                }`}>
                <div className="w-8 h-8 rounded-full bg-blue-600/15 text-blue-400 flex items-center justify-center text-xs font-medium flex-shrink-0">
                  {athlete.first_name[0]}{athlete.last_name[0]}
                </div>
                <span className="text-[#CCC] text-sm flex-1">{athlete.first_name} {athlete.last_name}</span>
                <span className="text-[#444] text-xs">{athlete.sport}</span>
                <span className="text-[#2A2A2A] text-xs">·</span>
                <span className="text-[#444] text-xs">{athlete.category}</span>
              </a>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}