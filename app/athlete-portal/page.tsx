import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ProgressChart from '@/app/components/ProgressChart'
import StrengthChart from '@/app/components/StrengthChart'

export default async function AthletePortal() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: athlete } = await supabase
    .from('athletes')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!athlete) redirect('/dashboard')

  const { data: records } = await supabase.from('personal_records').select('*').eq('athlete_id', athlete.id).order('date', { ascending: false })
  const { data: sessions } = await supabase.from('athlete_sessions').select('*').eq('athlete_id', athlete.id).order('date', { ascending: false })
  const { data: weights } = await supabase.from('athlete_weights').select('*').eq('athlete_id', athlete.id).order('date', { ascending: true })
  const { data: results } = await supabase.from('competition_results').select('*, competitions(name, date, location)').eq('athlete_id', athlete.id).order('created_at', { ascending: false })

  const initials = athlete.first_name[0] + athlete.last_name[0]

  const chartData: {fecha:string,marca:number,competicion:string}[] = []
  results?.forEach(r => {
    if (!r.mark || !r.competitions?.date) return
    const n = parseFloat(r.mark.replace(/[^0-9.]/g,''))
    if (!isNaN(n)) chartData.push({ fecha: new Date(r.competitions.date).toLocaleDateString('es-ES',{day:'numeric',month:'short'}), marca: n, competicion: r.competitions.name })
  })

  const weightChartData = weights?.map(w => ({
    fecha: new Date(w.date+'T00:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'}),
    sentadilla: w.sentadilla, hip_thrust: w.hip_thrust, peso_muerto: w.peso_muerto, press_banca: w.press_banca, cargada: w.cargada,
  })) || []

  const effortChartData = [...(sessions || [])].reverse().map(s => ({
    fecha: new Date(s.date+'T00:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'}),
    esfuerzo: s.effort,
  }))

  return (
    <main style={{minHeight:'100vh', backgroundColor:'#080808', fontFamily:"-apple-system,'Inter',sans-serif"}}>

      <nav style={{backgroundColor:'#0C0C0C', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'0 24px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50}}>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <div style={{width:'28px', height:'28px', borderRadius:'7px', background:'linear-gradient(135deg,#6366F1,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:'white'}}>A</div>
          <span style={{color:'#888', fontSize:'13px'}}>AthleteOS</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <div style={{width:'30px', height:'30px', borderRadius:'50%', background:'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.3))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:'#A5B4FC'}}>{initials}</div>
          <span style={{color:'#555', fontSize:'13px'}}>{athlete.first_name} {athlete.last_name}</span>
        </div>
      </nav>

      <div style={{maxWidth:'800px', margin:'0 auto', padding:'32px 24px'}}>

        <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'24px', marginBottom:'16px'}}>
          <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
            <div style={{width:'56px', height:'56px', borderRadius:'50%', background:'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.3))', border:'1px solid rgba(99,102,241,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', fontWeight:'700', color:'#A5B4FC', flexShrink:0}}>{initials}</div>
            <div>
              <h1 style={{fontSize:'20px', fontWeight:'700', color:'#F0F0F0', margin:0}}>{athlete.first_name} {athlete.last_name}</h1>
              <div style={{color:'#444', fontSize:'13px', marginTop:'4px'}}>{athlete.sport} · {athlete.category} · WeAthletics</div>
              <div style={{display:'flex', gap:'8px', marginTop:'8px'}}>
                <span style={{padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600', backgroundColor:'rgba(16,185,129,0.1)', color:'#10B981', border:'1px solid rgba(16,185,129,0.2)'}}>● Activo</span>
                {records && records.length > 0 && <span style={{padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600', backgroundColor:'rgba(99,102,241,0.1)', color:'#A5B4FC', border:'1px solid rgba(99,102,241,0.2)'}}>{records.length} marcas personales</span>}
                {sessions && sessions.length > 0 && <span style={{padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600', backgroundColor:'rgba(245,158,11,0.1)', color:'#F59E0B', border:'1px solid rgba(245,158,11,0.2)'}}>{sessions.length} sesiones</span>}
              </div>
            </div>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px'}}>
          <a href={`/athletes/${athlete.id}/sesion`} style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', padding:'14px', borderRadius:'12px', fontSize:'14px', fontWeight:'600', backgroundColor:'rgba(99,102,241,0.12)', color:'#818CF8', border:'1px solid rgba(99,102,241,0.25)'}}>
            + Registrar sesion
          </a>
          <a href={`/athletes/${athlete.id}/marca`} style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', padding:'14px', borderRadius:'12px', fontSize:'14px', fontWeight:'600', backgroundColor:'rgba(245,158,11,0.1)', color:'#F59E0B', border:'1px solid rgba(245,158,11,0.25)'}}>
            + Añadir marca
          </a>
        </div>

        {effortChartData.length >= 2 && (
          <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'20px', marginBottom:'12px'}}>
            <p style={{color:'#888', fontSize:'13px', fontWeight:'500', margin:'0 0 12px'}}>Mi evolución de esfuerzo</p>
            <StrengthChart data={effortChartData} series={[{key:'esfuerzo', label:'Esfuerzo', color:'#6366F1'}]} unit="/10" />
          </div>
        )}

        {chartData.length >= 2 && (
          <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'20px', marginBottom:'12px'}}>
            <p style={{color:'#888', fontSize:'13px', fontWeight:'500', margin:'0 0 12px'}}>Mi progresion en competicion</p>
            <ProgressChart data={chartData} unit="s" lowerIsBetter={true} />
          </div>
        )}

        {weightChartData.length >= 2 && (
          <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'20px', marginBottom:'12px'}}>
            <p style={{color:'#888', fontSize:'13px', fontWeight:'500', margin:'0 0 12px'}}>Mi progresion de fuerza</p>
            <StrengthChart data={weightChartData} series={[{key:'sentadilla',label:'Sentadilla',color:'#6366F1'},{key:'hip_thrust',label:'Hip Thrust',color:'#F59E0B'},{key:'peso_muerto',label:'Peso Muerto',color:'#EF4444'},{key:'press_banca',label:'Banca',color:'#10B981'},{key:'cargada',label:'Cargada',color:'#8B5CF6'}]} unit="kg" />
          </div>
        )}

        {records && records.length > 0 && (
          <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden', marginBottom:'12px'}}>
            <div style={{padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
              <p style={{color:'#888', fontSize:'13px', fontWeight:'500', margin:0}}>Mis marcas personales</p>
            </div>
            {records.map((r, i) => (
              <div key={r.id} style={{display:'flex', alignItems:'center', gap:'12px', padding:'14px 18px', borderBottom:i<records.length-1?'1px solid rgba(255,255,255,0.03)':'none'}}>
                <div style={{flex:1}}>
                  <div style={{color:'#CCC', fontSize:'14px', fontWeight:'500'}}>{r.discipline}</div>
                  <div style={{color:'#333', fontSize:'11px', marginTop:'2px'}}>{r.competition}</div>
                </div>
                <div style={{color:'#A5B4FC', fontSize:'15px', fontWeight:'700', fontFamily:'monospace'}}>{r.mark}</div>
                <div style={{width:'6px', height:'6px', borderRadius:'50%', backgroundColor:'#F59E0B'}}/>
              </div>
            ))}
          </div>
        )}

        {sessions && sessions.length > 0 && (
          <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden', marginBottom:'12px'}}>
            <div style={{padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
              <p style={{color:'#888', fontSize:'13px', fontWeight:'500', margin:0}}>Mis ultimas sesiones</p>
            </div>
            {sessions.slice(0,5).map((s, i) => (
              <div key={s.id} style={{display:'flex', alignItems:'center', gap:'14px', padding:'14px 18px', borderBottom:i<Math.min(sessions.length,5)-1?'1px solid rgba(255,255,255,0.03)':'none'}}>
                <div style={{width:'40px', textAlign:'center', flexShrink:0, backgroundColor:'rgba(255,255,255,0.03)', borderRadius:'8px', padding:'6px 4px'}}>
                  <div style={{fontSize:'16px', fontWeight:'700', color:'#E0E0E0', lineHeight:1}}>{new Date(s.date+'T00:00:00').getDate()}</div>
                  <div style={{color:'#333', fontSize:'9px', textTransform:'uppercase'}}>{new Date(s.date+'T00:00:00').toLocaleDateString('es-ES',{month:'short'})}</div>
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{color:'#CCC', fontSize:'13px', fontWeight:'500', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{s.exercise}</div>
                  {s.times && <div style={{color:'#333', fontSize:'11px', fontFamily:'monospace', marginTop:'2px'}}>{s.times}</div>}
                </div>
                <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px'}}>
                  {s.average && <div style={{color:'#A5B4FC', fontSize:'13px', fontWeight:'700', fontFamily:'monospace'}}>{s.average}</div>}
                  <div style={{padding:'2px 8px', borderRadius:'20px', fontSize:'10px', fontWeight:'600', backgroundColor:'rgba(99,102,241,0.1)', color:'#818CF8'}}>{s.effort}/10</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {results && results.length > 0 && (
          <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden'}}>
            <div style={{padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
              <p style={{color:'#888', fontSize:'13px', fontWeight:'500', margin:0}}>Mis competiciones</p>
            </div>
            {results.map((r, i) => (
              <div key={r.id} style={{display:'flex', alignItems:'center', gap:'14px', padding:'14px 18px', borderBottom:i<results.length-1?'1px solid rgba(255,255,255,0.03)':'none'}}>
                <div style={{width:'28px', height:'28px', borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'800', backgroundColor:r.position===1?'rgba(234,179,8,0.2)':'rgba(255,255,255,0.04)', color:r.position===1?'#EAB308':'#333'}}>{r.position}</div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{color:'#CCC', fontSize:'13px', fontWeight:'500'}}>{r.competitions?.name}</div>
                  <div style={{color:'#333', fontSize:'11px', marginTop:'2px'}}>{r.discipline}</div>
                </div>
                <div style={{color:'#A5B4FC', fontSize:'14px', fontWeight:'700', fontFamily:'monospace'}}>{r.mark}</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}