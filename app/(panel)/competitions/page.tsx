import { supabase } from '@/app/lib/supabase'

export default async function Competitions() {
  const { data: competitions } = await supabase
    .from('competitions')
    .select('*')
    .order('date', { ascending: false })

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-white">Competiciones</h1>
            <p className="text-[#555] text-sm mt-1">Temporada 2024–2025</p>
          </div>
          <a href="/competitions/nueva"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
            + Añadir competición
          </a>
        </div>

        <div className="bg-[#111] border border-[#1A1A1A] rounded-xl overflow-hidden">
          {competitions && competitions.length > 0 ? (
            competitions.map((comp, index) => (
              <a href={`/competitions/${comp.id}`} key={comp.id}
                className={`flex items-center gap-5 px-6 py-4 hover:bg-[#161616] transition-colors ${
                  index < competitions.length - 1 ? 'border-b border-[#161616]' : ''
                }`}>
                <div className="text-center w-12 flex-shrink-0">
                  <div className="text-xl font-medium text-white leading-none">
                    {new Date(comp.date).getDate()}
                  </div>
                  <div className="text-[#444] text-xs uppercase mt-1">
                    {new Date(comp.date).toLocaleDateString('es-ES', { month: 'short' })}
                  </div>
                </div>
                <div className="w-px h-8 bg-[#1E1E1E] flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium">{comp.name}</div>
                  <div className="text-[#555] text-xs mt-0.5">{comp.location} · {comp.sport}</div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${
                    comp.status === 'upcoming' ? 'bg-blue-500/10 text-blue-400' : 'bg-[#1A1A1A] text-[#555]'
                  }`}>
                    {comp.status === 'upcoming' ? 'Próxima' : 'Finalizada'}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-500/10 text-amber-500 whitespace-nowrap">
                    {comp.level}
                  </span>
                </div>
              </a>
            ))
          ) : (
            <div className="px-6 py-16 text-center">
              <p className="text-[#555] mb-4">No hay competiciones registradas</p>
              <a href="/competitions/nueva" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Añadir la primera
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}