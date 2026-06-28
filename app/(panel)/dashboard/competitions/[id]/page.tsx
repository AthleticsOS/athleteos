import { supabase } from '../../../lib/supabase'

type Props = {
  params: Promise<{ id: string }>
}

export default async function CompetitionDetail({ params }: Props) {
  const { id } = await params

  const { data: competition } = await supabase
    .from('competitions')
    .select('*')
    .eq('id', id)
    .single()

  const { data: results } = await supabase
    .from('competition_results')
    .select('*, athletes(first_name, last_name)')
    .eq('competition_id', id)
    .order('position', { ascending: true })

  if (!competition) return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <p className="text-white">Competición no encontrada</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-4xl mx-auto">
        <a href="/competitions" className="text-[#555] text-sm hover:text-white transition-colors">← Competiciones</a>

        <div className="mt-6 mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-medium text-white">{competition.name}</h1>
              <div className="flex gap-4 mt-2 flex-wrap">
                <span className="text-[#555] text-sm">📍 {competition.location}</span>
                <span className="text-[#555] text-sm">📅 {new Date(competition.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="text-[#555] text-sm">🏃 {competition.sport}</span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${competition.status === 'upcoming' ? 'bg-blue-500/10 text-blue-400' : 'bg-[#1A1A1A] text-[#555]'}`}>
                {competition.status === 'upcoming' ? 'Próxima' : 'Finalizada'}
              </span>
              <span className="text-xs px-3 py-1 rounded-full font-medium bg-amber-500/10 text-amber-400">
                {competition.level}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#111] border border-[#1A1A1A] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A1A1A]">
            <h2 className="text-white font-medium">Resultados</h2>
            <a href={`/competitions/${id}/resultado`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors">
              + Añadir resultado
            </a>
          </div>

          {results && results.length > 0 ? (
            <div className="flex flex-col">
              {results.map((result) => (
                <div key={result.id} className="flex items-center gap-4 px-6 py-4 border-b border-[#1A1A1A] hover:bg-[#141414] transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                    result.position === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                    result.position === 2 ? 'bg-gray-400/20 text-gray-300' :
                    result.position === 3 ? 'bg-amber-700/20 text-amber-600' :
                    'bg-[#1A1A1A] text-[#555]'
                  }`}>
                    {result.position}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium">
                      {result.athletes?.first_name} {result.athletes?.last_name}
                    </div>
                    <div className="text-[#555] text-xs mt-1">{result.discipline}</div>
                  </div>
                  <div className="text-blue-400 text-sm font-medium font-mono">{result.mark}</div>
                  {result.wind && (
                    <div className="text-[#444] text-xs w-12 text-right">{result.wind} m/s</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-[#555]">
              No hay resultados registrados todavía
            </div>
          )}
        </div>
      </div>
    </main>
  )
}