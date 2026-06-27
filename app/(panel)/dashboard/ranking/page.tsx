import { supabase } from '@/app/lib/supabase'

export default async function Ranking() {
  const { data: records } = await supabase
    .from('personal_records')
    .select('*, athletes(first_name, last_name, category, gender)')
    .order('mark', { ascending: true })

  const byDiscipline: Record<string, any[]> = {}
  records?.forEach((record) => {
    if (!byDiscipline[record.discipline]) {
      byDiscipline[record.discipline] = []
    }
    byDiscipline[record.discipline].push(record)
  })

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-4xl mx-auto">
        <a href="/dashboard" className="text-[#555] text-sm hover:text-white transition-colors">← Dashboard</a>
        <h1 className="text-3xl font-medium text-white mt-2 mb-2">Ranking del club</h1>
        <p className="text-[#555] text-sm mb-10">WeAthletics · Mejores marcas por prueba</p>

        {Object.keys(byDiscipline).length > 0 ? (
          <div className="flex flex-col gap-8">
            {Object.entries(byDiscipline).map(([discipline, athleteRecords]) => (
              <div key={discipline} className="bg-[#111] border border-[#1A1A1A] rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#1A1A1A]">
                  <h2 className="text-white font-medium">{discipline}</h2>
                  <p className="text-[#555] text-xs mt-1">{athleteRecords.length} atletas</p>
                </div>
                <div className="flex flex-col">
                  {athleteRecords.map((record, index) => (
                    <div key={record.id} className="flex items-center gap-4 px-6 py-4 border-b border-[#1A1A1A] last:border-0 hover:bg-[#141414] transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        index === 2 ? 'bg-amber-600 text-black' :
                        'bg-[#222] text-[#888]'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium">
                          {record.athletes?.first_name} {record.athletes?.last_name}
                        </div>
                        <div className="text-[#555] text-xs mt-1">
                          {record.athletes?.category}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-blue-400 text-sm font-medium font-mono">{record.mark}</div>
                        <div className="text-[#444] text-xs mt-1">
                          {record.date ? new Date(record.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-12 text-center">
            <p className="text-[#555]">No hay marcas registradas todavía</p>
            <p className="text-[#333] text-sm mt-2">Las marcas aparecen aquí cuando se añaden en el perfil de cada deportista</p>
          </div>
        )}
      </div>
    </main>
  )
}