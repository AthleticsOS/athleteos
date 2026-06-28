import { supabase } from '@/app/lib/supabase'
import PrintButton from '@/app/components/PrintButton'

type Props = { params: Promise<{ id: string }> }

export default async function AthleteReport({ params }: Props) {
  const { id } = await params

  const { data: athlete } = await supabase.from('athletes').select('*').eq('id', id).single()
  const { data: records } = await supabase.from('personal_records').select('*').eq('athlete_id', id).order('date', { ascending: false })
  const { data: sessions } = await supabase.from('athlete_sessions').select('*').eq('athlete_id', id).order('date', { ascending: false })
  const { data: weights } = await supabase.from('athlete_weights').select('*').eq('athlete_id', id).order('date', { ascending: false })
  const { data: tests } = await supabase.from('athlete_tests').select('*').eq('athlete_id', id).order('date', { ascending: false })
  const { data: results } = await supabase.from('competition_results').select('*, competitions(name, date, location)').eq('athlete_id', id).order('created_at', { ascending: false })

  if (!athlete) return <div>Deportista no encontrado</div>

  const age = athlete.birth_date
    ? Math.floor((new Date().getTime() - new Date(athlete.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  const lastWeight = weights?.[0]
  const lastTest = tests?.[0]
  const avgEffort = sessions && sessions.length > 0
    ? (sessions.reduce((sum, s) => sum + (s.effort || 0), 0) / sessions.length).toFixed(1)
    : null

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          @page { margin: 20mm; size: A4; }
        }
        body { font-family: -apple-system, 'Helvetica Neue', sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
        .page { max-width: 800px; margin: 0 auto; background: white; min-height: 100vh; }
        @media screen { .page { padding: 40px; box-shadow: 0 0 40px rgba(0,0,0,0.1); } }
        @media print { .page { padding: 0; } }
      `}</style>

      <div className="no-print" style={{backgroundColor:'#080808', padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50}}>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <a href={`/athletes/${id}`} style={{color:'#555', fontSize:'13px', textDecoration:'none'}}>← Volver al perfil</a>
          <span style={{color:'#2A2A2A'}}>·</span>
          <span style={{color:'#888', fontSize:'13px'}}>Informe de {athlete.first_name} {athlete.last_name}</span>
        </div>
        <PrintButton />
      </div>

      <div className="page">

        <div style={{borderBottom:'2px solid #111', paddingBottom:'24px', marginBottom:'28px'}}>
          <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.1em', color:'#999', marginBottom:'8px'}}>Informe del atleta · WeAthletics</div>
              <h1 style={{fontSize:'32px', fontWeight:'800', color:'#111', letterSpacing:'-0.03em', margin:'0 0 8px'}}>{athlete.first_name} {athlete.last_name}</h1>
              <div style={{display:'flex', gap:'16px', flexWrap:'wrap'}}>
                {athlete.sport && <span style={{color:'#666', fontSize:'14px'}}>{athlete.sport}</span>}
                {athlete.category && <span style={{color:'#666', fontSize:'14px'}}>· {athlete.category}</span>}
                {age && <span style={{color:'#666', fontSize:'14px'}}>· {age} años</span>}
                {athlete.birth_date && <span style={{color:'#666', fontSize:'14px'}}>· Nacido el {new Date(athlete.birth_date).toLocaleDateString('es-ES', {day:'numeric', month:'long', year:'numeric'})}</span>}
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:'11px', color:'#999', marginBottom:'4px'}}>Generado el</div>
              <div style={{fontSize:'13px', color:'#555', fontWeight:'500'}}>{new Date().toLocaleDateString('es-ES', {day:'numeric', month:'long', year:'numeric'})}</div>
            </div>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'32px'}}>
          {[
            { label:'Sesiones', value: sessions?.length || 0, unit:'' },
            { label:'Marcas personales', value: records?.length || 0, unit:'' },
            { label:'Esfuerzo medio', value: avgEffort || '—', unit:'/10' },
            { label:'Competiciones', value: results?.length || 0, unit:'' },
          ].map(stat => (
            <div key={stat.label} style={{backgroundColor:'#f8f8f8', borderRadius:'10px', padding:'14px', textAlign:'center'}}>
              <div style={{fontSize:'10px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', color:'#999', marginBottom:'6px'}}>{stat.label}</div>
              <div style={{fontSize:'24px', fontWeight:'800', color:'#111'}}>{stat.value}<span style={{fontSize:'14px', color:'#999'}}>{stat.unit}</span></div>
            </div>
          ))}
        </div>

        {records && records.length > 0 && (
          <div style={{marginBottom:'32px'}}>
            <h2 style={{fontSize:'16px', fontWeight:'700', color:'#111', letterSpacing:'-0.01em', margin:'0 0 14px', paddingBottom:'8px', borderBottom:'1px solid #eee'}}>Marcas personales</h2>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead>
                <tr>
                  {['Prueba', 'Marca', 'Competición', 'Fecha'].map(h => (
                    <th key={h} style={{textAlign:'left', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', color:'#999', padding:'8px 12px', backgroundColor:'#f8f8f8'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={r.id} style={{backgroundColor: i % 2 === 0 ? 'white' : '#fafafa'}}>
                    <td style={{padding:'10px 12px', fontSize:'13px', fontWeight:'500', color:'#333'}}>{r.discipline}</td>
                    <td style={{padding:'10px 12px', fontSize:'14px', fontWeight:'700', color:'#6366F1', fontFamily:'monospace'}}>{r.mark}</td>
                    <td style={{padding:'10px 12px', fontSize:'12px', color:'#666'}}>{r.competition}</td>
                    <td style={{padding:'10px 12px', fontSize:'12px', color:'#666'}}>{r.date ? new Date(r.date).toLocaleDateString('es-ES', {day:'numeric', month:'short', year:'numeric'}) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(lastWeight || lastTest) && (
          <div style={{marginBottom:'32px'}}>
            <h2 style={{fontSize:'16px', fontWeight:'700', color:'#111', letterSpacing:'-0.01em', margin:'0 0 14px', paddingBottom:'8px', borderBottom:'1px solid #eee'}}>Datos físicos más recientes</h2>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
              {lastWeight && (
                <div style={{backgroundColor:'#f8f8f8', borderRadius:'10px', padding:'16px'}}>
                  <div style={{fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', color:'#999', marginBottom:'12px'}}>Últimas pesas · {new Date(lastWeight.date+'T00:00:00').toLocaleDateString('es-ES', {day:'numeric', month:'short'})}</div>
                  <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
                    {[
                      {label:'Sentadilla', value:lastWeight.sentadilla},
                      {label:'Hip Thrust', value:lastWeight.hip_thrust},
                      {label:'Peso Muerto', value:lastWeight.peso_muerto},
                      {label:'Press Banca', value:lastWeight.press_banca},
                      {label:'Cargada', value:lastWeight.cargada},
                    ].filter(p => p.value).map(p => (
                      <div key={p.label} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <span style={{fontSize:'13px', color:'#555'}}>{p.label}</span>
                        <span style={{fontSize:'14px', fontWeight:'700', color:'#111', fontFamily:'monospace'}}>{p.value} kg</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {lastTest && (
                <div style={{backgroundColor:'#f8f8f8', borderRadius:'10px', padding:'16px'}}>
                  <div style={{fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', color:'#999', marginBottom:'12px'}}>Último test · {new Date(lastTest.date+'T00:00:00').toLocaleDateString('es-ES', {day:'numeric', month:'short'})}</div>
                  <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
                    {[
                      {label:'Peso corporal', value:lastTest.weight_kg, unit:'kg'},
                      {label:'Grasa', value:lastTest.fat_pct, unit:'%'},
                      {label:'Músculo', value:lastTest.muscle_kg, unit:'kg'},
                      {label:'Salto horizontal', value:lastTest.jump_horizontal, unit:'m'},
                      {label:'CMJ con brazos', value:lastTest.cmj_arms, unit:'cm'},
                      {label:'Sprint 60m', value:lastTest.sprint_60m, unit:'s'},
                      {label:'Sprint 100m', value:lastTest.sprint_100m, unit:'s'},
                    ].filter(p => p.value).map(p => (
                      <div key={p.label} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <span style={{fontSize:'13px', color:'#555'}}>{p.label}</span>
                        <span style={{fontSize:'14px', fontWeight:'700', color:'#111', fontFamily:'monospace'}}>{p.value} {p.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {sessions && sessions.length > 0 && (
          <div style={{marginBottom:'32px'}}>
            <h2 style={{fontSize:'16px', fontWeight:'700', color:'#111', letterSpacing:'-0.01em', margin:'0 0 14px', paddingBottom:'8px', borderBottom:'1px solid #eee'}}>Historial de sesiones ({sessions.length} total)</h2>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead>
                <tr>
                  {['Fecha', 'Ejercicio', 'Media', 'Esfuerzo'].map(h => (
                    <th key={h} style={{textAlign:'left', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', color:'#999', padding:'8px 12px', backgroundColor:'#f8f8f8'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.slice(0, 20).map((s, i) => (
                  <tr key={s.id} style={{backgroundColor: i % 2 === 0 ? 'white' : '#fafafa'}}>
                    <td style={{padding:'8px 12px', fontSize:'12px', color:'#666', whiteSpace:'nowrap'}}>{new Date(s.date+'T00:00:00').toLocaleDateString('es-ES', {day:'numeric', month:'short'})}</td>
                    <td style={{padding:'8px 12px', fontSize:'12px', color:'#333', maxWidth:'280px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{s.exercise}</td>
                    <td style={{padding:'8px 12px', fontSize:'12px', fontWeight:'600', color:'#6366F1', fontFamily:'monospace'}}>{s.average || '—'}</td>
                    <td style={{padding:'8px 12px'}}>
                      <span style={{padding:'2px 8px', borderRadius:'4px', fontSize:'11px', fontWeight:'600', backgroundColor: s.effort >= 8 ? '#fee2e2' : s.effort >= 6 ? '#fef3c7' : '#f0fdf4', color: s.effort >= 8 ? '#dc2626' : s.effort >= 6 ? '#d97706' : '#16a34a'}}>
                        {s.effort}/10
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {results && results.length > 0 && (
          <div style={{marginBottom:'32px'}}>
            <h2 style={{fontSize:'16px', fontWeight:'700', color:'#111', letterSpacing:'-0.01em', margin:'0 0 14px', paddingBottom:'8px', borderBottom:'1px solid #eee'}}>Historial de competiciones</h2>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead>
                <tr>
                  {['Competición', 'Prueba', 'Marca', 'Pos.', 'Fecha'].map(h => (
                    <th key={h} style={{textAlign:'left', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', color:'#999', padding:'8px 12px', backgroundColor:'#f8f8f8'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r.id} style={{backgroundColor: i % 2 === 0 ? 'white' : '#fafafa'}}>
                    <td style={{padding:'8px 12px', fontSize:'12px', color:'#333'}}>{r.competitions?.name}</td>
                    <td style={{padding:'8px 12px', fontSize:'12px', color:'#666'}}>{r.discipline}</td>
                    <td style={{padding:'8px 12px', fontSize:'13px', fontWeight:'700', color:'#6366F1', fontFamily:'monospace'}}>{r.mark}</td>
                    <td style={{padding:'8px 12px', fontSize:'13px', fontWeight:'700', color: r.position === 1 ? '#d97706' : '#666'}}>{r.position}º</td>
                    <td style={{padding:'8px 12px', fontSize:'12px', color:'#666'}}>{r.competitions?.date ? new Date(r.competitions.date).toLocaleDateString('es-ES', {day:'numeric', month:'short', year:'numeric'}) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{borderTop:'1px solid #eee', paddingTop:'16px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <span style={{fontSize:'11px', color:'#ccc'}}>Generado por AthleteOS · athleteos-lovat.vercel.app</span>
          <span style={{fontSize:'11px', color:'#ccc'}}>WeAthletics · {new Date().getFullYear()}</span>
        </div>

      </div>
    </>
  )
}