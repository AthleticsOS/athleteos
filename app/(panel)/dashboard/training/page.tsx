import { supabase } from '@/app/lib/supabase'

export default async function Training() {
  const { data: sessions } = await supabase
    .from('training_sessions')
    .select('*')
    .order('date', { ascending: true })

  const typeColors: Record<string, string> = {
    'Velocidad': 'bg-red-500/10 text-red-400',
    'Resistencia': 'bg-blue-500/10 text-blue-400',
    'Fuerza': 'bg-amber-500/10 text-amber-400',
    'Técnica': 'bg-purple-500/10 text-purple-400',
    'Recuperación': 'bg-green-500/10 text-green-400',
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-white">Entrenamientos</h1>
            <p className="text-[#555] text-sm mt-1">{sessions?.length || 0} sesiones esta temporada</p>
          </div>
          <a href="/training/nuevo"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
            + Nueva sesión
          </a>
        </div>
        <div className="bg-[#111] border border-[#1A1A1A] rounded-xl overflow-hidden">
          {sessions && sessions.length > 0 ? (
            sessions.map((session, index) => (
              <div key={session.id}
                className={`flex items-center gap-5 px-6 py-4 ${
                  index < sessions.length - 1 ? 'border-b border-[#161616]' : ''
                }`}>
                <div className="text-center w-12 flex-shrink-0">
                  <div className="text-xl font-medium text-white leading-none">
                    {new Date(session.date).getDate()}
                  </div>
                  <div className="text-[#444] text-xs uppercase mt-1">
                    {new Date(session.date).toLocaleDateString('es-ES', { month: 'short' })}
                  </div>
                </div>
                <div className="w-px h-8 bg-[#1E1E1E] flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium">{session.title}</div>
                  <div className="text-[#555] text-xs mt-0.5 flex gap-3">
                    {session.time && <span>{session.time}</span>}
                    {session.duration_min && <span>{session.duration_min} min</span>}
                    {session.location && <span>{session.location}</span>}
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${typeColors[session.type] || 'bg-[#1A1A1A] text-[#555]'}`}>
                  {session.type}
                </span>
              </div>
            ))
          ) : (
            <div className="px-6 py-16 text-center">
              <p className="text-[#555] mb-4">No hay sesiones programadas</p>
              <a href="/training/nuevo" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Crear la primera
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}