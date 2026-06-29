import { supabase } from '@/app/lib/supabase'

export default async function CoachView() {
  const { data: athletes } = await supabase.from('athletes').select('*').eq('status', 'active')

  const athleteIds = athletes?.map(a => a.id) || []

  const { data: allSessions } = await supabase
    .from('athlete_sessions')
    .select('*')
    .in('athlete_id', athleteIds)
    .order('date', { ascending: false })

  const { data: allWeights } = await supabase
    .from('athlete_weights')
    .select('*')
    .in('athlete_id', athleteIds)
    .order('date', { ascending: false })

  const { data: allTests } = await supabase
    .from('athlete_tests')
    .select('*')
    .in('athlete_id', athleteIds)
    .order('date', { ascending: false })

  const { data: allRecords } = await supabase
    .from('personal_records')
    .select('*')
    .in('athlete_id', athleteIds)

  const getLastSession = (id: string) => allSessions?.find(s => s.athlete_id === id)
  const getLastWeight = (id: string) => allWeights?.find(w => w.athlete_id === id)
  const getLastTest = (id: string) => allTests?.find(t => t.athlete_id === id)
  const getRecordCount = (id: string) => allRecords?.filter(r => r.athlete_id === id).length || 0
  const getSessionCount = (id: string) => allSessions?.filter(s => s.athlete_id === id).length || 0

  const daysSince = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr + 'T00:00:00').getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <main style={{minHeight:'100vh', backgroundColor:'#080808', padding:'32px 36px'}}>
      <div style={{maxWidth:'1100px', margin:'0 auto'}}>

        <div style={{marginBottom:'32px'}}>
          <h1 style={{fontSize:'24px', fontWeight:'700', color:'#F0F0F0', letterSpacing:'-0.02em', margin:0}}>
            Vista del entrenador
          </h1>
          <p style={{color:'#333', fontSize:'13px', marginTop:'6px'}}>
            {athletes?.length || 0} atletas activos · WeAthletics
          </p>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'24px'}}>
          {[
            { label:'Atletas activos', value: athletes?.length || 0, color:'#4BA3D9' },
            { label:'Sesiones totales', value: allSessions?.length || 0, color:'#F59E0B' },
            { label:'Registros pesas', value: allWeights?.length || 0, color:'#EF4444' },
            { label:'Tests realizados', value: allTests?.length || 0, color:'#10B981' },
          ].map(stat => (
            <div key={stat.label} style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'18px'}}>
              <div style={{color:'#333', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px'}}>{stat.label}</div>
              <div style={{fontSize:'28px', fontWeight:'700', color:stat.color, letterSpacing:'-0.02em'}}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
          {athletes?.map(athlete => {
            const lastSession = getLastSession(athlete.id)
            const lastWeight = getLastWeight(athlete.id)
            const lastTest = getLastTest(athlete.id)
            const recordCount = getRecordCount(athlete.id)
            const sessionCount = getSessionCount(athlete.id)
            const daysSinceSession = lastSession ? daysSince(lastSession.date) : null
            const initials = athlete.first_name[0] + athlete.last_name[0]

            const alertLevel = daysSinceSession === null ? 'none' :
              daysSinceSession > 14 ? 'high' :
              daysSinceSession > 7 ? 'medium' : 'ok'

            const pesas = lastWeight ? [
              { label: 'Sentadilla', value: lastWeight.sentadilla },
              { label: 'Hip Thrust', value: lastWeight.hip_thrust },
              { label: 'P. Muerto', value: lastWeight.peso_muerto },
              { label: 'Banca', value: lastWeight.press_banca },
              { label: 'Cargada', value: lastWeight.cargada },
            ].filter(p => p.value) : []

            return (
              <a href={`/athletes/${athlete.id}`} key={athlete.id} style={{
                backgroundColor:'#0E0E0E',
                border:`1px solid ${alertLevel === 'high' ? 'rgba(239,68,68,0.25)' : alertLevel === 'medium' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius:'16px', padding:'20px',
                display:'flex', flexDirection:'column', gap:'14px',
              }}>
                <div style={{display:'flex', alignItems:'center', gap:'14px'}}>
                  <div style={{
                    width:'44px', height:'44px', borderRadius:'50%', flexShrink:0,
                    background:'linear-gradient(135deg,rgba(75,163,217,0.3),rgba(75,163,217,0.3))',
                    border:'1px solid rgba(75,163,217,0.3)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'15px', fontWeight:'700', color:'#4BA3D9',
                  }}>{initials}</div>
                  <div style={{flex:1}}>
                    <div style={{color:'#E0E0E0', fontSize:'15px', fontWeight:'600'}}>{athlete.first_name} {athlete.last_name}</div>
                    <div style={{color:'#444', fontSize:'12px', marginTop:'2px'}}>{athlete.sport} · {athlete.category} · {sessionCount} sesiones registradas</div>
                  </div>
                  <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                    {alertLevel === 'high' && (
                      <span style={{padding:'4px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600', backgroundColor:'rgba(239,68,68,0.1)', color:'#EF4444', border:'1px solid rgba(239,68,68,0.2)'}}>
                        ⚠ Sin entrenar {daysSinceSession}d
                      </span>
                    )}
                    {alertLevel === 'medium' && (
                      <span style={{padding:'4px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600', backgroundColor:'rgba(245,158,11,0.1)', color:'#F59E0B', border:'1px solid rgba(245,158,11,0.2)'}}>
                        {daysSinceSession}d sin sesion
                      </span>
                    )}
                    {alertLevel === 'ok' && (
                      <span style={{padding:'4px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600', backgroundColor:'rgba(16,185,129,0.1)', color:'#10B981', border:'1px solid rgba(16,185,129,0.2)'}}>
                        ● Al dia
                      </span>
                    )}
                    <span style={{padding:'4px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600', backgroundColor:'rgba(75,163,217,0.1)', color:'#4BA3D9', border:'1px solid rgba(75,163,217,0.2)'}}>
                      {recordCount} marcas
                    </span>
                  </div>
                </div>

                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px'}}>
                  <div style={{backgroundColor:'rgba(255,255,255,0.02)', borderRadius:'10px', padding:'12px'}}>
                    <div style={{color:'#333', fontSize:'10px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px'}}>Ultima sesion</div>
                    {lastSession ? (
                      <>
                        <div style={{color: daysSinceSession! > 7 ? '#F59E0B' : '#888', fontSize:'13px', fontWeight:'600'}}>
                          Hace {daysSinceSession} días
                        </div>
                        <div style={{color:'#444', fontSize:'12px', marginTop:'4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{lastSession.exercise}</div>
                        {lastSession.average && <div style={{color:'#4BA3D9', fontSize:'12px', fontFamily:'monospace', marginTop:'2px'}}>Media: {lastSession.average}</div>}
                        {lastSession.effort && <div style={{color:'#555', fontSize:'11px', marginTop:'2px'}}>Esfuerzo: {lastSession.effort}/10</div>}
                      </>
                    ) : (
                      <div style={{color:'#2A2A2A', fontSize:'12px'}}>Sin sesiones registradas</div>
                    )}
                  </div>

                  <div style={{backgroundColor:'rgba(255,255,255,0.02)', borderRadius:'10px', padding:'12px'}}>
                    <div style={{color:'#333', fontSize:'10px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px'}}>Ultimas pesas</div>
                    {pesas.length > 0 ? (
                      <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
                        {pesas.map(p => (
                          <div key={p.label} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <span style={{color:'#555', fontSize:'11px'}}>{p.label}</span>
                            <span style={{color:'#F59E0B', fontSize:'13px', fontWeight:'700', fontFamily:'monospace'}}>{p.value}kg</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{color:'#2A2A2A', fontSize:'12px'}}>Sin registros de pesas</div>
                    )}
                  </div>

                  <div style={{backgroundColor:'rgba(255,255,255,0.02)', borderRadius:'10px', padding:'12px'}}>
                    <div style={{color:'#333', fontSize:'10px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px'}}>Ultimo test</div>
                    {lastTest ? (
                      <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
                        {lastTest.weight_kg && (
                          <div style={{display:'flex', justifyContent:'space-between'}}>
                            <span style={{color:'#555', fontSize:'11px'}}>Peso</span>
                            <span style={{color:'#888', fontSize:'13px', fontWeight:'700', fontFamily:'monospace'}}>{lastTest.weight_kg}kg</span>
                          </div>
                        )}
                        {lastTest.sprint_60m && (
                          <div style={{display:'flex', justifyContent:'space-between'}}>
                            <span style={{color:'#555', fontSize:'11px'}}>60m</span>
                            <span style={{color:'#10B981', fontSize:'13px', fontWeight:'700', fontFamily:'monospace'}}>{lastTest.sprint_60m}s</span>
                          </div>
                        )}
                        {lastTest.sprint_100m && (
                          <div style={{display:'flex', justifyContent:'space-between'}}>
                            <span style={{color:'#555', fontSize:'11px'}}>100m</span>
                            <span style={{color:'#10B981', fontSize:'13px', fontWeight:'700', fontFamily:'monospace'}}>{lastTest.sprint_100m}s</span>
                          </div>
                        )}
                        {lastTest.cmj_arms && (
                          <div style={{display:'flex', justifyContent:'space-between'}}>
                            <span style={{color:'#555', fontSize:'11px'}}>CMJ</span>
                            <span style={{color:'#4BA3D9', fontSize:'13px', fontWeight:'700', fontFamily:'monospace'}}>{lastTest.cmj_arms}cm</span>
                          </div>
                        )}
                        {!lastTest.weight_kg && !lastTest.sprint_60m && !lastTest.sprint_100m && !lastTest.cmj_arms && (
                          <div style={{color:'#2A2A2A', fontSize:'12px'}}>Sin datos</div>
                        )}
                      </div>
                    ) : (
                      <div style={{color:'#2A2A2A', fontSize:'12px'}}>Sin tests realizados</div>
                    )}
                  </div>
                </div>

              </a>
            )
          })}
        </div>
      </div>
    </main>
  )
}