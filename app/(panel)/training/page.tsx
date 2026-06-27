import { supabase } from '@/app/lib/supabase'

export default async function Training() {
  const { data: sessions } = await supabase
    .from('training_sessions')
    .select('*')
    .order('date', { ascending: false })

  const typeConfig: Record<string, { color: string, bg: string }> = {
    'Velocidad': { color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
    'Resistencia': { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
    'Fuerza': { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    'Técnica': { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
    'Recuperación': { color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  }

  return (
    <main style={{minHeight:'100vh', backgroundColor:'#080808', padding:'32px 36px'}}>
      <div style={{maxWidth:'1000px', margin:'0 auto'}}>

        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'32px'}}>
          <div>
            <h1 style={{fontSize:'24px', fontWeight:'700', color:'#F0F0F0', letterSpacing:'-0.02em', margin:0}}>Entrenamientos</h1>
            <p style={{color:'#333', fontSize:'13px', marginTop:'6px'}}>{sessions?.length || 0} sesiones esta temporada</p>
          </div>
          <a href="/training/nuevo" style={{
            padding:'9px 16px', borderRadius:'9px',
            background:'linear-gradient(135deg, #6366F1, #8B5CF6)',
            color:'white', fontSize:'13px', fontWeight:'600',
            boxShadow:'0 0 20px rgba(99,102,241,0.3)',
          }}>
            + Nueva sesión
          </a>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
          {sessions && sessions.length > 0 ? (
            sessions.map((session) => {
              const config = typeConfig[session.type] || { color: '#555', bg: 'rgba(255,255,255,0.04)' }
              return (
                <div key={session.id} style={{
                  display:'flex', alignItems:'center', gap:'16px',
                  backgroundColor:'#0E0E0E',
                  border:'1px solid rgba(255,255,255,0.06)',
                  borderRadius:'14px', padding:'16px 20px',
                  borderLeft: `2px solid ${config.color}`,
                }}>
                  <div style={{
                    width:'48px', textAlign:'center', flexShrink:0,
                    backgroundColor:'rgba(255,255,255,0.03)',
                    borderRadius:'10px', padding:'8px 4px',
                  }}>
                    <div style={{fontSize:'20px', fontWeight:'700', color:'#E0E0E0', lineHeight:1}}>
                      {new Date(session.date + 'T00:00:00').getDate()}
                    </div>
                    <div style={{color:'#333', fontSize:'10px', textTransform:'uppercase', marginTop:'2px'}}>
                      {new Date(session.date + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short' })}
                    </div>
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{color:'#E0E0E0', fontSize:'14px', fontWeight:'600'}}>{session.title}</div>
                    <div style={{color:'#333', fontSize:'12px', marginTop:'3px', display:'flex', gap:'10px'}}>
                      {session.time && <span>{session.time}</span>}
                      {session.duration_min && <span>{session.duration_min} min</span>}
                      {session.location && <span>{session.location}</span>}
                    </div>
                  </div>
                  <span style={{
                    padding:'4px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600',
                    backgroundColor: config.bg, color: config.color,
                    border: `1px solid ${config.color}30`,
                    flexShrink:0,
                  }}>
                    {session.type}
                  </span>
                </div>
              )
            })
          ) : (
            <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'60px 20px', textAlign:'center'}}>
              <p style={{color:'#333', marginBottom:'16px'}}>No hay sesiones programadas</p>
              <a href="/training/nuevo" style={{color:'#6366F1', fontSize:'13px'}}>Crear la primera →</a>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}