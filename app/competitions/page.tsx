import { supabase } from '../lib/supabase'

export default async function Competitions() {
  const { data: competitions } = await supabase
    .from('competitions')
    .select('*')
    .order('date', { ascending: false })

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <a href="/dashboard" className="text-[#555] text-sm hover:text-white transition-colors">← Dashboard</a>
            <h1 className="text-3xl font-medium text-white mt-2">Competiciones</h1>
            <p className="text-[#555] text-sm">WeAthletics · Temporada 2024–2025</p>
          </div>
          <a href="/competitions/nueva" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + Añadir competición
          </a>
        </div>

        {competitions && competitions.length > 0 ? (
          <div className="flex flex-col gap-3">
            {competitions.map((comp) => (
              <a href={`/competitions/${comp.id}`} key={comp.id}
                className="bg-[#111] border border-[#1A1A1A] rounded-xl p-5 hover:border-[#333] transition-colors flex items-center gap-6">
                <div className="text-center w-14 flex-shrink-0">
                  <div className="text-2xl font-medium text-white">
                    {new Date(comp.date).getDate()}
                  </div>
                  <div className="text-[#555] text-xs uppercase">
                    {new Date(comp.date).toLocaleDateString('es-ES', { month: 'short' })}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium">{comp.name}</div>
                  <div className="text-[#555] text-sm mt-1">{comp.location} · {comp.sport}</div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    comp.status === 'upcoming'
                      ? 'bg-blue-500/10 text-blue-400'
                      : comp.status === 'finished'
                      ? 'bg-[#1A1A1A] text-[#555]'
                      : 'bg-green-500/10 text-green-400'
                  }`}>
                    {comp.status === 'upcoming' ? 'Próxima' : comp.status === 'finished' ? 'Finalizada' : comp.status}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-medium">
                    {comp.level}
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-12 text-center">
            <p className="text-[#555]">No hay competiciones registradas todavía</p>
            <a href="/competitions/nueva" className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Añadir la primera
            </a>
          </div>
        )}
      </div>
    </main>
  )
}