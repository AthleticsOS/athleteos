import { supabase } from '@/app/lib/supabase'
import ProgressChart from '@/app/components/ProgressChart'

type Props = { params: Promise<{ id: string }> }

export default async function AthleteProfile({ params }: Props) {
  const { id } = await params

  const { data: athlete } = await supabase.from('athletes').select('*').eq('id', id).single()
  const { data: records } = await supabase.from('personal_records').select('*').eq('athlete_id', id).order('date', { ascending: false })
  const { data: results } = await supabase.from('competition_results').select('*, competitions(name, date, location)').eq('athlete_id', id).order('created_at', { ascending: false })
  const { data: sessions } = await supabase.from('athlete_sessions').select('*').eq('athlete_id', id).order('date', { ascending: false }).limit(5)
  const { data: weights } = await supabase.from('athlete_weights').select('*').eq('athlete_id', id).order('date', { ascending: false }).limit(5)
  const { data: tests } = await supabase.from('athlete_tests').select('*').eq('athlete_id', id).order('date', { ascending: false }).limit(3)

  if (!athlete) return (
    <main style={{minHeight:'100vh', backgroundColor:'#080808', padding:'32px 36px'}}>
      <p style={{color:'#555'}}>Deportista no encontrado</p>
    </main>
  )

  const initials = `${athlete.first_name[0]}${athlete.last_name[0]}`
  const age = athlete.birth_date
    ? Math.floor((new Date().getTime() - new Date(athlete.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  const chartDataByDiscipline: Record<string, { fecha: string, marca: number, competicion: string }[]> = {}
  results?.forEach((result) => {
    if (!result.mark || !result.competitions?.date) return
    const numericMark = parseFloat(result.mark.replace(/[^0-9.]/g, ''))
    if (isNaN(numericMark)) return
    if (!chartDataByDiscipline[result.discipline]) chartDataByDiscipline[result.discipline] = []
    chartDataByDiscipline[result.discipline].push({
      fecha: new Date(result.competitions.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      marca: numericMark,
      competicion: result.competitions.name
    })
  })

  const mainDiscipline = Object.keys(chartDataByDiscipline)[0]

  return (
    <main style={{minHeight:'100vh', backgroundColor:'#080808', padding:'32px 36px'}}>
      <div style={{maxWidth:'1000px', margin:'0 auto'}}>

        <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'24px', marginBottom:'12px', position:'relative', overflow:'hidden'}}>
          <div style={{position:'absolute', top:0, left:0, right:0, height:'1px', background:'linear-gradient(90deg,transparent,rgba(99,102,241,0.4),transparent)'}}/>
          <div style={{display:'flex', alignItems:'flex-start', gap:'18px'}}>
            <div style={{width:'64px', height:'64px', borderRadius:'50%', flexShrink:0, background:'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))', border:'1px solid rgba(99,102,241,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', fontWeight:'700', color:'#A5B4FC'}}>
              {initials}
            </div>
            <div style={{flex:1}}>
              <h1 style={{fontSize:'22px', fontWeight:'700', color:'#F0F0F0', letterSpacing:'-0.02em', margin:0}}>
                {athlete.first_name} {athlete.last_name}
              </h1>
              <div style={{display:'flex', gap:'12px', marginTop:'6px', flexWrap:'wrap'}}>
                {athlete.sport && <span style={{color:'#444', fontSize:'13px'}}>{athlete.sport}</span>}
                {athlete.category && <><span style={{color:'#222'}}>·</span><span style={{color:'#444', fontSize:'13px'}}>{athlete.category}</span></>}
                {age && <><span style={{color:'#222'}}>·</span><span style={{color:'#444', fontSize:'13px'}}>{age} años</span></>}
              </div>
              <div style={{display:'flex', gap:'8px', marginTop:'10px', flexWrap:'wrap'}}>
                <span style={{padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600', backgroundColor:'rgba(16,185,129,0.1)', color:'#10B981', border:'1px solid rgba(16,185,129,0.2)'}}>● Activo</span>
                {records && records.length > 0 && <span style={{padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600', backgroundColor:'rgba(99,102,241,0.1)', color:'#A5B4FC', border:'1px solid rgba(99,102,241,0.2)'}}>{records.length} marcas personales</span>}
                {sessions && sessions.length > 0 && <span style={{padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600', backgroundColor:'rgba(245,158,11,0.1)', color:'#F59E0B', border:'1px solid rgba(245,158,11,0.2)'}}>{sessions.length} sesiones registradas</span>}
              </div>
            </div>
            <a href={`/athletes/${id}/edit`} style={{padding:'8px 16px', borderRadius:'9px', backgroundColor:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#888', fontSize:'13px', fontWeight:'500', flexShrink:0}}>
              Editar
            </a>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'12px'}}>
          {[
            { href:`/athletes/${id}/sesion`, label:'+ Nueva sesión', color:'#6366F1', bg:'rgba(99,102,241,0.12)', border:'rgba(99,102,241,0.25)' },
            { href:`/athletes/${id}/pesas`, label:'+ Registro pesas', color:'#F59E0B', bg:'rgba(245,158,11,0.1)', border:'rgba(245,158,11,0.25)' },
            { href:`/athletes/${id}/test`, label:'+ Test físico', color:'#10B981', bg:'rgba(16,185,129,0.1)', border:'rgba(16,185,129,0.25)' },
            { href:`/athletes/${id}/marca`, label:'+ Marca personal', color:'#A5B4FC', bg:'rgba(165,180,252,0.08)', border:'rgba(165,180,252,0.2)' },
            { href:`/athletes/${id}/edit`, label:'✎ Editar perfil', color:'#888', bg:'rgba(255,255,255,0.04)', border:'rgba(255,255,255,0.08)' },
            { href:`/competitions`, label:'🏆 Competiciones', color:'#EAB308', bg:'rgba(234,179,8,0.1)', border:'rgba(234,179,8,0.25)' },
          ].map(action => (
            <a key={action.href} href={action.href} style={{display:'flex', alignItems:'center', justifyContent:'center', padding:'11px', borderRadius:'10px', fontSize:'13px', fontWeight:'600', backgroundColor:action.bg, color:action.color, border:`1px solid ${action.border}`}}>
              {action.label}
            </a>
          ))}
        </div>

        {mainDiscipline && chartDataByDiscipline[mainDiscipline].length >= 2 && (
          <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'20px', marginBottom:'12px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px'}}>
              <p style={{color:'#888', fontSize:'13px', fontWeight:'500', margin:0}}>Progresión — {mainDiscipline}</p>
              <span style={{color:'#333', fontSize:'11px'}}>{chartDataByDiscipline[mainDiscipline].length} competiciones</span>
            </div>
            <ProgressChart data={chartDataByDiscipline[mainDiscipline]} unit="s" lowerIsBetter={true} />
          </div>
        )}

        <div style={{display:'grid', gridTemplateColumns:'1fr 260px', gap:'12px', marginBottom:'12px'}}>
          <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
              <p style={{color:'#888', fontSize:'13px', fontWeight:'500', margin:0}}>Marcas personales</p>
              <a href={`/athletes/${id}/marca`} style={{color:'#6366F1', fontSize:'12px', fontWeight:'500'}}>+ Añadir →</a>
            </div>
            {records && records.length > 0 ? (
              records.map((record, index) => (
                <div key={record.id} style={{display:'flex', alignItems:'center', gap:'12px', padding:'14px 18px', borderBottom: index < records.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none'}}>
                  <div style={{flex:1}}>
                    <div style={{color:'#CCC', fontSize:'14px', fontWeight:'500'}}>{record.discipline}</div>
                    <div style={{color:'#333', fontSize:'11px', marginTop:'2px'}}>{record.competition} · {record.date ? new Date(record.date).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' }) : ''}</div>
                  </div>
                  <div style={{color:'#A5B4FC', fontSize:'15px', fontWeight:'700', fontFamily:'monospace'}}>{record.mark}</div>
                  <div style={{width:'6px', height:'6px', borderRadius:'50%', backgroundColor:'#F59E0B', flexShrink:0}}/>
                </div>
              ))
            ) : (
              <div style={{padding:'40px 18px', textAlign:'center'}}>
                <p style={{color:'#333', fontSize:'13px', marginBottom:'12px'}}>Sin marcas todavía</p>
                <a href={`/athletes/${id}/marca`} style={{color:'#6366F1', fontSize:'12px'}}>+ Añadir primera marca →</a>
              </div>
            )}
          </div>

          <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden'}}>
            <div style={{padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
              <p style={{color:'#888', fontSize:'13px', fontWeight:'500', margin:0}}>Información</p>
            </div>
            <div style={{padding:'16px 18px', display:'flex', flexDirection:'column', gap:'14px'}}>
              {[
                { label:'Email', value: athlete.email },
                { label:'Teléfono', value: athlete.phone },
                { label:'Nacimiento', value: athlete.birth_date ? new Date(athlete.birth_date).toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' }) : null },
                { label:'Deporte', value: athlete.sport },
                { label:'Categoría', value: athlete.category },
              ].filter(i => i.value).map(item => (
                <div key={item.label}>
                  <div style={{color:'#2A2A2A', fontSize:'10px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'3px'}}>{item.label}</div>
                  <div style={{color:'#888', fontSize:'13px'}}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {sessions && sessions.length > 0 && (
          <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden', marginBottom:'12px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
              <p style={{color:'#888', fontSize:'13px', fontWeight:'500', margin:0}}>Últimas sesiones</p>
              <a href={`/athletes/${id}/sesion`} style={{color:'#6366F1', fontSize:'12px', fontWeight:'500'}}>+ Nueva →</a>
            </div>
            {sessions.map((session, index) => (
              <div key={session.id} style={{display:'flex', alignItems:'center', gap:'14px', padding:'14px 18px', borderBottom: index < sessions.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none'}}>
                <div style={{width:'40px', textAlign:'center', flexShrink:0, backgroundColor:'rgba(255,255,255,0.03)', borderRadius:'8px', padding:'6px 4px'}}>
                  <div style={{fontSize:'16px', fontWeight:'700', color:'#E0E0E0', lineHeight:1}}>{new Date(session.date + 'T00:00:00').getDate()}</div>
                  <div style={{color:'#333', fontSize:'9px', textTransform:'uppercase'}}>{new Date(session.date + 'T00:00:00').toLocaleDateString('es-ES', { month:'short' })}</div>
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{color:'#CCC', fontSize:'13px', fontWeight:'500', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{session.exercise}</div>
                  {session.times && <div style={{color:'#333', fontSize:'11px', fontFamily:'monospace', marginTop:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{session.times}</div>}
                </div>
                <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px', flexShrink:0}}>
                  {session.average && <div style={{color:'#A5B4FC', fontSize:'13px', fontWeight:'700', fontFamily:'monospace'}}>{session.average}</div>}
                  <div style={{padding:'2px 8px', borderRadius:'20px', fontSize:'10px', fontWeight:'600', backgroundColor:'rgba(99,102,241,0.1)', color:'#818CF8'}}>{session.effort}/10</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {weights && weights.length > 0 && (
          <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden', marginBottom:'12px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
              <p style={{color:'#888', fontSize:'13px', fontWeight:'500', margin:0}}>Últimos registros de pesas</p>
              <a href={`/athletes/${id}/pesas`} style={{color:'#F59E0B', fontSize:'12px', fontWeight:'500'}}>+ Nuevo →</a>
            </div>
            {weights.map((w, index) => (
              <div key={w.id} style={{display:'flex', alignItems:'center', gap:'12px', padding:'14px 18px', borderBottom: index < weights.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', flexWrap:'wrap'}}>
                <div style={{color:'#444', fontSize:'12px', minWidth:'70px'}}>{new Date(w.date + 'T00:00:00').toLocaleDateString('es-ES', { day:'numeric', month:'short' })}</div>
                {[
                  { label:'Sent.', value: w.sentadilla },
                  { label:'Hip', value: w.hip_thrust },
                  { label:'P.Muerto', value: w.peso_muerto },
                  { label:'Banca', value: w.press_banca },
                  { label:'Cargada', value: w.cargada },
                ].filter(f => f.value).map(f => (
                  <div key={f.label} style={{textAlign:'center'}}>
                    <div style={{color:'#2A2A2A', fontSize:'10px', textTransform:'uppercase'}}>{f.label}</div>
                    <div style={{color:'#F59E0B', fontSize:'14px', fontWeight:'700', fontFamily:'monospace'}}>{f.value}kg</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {tests && tests.length > 0 && (
          <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden', marginBottom:'12px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
              <p style={{color:'#888', fontSize:'13px', fontWeight:'500', margin:0}}>Último test físico · {new Date(tests[0].date + 'T00:00:00').toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' })}</p>
              <a href={`/athletes/${id}/test`} style={{color:'#10B981', fontSize:'12px', fontWeight:'500'}}>+ Nuevo →</a>
            </div>
            <div style={{padding:'16px 18px', display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px, 1fr))', gap:'12px'}}>
              {[
                { label:'Peso', value: tests[0].weight_kg, unit:'kg', color:'#888' },
                { label:'Grasa', value: tests[0].fat_pct, unit:'%', color:'#EF4444' },
                { label:'Músculo', value: tests[0].muscle_kg, unit:'kg', color:'#10B981' },
                { label:'Salto H.', value: tests[0].jump_horizontal, unit:'m', color:'#6366F1' },
                { label:'CMJ', value: tests[0].cmj_arms, unit:'cm', color:'#8B5CF6' },
                { label:'20m', value: tests[0].sprint_20m, unit:'s', color:'#F59E0B' },
                { label:'60m', value: tests[0].sprint_60m, unit:'s', color:'#F59E0B' },
                { label:'100m', value: tests[0].sprint_100m, unit:'s', color:'#F59E0B' },
              ].filter(f => f.value).map(f => (
                <div key={f.label} style={{backgroundColor:'rgba(255,255,255,0.03)', borderRadius:'10px', padding:'12px', textAlign:'center'}}>
                  <div style={{color:'#333', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px'}}>{f.label}</div>
                  <div style={{color:f.color, fontSize:'18px', fontWeight:'700', fontFamily:'monospace'}}>{f.value}{f.unit}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {results && results.length > 0 && (
          <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden'}}>
            <div style={{padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
              <p style={{color:'#888', fontSize:'13px', fontWeight:'500', margin:0}}>Historial de competiciones</p>
            </div>
            {results.map((result, index) => (
              <div key={result.id} style={{display:'flex', alignItems:'center', gap:'14px', padding:'14px 18px', borderBottom: index < results.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none'}}>
                <div style={{width:'28px', height:'28px', borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'800', backgroundColor: result.position === 1 ? 'rgba(234,179,8,0.2)' : result.position === 2 ? 'rgba(156,163,175,0.15)' : result.position === 3 ? 'rgba(180,83,9,0.15)' : 'rgba(255,255,255,0.04)', color: result.position === 1 ? '#EAB308' : result.position === 2 ? '#9CA3AF' : result.position === 3 ? '#B45309' : '#333'}}>
                  {result.position}
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{color:'#CCC', fontSize:'13px', fontWeight:'500'}}>{result.competitions?.name}</div>
                  <div style={{color:'#333', fontSize:'11px', marginTop:'2px'}}>{result.discipline} · {result.competitions?.location}</div>
                </div>
                <div style={{color:'#A5B4FC', fontSize:'14px', fontWeight:'700', fontFamily:'monospace'}}>{result.mark}</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}