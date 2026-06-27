import { supabase } from '../lib/supabase'

export default async function Athletes() {
  const { data: athletes } = await supabase.from('athletes').select('*')

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <a href="/dashboard" className="text-[#555] text-sm hover:text-white transition-colors">← Dashboard</a>
            <h1 className="text-3xl font-medium text-white mt-2">Deportistas</h1>
            <p className="text-[#555] text-sm">WeAthletics · {athletes?.length} deportistas</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
<a href="/athletes/nuevo" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
  + Añadir deportista
</a>          </button>
        </div>

        <div className="bg-[#111] border border-[#1A1A1A] rounded-xl overflow-hidden">
          <div className="grid grid-cols-4 px-6 py-3 border-b border-[#1A1A1A]">
            <span className="text-[#444] text-xs uppercase tracking-widest">Nombre</span>
            <span className="text-[#444] text-xs uppercase tracking-widest">Deporte</span>
            <span className="text-[#444] text-xs uppercase tracking-widest">Categoría</span>
            <span className="text-[#444] text-xs uppercase tracking-widest">Estado</span>
          </div>
          {athletes?.map((athlete) => (
            <div key={athlete.id} className="grid grid-cols-4 px-6 py-4 border-b border-[#1A1A1A] hover:bg-[#141414] transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-medium">
                  {athlete.first_name[0]}{athlete.last_name[0]}
                </div>
                <span className="text-white text-sm font-medium">{athlete.first_name} {athlete.last_name}</span>
              </div>
              <span className="text-[#888] text-sm self-center">{athlete.sport}</span>
              <span className="text-[#888] text-sm self-center">{athlete.category}</span>
              <span className="self-center">
                <span className="bg-green-500/10 text-green-400 text-xs px-2 py-1 rounded-full">
                  {athlete.status}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}