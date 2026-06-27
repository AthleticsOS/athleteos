import { supabase } from '@/app/lib/supabase'

export default async function Communication() {
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })

  const typeConfig: Record<string, { color: string, label: string }> = {
    info: { color: 'bg-blue-500/10 text-blue-400', label: 'Aviso' },
    success: { color: 'bg-green-500/10 text-green-400', label: 'Buenas noticias' },
    warning: { color: 'bg-amber-500/10 text-amber-400', label: 'Atención' },
    urgent: { color: 'bg-red-500/10 text-red-400', label: 'Urgente' },
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-white">Comunicación</h1>
            <p className="text-[#555] text-sm mt-1">Avisos y anuncios del club</p>
          </div>
          <a href="/communication/nuevo"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
            + Nuevo aviso
          </a>
        </div>
        {announcements && announcements.length > 0 ? (
          <div className="flex flex-col gap-3">
            {announcements.map((ann) => (
              <div key={ann.id} className={`bg-[#111] border rounded-xl p-5 ${ann.pinned ? 'border-blue-500/20' : 'border-[#1A1A1A]'}`}>
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    {ann.pinned && <span className="text-xs text-blue-400 font-medium">📌 Fijado</span>}
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeConfig[ann.type]?.color || 'bg-[#1A1A1A] text-[#555]'}`}>
                      {typeConfig[ann.type]?.label || ann.type}
                    </span>
                  </div>
                  <span className="text-[#444] text-xs">
                    {new Date(ann.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                  </span>
                </div>
                <h3 className="text-white font-medium mb-2">{ann.title}</h3>
                <p className="text-[#666] text-sm leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-16 text-center">
            <p className="text-[#555] mb-4">No hay avisos publicados todavía</p>
            <a href="/communication/nuevo" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Crear el primero
            </a>
          </div>
        )}
      </div>
    </main>
  )
}