import { supabase } from '@/app/lib/supabase'
import ProgressChart from '@/app/components/ProgressChart'

type Props = {
  params: Promise<{ id: string }>
}

export default async function AthleteProfile({ params }: Props) {
  const { id } = await params

  const { data: athlete } = await supabase
    .from('athletes')
    .select('*')
    .eq('id', id)
    .single()

  const { data: records } = await supabase
    .from('personal_records')
    .select('*')
    .eq('athlete_id', id)
    .order('date', { ascending: false })

  const { data: results } = await supabase
    .from('competition_results')
    .select('*, competitions(name, date, location)')
    .eq('athlete_id', id)
    .order('created_at', { ascending: false })

  if (!athlete) return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <p className="text-white">Deportista no encontrado</p>
    </main>
  )

  const initials = `${athlete.first_name[0]}${athlete.last_name[0]}`
  const age = athlete.birth_date
    ? Math.floor((new Date().getTime() - new Date(athlete.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  const chartDataByDiscipline: Record<string, { fecha: string, marca: number, competicion: string }[]> = {}
  results?.forEach((result) => {
    if (!result.mark || !result.competitions?.date) return
    const numericMark = parseFloat(result.mark.replace(/[^0-9.]/g, ''))
    if (isNaN(numericMark)) return
    if (!chartDataByDiscipline[result.discipline]) {
      chartDataByDiscipline[result.discipline] = []
    }
    chartDataByDiscipline[result.discipline].push({
      fecha: new Date(result.competitions.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      marca: numericMark,
      competicion: result.competitions.name
    })
  })

  const mainDiscipline = Object.keys(chartDataByDiscipline)[0]

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-4xl mx-auto">

        <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl p-6 mb-4">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xl font-medium flex-shrink-0 border border-blue-500/20">
              {initials}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-medium text-white tracking-tight">
                {athlete.first_name} {athlete.last_name}
              </h1>
              <div className="flex gap-4 mt-2 flex-wrap">
                {athlete.sport && <span className="text-[#555] text-sm">{athlete.sport}</span>}
                {athlete.category && <><span className="text-[#2A2A2A]">·</span><span className="text-[#555] text-sm">{athlete.category}</span></>}
                {age && <><span className="text-[#2A2A2A]">·</span><span className="text-[#555] text-sm">{age} años</span></>}
              </div>
              <div className="mt-3 flex gap-2 flex-wrap">
                <span className="bg-green-500/10 text-green-500 text-xs px-3 py-1 rounded-full font-medium">Activo</span>
                {records && records.length > 0 && (
                  <span className="bg-blue-500/10 text-blue-400 text-xs px-3 py-1 rounded-full font-medium">
                    {records.length} marca{records.length > 1 ? 's' : ''} personal{records.length > 1 ? 'es' : ''}
                  </span>
                )}
                {results && results.length > 0 && (
                  <span className="bg-amber-500/10 text-amber-400 text-xs px-3 py-1 rounded-full font-medium">
                    {results.length} competicion{results.length > 1 ? 'es' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {mainDiscipline && chartDataByDiscipline[mainDiscipline].length >= 2 && (
          <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white text-sm font-medium">Progresión — {mainDiscipline}</p>
              <span className="text-[#444] text-xs">{chartDataByDiscipline[mainDiscipline].length} competiciones</span>
            </div>
            <ProgressChart
              data={chartDataByDiscipline[mainDiscipline]}
              unit="s"
              lowerIsBetter={true}
            />
            <p className="text-[#333] text-xs mt-2">— línea dorada = mejor marca</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="col-span-2 bg-[#111] border border-[#1A1A1A] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1A1A1A]">
              <p className="text-white text-sm font-medium">Marcas personales</p>
            </div>
            {records && records.length > 0 ? (
              <div className="flex flex-col">
                {records.map((record, index) => (
                  <div key={record.id}
                    className={`flex items-center gap-4 px-5 py-3.5 ${index < records.length - 1 ? 'border-b border-[#161616]' : ''}`}>
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{record.discipline}</div>
                      <div className="text-[#444] text-xs mt-0.5">
                        {record.competition} · {record.date ? new Date(record.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                      </div>
                    </div>
                    <div className="text-blue-400 text-base font-medium font-mono">{record.mark}</div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-10 text-center text-[#444] text-sm">
                No hay marcas registradas todavía
              </div>
            )}
          </div>

          <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1A1A1A]">
              <p className="text-white text-sm font-medium">Información</p>
            </div>
            <div className="p-4 flex flex-col gap-3">
              {athlete.email && (
                <div>
                  <div className="text-[#444] text-xs mb-1">Email</div>
                  <div className="text-[#CCC] text-sm truncate">{athlete.email}</div>
                </div>
              )}
              {athlete.phone && (
                <div>
                  <div className="text-[#444] text-xs mb-1">Teléfono</div>
                  <div className="text-[#CCC] text-sm">{athlete.phone}</div>
                </div>
              )}
              {athlete.birth_date && (
                <div>
                  <div className="text-[#444] text-xs mb-1">Nacimiento</div>
                  <div className="text-[#CCC] text-sm">{new Date(athlete.birth_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
              )}
              {athlete.sport && (
                <div>
                  <div className="text-[#444] text-xs mb-1">Deporte</div>
                  <div className="text-[#CCC] text-sm">{athlete.sport}</div>
                </div>
              )}
              {athlete.category && (
                <div>
                  <div className="text-[#444] text-xs mb-1">Categoría</div>
                  <div className="text-[#CCC] text-sm">{athlete.category}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {results && results.length > 0 && (
          <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1A1A1A]">
              <p className="text-white text-sm font-medium">Historial de competiciones</p>
            </div>
            <div className="flex flex-col">
              {results.map((result, index) => (
                <div key={result.id}
                  className={`flex items-center gap-4 px-5 py-3.5 ${index < results.length - 1 ? 'border-b border-[#161616]' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    result.position === 1 ? 'bg-yellow-500 text-black' :
                    result.position === 2 ? 'bg-gray-400 text-black' :
                    result.position === 3 ? 'bg-amber-600 text-black' :
                    'bg-[#222] text-[#888]'
                  }`}>
                    {result.position}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium">{result.competitions?.name}</div>
                    <div className="text-[#444] text-xs mt-0.5">
                      {result.discipline} · {result.competitions?.location}
                      {result.competitions?.date && ` · ${new Date(result.competitions.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                    </div>
                  </div>
                  <div className="text-blue-400 text-sm font-medium font-mono">{result.mark}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}