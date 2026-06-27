import { supabase } from '../lib/supabase'

export default async function Dashboard() {
  const { data: athletes } = await supabase.from('athletes').select('*')
  const { data: competitions } = await supabase.from('competitions').select('*')

  const upcoming = competitions?.filter(c => c.status === 'upcoming').length || 0
  const finished = competitions?.filter(c => c.status === 'finished').length || 0

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center gap-4 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">A</span>
          </div>
          <div>
            <h1 className="text-white font-medium text-lg">AthleteOS</h1>
            <p className="text-[#555] text-sm">WeAthletics</p>
          </div>
        </div>

        <h2 className="text-3xl font-medium text-white mb-2">Buenos días, Aaron</h2>
        <p className="text-[#555] mb-10">Temporada 2024–2025</p>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-5">
            <p className="text-[#555] text-xs uppercase tracking-widest mb-3">Deportistas</p>
            <p className="text-white text-3xl font-medium">{athletes?.length || 0}</p>
            <p className="text-green-500 text-xs mt-2">Activos en el club</p>
          </div>
          <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-5">
            <p className="text-[#555] text-xs uppercase tracking-widest mb-3">Competiciones</p>
            <p className="text-blue-400 text-3xl font-medium">{competitions?.length || 0}</p>
            <p className="text-[#555] text-xs mt-2">{upcoming} próximas · {finished} finalizadas</p>
          </div>
          <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-5">
            <p className="text-[#555] text-xs uppercase tracking-widest mb-3">Sesiones</p>
            <p className="text-white text-3xl font-medium">0</p>
            <p className="text-[#555] text-xs mt-2">Esta semana</p>
          </div>
          <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-5">
            <p className="text-[#555] text-xs uppercase tracking-widest mb-3">Ingresos</p>
            <p className="text-white text-3xl font-medium">€0</p>
            <p className="text-[#555] text-xs mt-2">Este mes</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <a href="/athletes" className="bg-[#111] border border-[#1A1A1A] hover:border-[#333] rounded-xl p-6 transition-colors group">
            <div className="text-2xl mb-3">👥</div>
            <div className="text-white font-medium mb-1">Deportistas</div>
            <div className="text-[#555] text-sm">Ver y gestionar deportistas</div>
            <div className="text-blue-400 text-xs mt-3 group-hover:translate-x-1 transition-transform">Ver todos →</div>
          </a>
          <a href="/competitions" className="bg-[#111] border border-[#1A1A1A] hover:border-[#333] rounded-xl p-6 transition-colors group">
            <div className="text-2xl mb-3">🏆</div>
            <div className="text-white font-medium mb-1">Competiciones</div>
            <div class="text-[#555] text-sm">Calendario y resultados</div>
            <div className="text-blue-400 text-xs mt-3 group-hover:translate-x-1 transition-transform">Ver todas →</div>
          </a>
          <a href="/athletes/nuevo" className="bg-[#111] border border-[#1A1A1A] hover:border-[#333] rounded-xl p-6 transition-colors group">
            <div className="text-2xl mb-3">➕</div>
            <div className="text-white font-medium mb-1">Nuevo deportista</div>
            <div className="text-[#555] text-sm">Añadir al club</div>
            <div className="text-blue-400 text-xs mt-3 group-hover:translate-x-1 transition-transform">Añadir →</div>
          </a>
        </div>

        <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-6">
          <h3 className="text-white font-medium mb-4">Deportistas recientes</h3>
          <div className="flex flex-col gap-0">
            {athletes?.slice(0, 5).map((athlete) => (
              <a href={`/athletes/${athlete.id}`} key={athlete.id}
                className="flex items-center gap-3 py-3 border-b border-[#1A1A1A] last:border-0 hover:opacity-70 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-medium">
                  {athlete.first_name[0]}{athlete.last_name[0]}
                </div>
                <span className="text-[#AAA] text-sm flex-1">{athlete.first_name} {athlete.last_name}</span>
                <span className="text-[#555] text-xs">{athlete.sport}</span>
              </a>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}