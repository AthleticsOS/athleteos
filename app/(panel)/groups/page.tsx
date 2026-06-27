import { supabase } from '@/app/lib/supabase'

export default async function Groups() {
  const { data: groups } = await supabase
    .from('groups')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-white">Grupos</h1>
            <p className="text-[#555] text-sm mt-1">{groups?.length || 0} grupos en el club</p>
          </div>
          <a href="/groups/nuevo"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
            + Nuevo grupo
          </a>
        </div>

        {groups && groups.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {groups.map((group) => (
              <div key={group.id}
                className="bg-[#111] border border-[#1A1A1A] rounded-2xl p-5 hover:border-[#333] transition-colors">
                <div className="flex items-start gap-3 mb-4">
                  <div style={{
                    width:'36px', height:'36px', borderRadius:'8px',
                    backgroundColor: group.color || '#2563EB',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    flexShrink: 0,
                  }}>
                    <span style={{color:'white', fontWeight:'bold', fontSize:'14px'}}>
                      {group.name?.[0]}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-medium">{group.name}</div>
                    <div className="text-[#555] text-xs mt-0.5">{group.category} · {group.season}</div>
                  </div>
                </div>
                {group.max_members && (
                  <div className="text-[#444] text-xs">
                    Máximo {group.max_members} miembros
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl p-16 text-center">
            <p className="text-4xl mb-4">👥</p>
            <p className="text-white font-medium mb-2">Sin grupos todavía</p>
            <p className="text-[#555] text-sm mb-6">Los grupos permiten organizar deportistas por equipo o categoría</p>
            <a href="/groups/nuevo"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Crear el primero
            </a>
          </div>
        )}
      </div>
    </main>
  )
}