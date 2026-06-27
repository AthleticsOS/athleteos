import { supabase } from '@/app/lib/supabase'

export default async function Stats() {
  const { data: athletes } = await supabase.from('athletes').select('*')
  const { data: competitions } = await supabase.from('competitions').select('*')
  const { data: sessions } = await supabase.from('training_sessions').select('*')
  const { data: payments } = await supabase.from('payments').select('*')
  const { data: records } = await supabase.from('personal_records').select('*')
  const { data: results } = await supabase.from('competition_results').select('*')

  const totalIngresos = payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount_cents, 0) || 0
  const totalPendiente = payments?.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount_cents, 0) || 0
  const totalSesiones = sessions?.length || 0
  const totalCompeticiones = competitions?.length || 0
  const totalDeportistas = athletes?.length || 0
  const totalRecords = records?.length || 0
  const totalResultados = results?.length || 0
  const podios = results?.filter(r => r.position <= 3).length || 0
  const oros = results?.filter(r => r.position === 1).length || 0

  const deporteCount: Record<string, number> = {}
  athletes?.forEach(a => {
    deporteCount[a.sport] = (deporteCount[a.sport] || 0) + 1
  })
  const deportes = Object.entries(deporteCount).sort((a, b) => b[1] - a[1])

  const categoriaCount: Record<string, number> = {}
  athletes?.forEach(a => {
    categoriaCount[a.category] = (categoriaCount[a.category] || 0) + 1
  })
  const categorias = Object.entries(categoriaCount).sort((a, b) => b[1] - a[1])

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-white">Estadísticas</h1>
          <p className="text-[#555] text-sm mt-1">WeAthletics · Temporada 2024–2025</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl p-5">
            <p className="text-[#444] text-xs uppercase tracking-widest mb-3">Ingresos cobrados</p>
            <p className="text-green-400 text-3xl font-medium">€{(totalIngresos / 100).toFixed(2)}</p>
            {totalPendiente > 0 && <p className="text-red-400 text-xs mt-2">€{(totalPendiente / 100).toFixed(2)} pendientes</p>}
          </div>
          <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl p-5">
            <p className="text-[#444] text-xs uppercase tracking-widest mb-3">Podios conseguidos</p>
            <p className="text-yellow-400 text-3xl font-medium">{podios}</p>
            <p className="text-[#444] text-xs mt-2">{oros} oros esta temporada</p>
          </div>
          <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl p-5">
            <p className="text-[#444] text-xs uppercase tracking-widest mb-3">Récords personales</p>
            <p className="text-blue-400 text-3xl font-medium">{totalRecords}</p>
            <p className="text-[#444] text-xs mt-2">En {totalResultados} resultados registrados</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl p-5 text-center">
            <p className="text-white text-3xl font-medium">{totalDeportistas}</p>
            <p className="text-[#444] text-xs mt-2">Deportistas</p>
          </div>
          <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl p-5 text-center">
            <p className="text-white text-3xl font-medium">{totalCompeticiones}</p>
            <p className="text-[#444] text-xs mt-2">Competiciones</p>
          </div>
          <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl p-5 text-center">
            <p className="text-white text-3xl font-medium">{totalSesiones}</p>
            <p className="text-[#444] text-xs mt-2">Sesiones</p>
          </div>
          <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl p-5 text-center">
            <p className="text-white text-3xl font-medium">{totalResultados}</p>
            <p className="text-[#444] text-xs mt-2">Resultados</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl p-5">
            <p className="text-white text-sm font-medium mb-4">Deportistas por deporte</p>
            {deportes.length > 0 ? (
              <div className="flex flex-col gap-3">
                {deportes.map(([deporte, count]) => (
                  <div key={deporte}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#CCC]">{deporte}</span>
                      <span className="text-[#555]">{count} deportistas</span>
                    </div>
                    <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{width: `${(count / totalDeportistas) * 100}%`}}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#444] text-sm">Sin datos todavía</p>
            )}
          </div>

          <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl p-5">
            <p className="text-white text-sm font-medium mb-4">Deportistas por categoría</p>
            {categorias.length > 0 ? (
              <div className="flex flex-col gap-3">
                {categorias.map(([categoria, count]) => (
                  <div key={categoria}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#CCC]">{categoria}</span>
                      <span className="text-[#555]">{count} deportistas</span>
                    </div>
                    <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full"
                        style={{width: `${(count / totalDeportistas) * 100}%`}}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#444] text-sm">Sin datos todavía</p>
            )}
          </div>
        </div>

        <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl p-5">
          <p className="text-white text-sm font-medium mb-4">Resumen de la temporada</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between py-2 border-b border-[#161616] text-sm">
                <span className="text-[#555]">Ratio podios / competiciones</span>
                <span className="text-white font-medium">
                  {totalResultados > 0 ? `${Math.round((podios / totalResultados) * 100)}%` : '—'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#161616] text-sm">
                <span className="text-[#555]">Media ingresos por deportista</span>
                <span className="text-white font-medium">
                  {totalDeportistas > 0 ? `€${((totalIngresos / 100) / totalDeportistas).toFixed(0)}` : '—'}
                </span>
              </div>
              <div className="flex justify-between py-2 text-sm">
                <span className="text-[#555]">Sesiones por deportista</span>
                <span className="text-white font-medium">
                  {totalDeportistas > 0 ? (totalSesiones / totalDeportistas).toFixed(1) : '—'}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between py-2 border-b border-[#161616] text-sm">
                <span className="text-[#555]">Competiciones próximas</span>
                <span className="text-white font-medium">{competitions?.filter(c => c.status === 'upcoming').length || 0}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#161616] text-sm">
                <span className="text-[#555]">Competiciones finalizadas</span>
                <span className="text-white font-medium">{competitions?.filter(c => c.status === 'finished').length || 0}</span>
              </div>
              <div className="flex justify-between py-2 text-sm">
                <span className="text-[#555]">Pagos al día</span>
                <span className={`font-medium ${totalPendiente > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {totalPendiente > 0 ? 'Pendientes' : '✓ Al día'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}