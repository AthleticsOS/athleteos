import { supabase } from '@/app/lib/supabase'

export default async function Athletes() {
  const { data: athletes } = await supabase.from('athletes').select('*')

  return (
    <main className="min-h-screen p-8" style={{backgroundColor:'#080808'}}>
      <div style={{maxWidth:'1000px', margin:'0 auto'}}>

        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'32px'}}>
          <div>
            <h1 style={{fontSize:'24px', fontWeight:'700', color:'#F0F0F0', letterSpacing:'-0.02em', margin:0}}>
              Deportistas
            </h1>
            <p style={{color:'#333', fontSize:'13px', marginTop:'6px'}}>
              {athletes?.length || 0} deportistas en WeAthletics
            </p>
          </div>
          <a href="/athletes/nuevo" style={{
            display:'flex', alignItems:'center', gap:'6px',
            padding:'9px 16px', borderRadius:'9px',
            background:'linear-gradient(135deg, #6366F1, #8B5CF6)',
            color:'white', fontSize:'13px', fontWeight:'600',
            boxShadow:'0 0 20px rgba(99,102,241,0.3)',
          }}>
            + Añadir deportista
          </a>
        </div>

        <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden'}}>
          <div style={{
            display:'grid', gridTemplateColumns:'1fr 120px 120px 100px 32px',
            padding:'10px 20px',
            borderBottom:'1px solid rgba(255,255,255,0.04)',
          }}>
            {['Deportista', 'Deporte', 'Categoría', 'Estado', ''].map(h => (
              <div key={h} style={{color:'#2A2A2A', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em'}}>
                {h}
              </div>
            ))}
          </div>

          {athletes && athletes.length > 0 ? (
            athletes.map((athlete, index) => (
              <a href={`/athletes/${athlete.id}`} key={athlete.id}
                className="hover:bg-white/[0.02] transition-colors"
                style={{
                  display:'grid', gridTemplateColumns:'1fr 120px 120px 100px 32px',
                  alignItems:'center',
                  padding:'14px 20px',
                  borderBottom: index < athletes.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                }}>
                <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                  <div style={{
                    width:'36px', height:'36px', borderRadius:'50%', flexShrink:0,
                    background:'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25))',
                    border:'1px solid rgba(99,102,241,0.2)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'13px', fontWeight:'600', color:'#A5B4FC',
                  }}>
                    {athlete.first_name[0]}{athlete.last_name[0]}
                  </div>
                  <div>
                    <div style={{color:'#E0E0E0', fontSize:'14px', fontWeight:'500'}}>{athlete.first_name} {athlete.last_name}</div>
                    <div style={{color:'#333', fontSize:'11px', marginTop:'2px'}}>{athlete.email || 'Sin email'}</div>
                  </div>
                </div>
                <div style={{color:'#555', fontSize:'13px'}}>{athlete.sport}</div>
                <div style={{color:'#555', fontSize:'13px'}}>{athlete.category}</div>
                <div>
                  <span style={{
                    display:'inline-flex', alignItems:'center', gap:'5px',
                    padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600',
                    backgroundColor: athlete.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)',
                    color: athlete.status === 'active' ? '#10B981' : '#555',
                    border: `1px solid ${athlete.status === 'active' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  }}>
                    {athlete.status === 'active' ? '● Activo' : athlete.status}
                  </span>
                </div>
                <div style={{color:'#2A2A2A', fontSize:'16px', textAlign:'right'}}>→</div>
              </a>
            ))
          ) : (
            <div style={{padding:'60px 20px', textAlign:'center'}}>
              <p style={{color:'#333', marginBottom:'16px'}}>No hay deportistas en el club todavía</p>
              <a href="/athletes/nuevo" style={{
                padding:'8px 16px', borderRadius:'8px',
                background:'rgba(99,102,241,0.15)', color:'#A5B4FC',
                fontSize:'13px', fontWeight:'500',
              }}>
                Añadir el primero
              </a>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}