import { supabase } from '@/app/lib/supabase'

type Props = { params: Promise<{ id: string }> }

export default async function Tiempos({ params }: Props) {
  const { id } = await params

  const { data: athlete } = await supabase.from('athletes').select('*').eq('id', id).single()
  const { data: sessions } = await supabase.from('athlete_sessions').select('*').eq('athlete_id', id).order('date', { ascending: false })

  if (!athlete) return <main style={{minHeight:'100vh',backgroundColor:'#080808',padding:'32px'}}><p style={{color:'#555'}}>No encontrado</p></main>

  const totalSessions = sessions?.length || 0
  const avgEffort = sessions && sessions.length > 0
    ? (sessions.reduce((sum, s) => sum + (s.effort || 0), 0) / sessions.length).toFixed(1)
    : null

  const effortColor = (e: number) => e >= 9 ? '#EF4444' : e >= 7 ? '#F59E0B' : '#10B981'

  return (
    <main style={{minHeight:'100vh', backgroundColor:'#080808', padding:'32px 36px'}}>
      <div style={{maxWidth:'1000px', margin:'0 auto'}}>

        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'28px'}}>
          <div>
            <a href={`/athletes/${id}`} style={{color:'#444', fontSize:'13px'}}>← Perfil</a>
            <h1 style={{fontSize:'24px', fontWeight:'700', color:'#F0F0F0', letterSpacing:'-0.02em', margin:'6px 0 4px'}}>
              Registro de tiempos
            </h1>
            <p style={{color:'#333', fontSize:'13px', margin:0}}>
              {athlete.first_name} {athlete.last_name} · {athlete.sport}
            </p>
          </div>
          <a href={`/athletes/${id}/sesion`} style={{
            padding:'9px 16px', borderRadius:'9px',
            background:'linear-gradient(135deg,#6366F1,#8B5CF6)',
            color:'white', fontSize:'13px', fontWeight:'600',
            boxShadow:'0 0 16px rgba(99,102,241,0.3)',
          }}>
            + Nueva sesión
          </a>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'20px'}}>
          {[
            { label:'Total sesiones', value: String(totalSessions), color:'#6366F1' },
            { label:'Esfuerzo medio', value: avgEffort ? avgEffort + '/10' : '—', color:'#F59E0B' },
            { label:'Alta intensidad', value: String(sessions?.filter(s => s.effort >= 8).length || 0), color:'#EF4444' },
            { label:'Recuperación', value: String(sessions?.filter(s => s.effort <= 5).length || 0), color:'#10B981' },
          ].map(stat => (
            <div key={stat.label} style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', padding:'16px'}}>
              <div style={{color:'#333', fontSize:'10px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px'}}>{stat.label}</div>
              <div style={{fontSize:'24px', fontWeight:'700', color:stat.color, letterSpacing:'-0.02em'}}>{stat.value}</div>
            </div>
          ))}
        </div>

        {sessions && sessions.length > 0 ? (
          <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden'}}>
            <div style={{display:'grid', gridTemplateColumns:'90px 1fr 140px 100px 80px', gap:'0', padding:'10px 20px', borderBottom:'1px solid rgba(255,255,255,0.04)', backgroundColor:'rgba(255,255,255,0.02)'}}>
              {['Fecha', 'Ejercicio / Series', 'Tiempos', 'Media', 'Esfuerzo'].map(h => (
                <div key={h} style={{color:'#2A2A2A', fontSize:'10px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.07em'}}>{h}</div>
              ))}
            </div>

            {sessions.map((session, index) => (
              <div key={session.id} style={{
                display:'grid', gridTemplateColumns:'90px 1fr 140px 100px 80px',
                gap:'0', padding:'14px 20px',
                borderBottom: index < sessions.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                alignItems:'start',
              }}>
                <div style={{paddingTop:'2px'}}>
                  <div style={{color:'#E0E0E0', fontSize:'14px', fontWeight:'600'}}>
                    {new Date(session.date + 'T00:00:00').getDate()}
                  </div>
                  <div style={{color:'#333', fontSize:'11px', textTransform:'uppercase'}}>
                    {new Date(session.date + 'T00:00:00').toLocaleDateString('es-ES', {month:'short'})}
                    {' '}
                    {new Date(session.date + 'T00:00:00').getFullYear().toString().slice(2)}
                  </div>
                </div>

                <div style={{paddingRight:'16px'}}>
                  <div style={{color:'#CCC', fontSize:'13px', fontWeight:'500'}}>{session.exercise}</div>
                  {session.notes && <div style={{color:'#444', fontSize:'11px', marginTop:'3px', fontStyle:'italic'}}>{session.notes}</div>}
                  {session.target_distance && session.target_percentage && (
                    <div style={{marginTop:'4px'}}>
                      <span style={{padding:'2px 8px', borderRadius:'4px', fontSize:'10px', fontWeight:'600', backgroundColor:'rgba(99,102,241,0.1)', color:'#818CF8'}}>
                        {session.target_distance}m al {session.target_percentage}%
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  {session.times ? (
                    <div style={{display:'flex', flexWrap:'wrap', gap:'4px'}}>
                      {session.times.split('/').map((t: string, i: number) => (
                        <span key={i} style={{
                          padding:'2px 7px', borderRadius:'4px',
                          backgroundColor:'rgba(255,255,255,0.04)',
                          color:'#888', fontSize:'12px', fontFamily:'monospace',
                          border:'1px solid rgba(255,255,255,0.06)',
                        }}>
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{color:'#333', fontSize:'12px'}}>—</span>
                  )}
                </div>

                <div>
                  {session.average ? (
                    <span style={{color:'#A5B4FC', fontSize:'14px', fontWeight:'700', fontFamily:'monospace'}}>
                      {session.average}
                    </span>
                  ) : (
                    <span style={{color:'#333', fontSize:'12px'}}>—</span>
                  )}
                </div>

                <div>
                  {session.effort ? (
                    <span style={{
                      padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'700',
                      backgroundColor: `${effortColor(session.effort)}15`,
                      color: effortColor(session.effort),
                      border: `1px solid ${effortColor(session.effort)}30`,
                    }}>
                      {session.effort}/10
                    </span>
                  ) : (
                    <span style={{color:'#333', fontSize:'12px'}}>—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'60px', textAlign:'center'}}>
            <p style={{color:'#333', marginBottom:'16px'}}>No hay sesiones registradas todavía</p>
            <a href={`/athletes/${id}/sesion`} style={{color:'#6366F1', fontSize:'13px'}}>+ Añadir la primera →</a>
          </div>
        )}

      </div>
    </main>
  )
}