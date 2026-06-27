import { supabase } from '@/app/lib/supabase'

export default async function Athletes() {
  const { data: athletes } = await supabase.from('athletes').select('*')

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-white">Deportistas</h1>
            <p className="text-[#555] text-sm mt-1">{athletes?.length || 0} deportistas en el club</p>
          </div>
          <a href="/athletes/nuevo"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
            + Añadir deportista
          </a>
        </div>

        <div className="bg-[#111] border border-[#1A1A1A] rounded-xl overflow-hidden">
          {athletes && athletes.length > 0 ? (
            athletes.map((athlete, index) => (
              <a href={`/athletes/${athlete.id}`} key={athlete.id}
                className={`flex items-center gap-4 px-6 py-4 hover:bg-[#161616] transition-colors ${
                  index < athletes.length - 1 ? 'border-b border-[#161616]' : ''
                }`}>
                <div className="w-10 h-10 rounded-full bg-blue-600/15 text-blue-400 flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {athlete.first_name[0]}{athlete.last_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium">{athlete.first_name} {athlete.last_name}</div>
                  <div className="text-[#555] text-xs mt-0.5">{athlete.email || 'Sin email'}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#444] text-xs">{athlete.sport}</span>
                  <span className="text-[#2A2A2A]">·</span>
                  <span className="text-[#444] text-xs">{athlete.category}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    athlete.status === 'active'
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-[#1A1A1A] text-[#555]'
                  }`}>
                    {athlete.status === 'active' ? 'Activo' : athlete.status}
                  </span>
                  <span className="text-[#333] text-sm">→</span>
                </div>
              </a>
            ))
          ) : (
            <div className="px-6 py-16 text-center">
              <p className="text-[#555] mb-4">No hay deportistas en el club todavía</p>
              <a href="/athletes/nuevo" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Añadir el primero
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}