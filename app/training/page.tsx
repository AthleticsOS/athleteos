import { supabase } from '../lib/supabase'

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
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <a href="/dashboard" className="text-[#555] text-sm hover:text-white transition-colors">← Dashboard</a>
            <h1 className="text-3xl font-medium text-white mt-2">Entrenamientos</h1>
            <p className="text-[#555] text-sm">WeAthletics · Temporada 2024–2025</p>
          </div>
          <a href="/training/nuevo" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + Nueva sesión
          </a>
        </div>

        {sessions && sessions.length > 0 ? (
          <div className="flex flex-col gap-3">
            {sessions.map((session) => (
              <div key={session.id} className="bg-[#111] border border-[#1A1A1A] rounded-xl p-5 flex items-center gap-6">
                <div className="text-center w-14 flex-shrink-0">
                  <div className="text-2xl font-medium text-white">
                    {new Date(session.date).getDate()}
                  </div>
                  <div className="text-[#555] text-xs uppercase">
                    {new Date(session.date).toLocaleDateString('es-ES', { month: 'short' })}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium">{session.title}</div>
                  <div className="text-[#555] text-sm mt-1 flex gap-4">
                    {session.time && <span>🕐 {session.time}</span>}
                    {session.duration_min && <span>⏱ {session.duration_min} min</span>}
                    {session.location && <span>📍 {session.location}</span>}
                  </div>
                  {session.description && (
                    <div className="text-[#444] text-xs mt-2">{session.description}</div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${typeColors[session.type] || 'bg-[#1A1A1A] text-[#555]'}`}>
                    {session.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-12 text-center">
            <p className="text-[#555]">No hay sesiones programadas todavía</p>
            <a href="/training/nuevo" className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Crear la primera sesión
            </a>
          </div>
        )}
      </div>
    </main>
  )
}