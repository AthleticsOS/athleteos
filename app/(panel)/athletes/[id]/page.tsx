import { supabase } from '@/app/lib/supabase'
import ProgressChart from '@/app/components/ProgressChart'
import StrengthChart from '@/app/components/StrengthChart'

type Props = { params: Promise<{ id: string }> }

export default async function AthleteProfile({ params }: Props) {
  const { id } = await params
  const { data: athlete } = await supabase.from('athletes').select('*').eq('id', id).single()
  const { data: records } = await supabase.from('personal_records').select('*').eq('athlete_id', id).order('date', { ascending: false })
  const { data: results } = await supabase.from('competition_results').select('*, competitions(name, date, location)').eq('athlete_id', id).order('created_at', { ascending: false })
  const { data: sessions } = await supabase.from('athlete_sessions').select('*').eq('athlete_id', id).order('date', { ascending: false }).limit(5)
  const { data: weights } = await supabase.from('athlete_weights').select('*').eq('athlete_id', id).order('date', { ascending: true })
  const { data: tests } = await supabase.from('athlete_tests').select('*').eq('athlete_id', id).order('date', { ascending: true })

  if (!athlete) return <main style={{minHeight:"100vh",backgroundColor:"#080808",padding:"32px"}}><p style={{color:"#555"}}>Deportista no encontrado</p></main>

  const initials = athlete.first_name[0] + athlete.last_name[0]
  const age = athlete.birth_date ? Math.floor((new Date().getTime() - new Date(athlete.birth_date).getTime()) / (365.25*24*60*60*1000)) : null

  const chartData: {fecha:string,marca:number,competicion:string}[] = []
  results?.forEach(r => {
    if (!r.mark || !r.competitions?.date) return
    const n = parseFloat(r.mark.replace(/[^0-9.]/g,""))
    if (!isNaN(n)) chartData.push({ fecha: new Date(r.competitions.date).toLocaleDateString("es-ES",{day:"numeric",month:"short"}), marca: n, competicion: r.competitions.name })
  })

  const weightChartData = weights?.map(w => ({
    fecha: new Date(w.date+"T00:00:00").toLocaleDateString("es-ES",{day:"numeric",month:"short"}),
    sentadilla: w.sentadilla,
    hip_thrust: w.hip_thrust,
    peso_muerto: w.peso_muerto,
    press_banca: w.press_banca,
    cargada: w.cargada,
  })) || []

  const sprintChartData = tests?.map(t => ({
    fecha: new Date(t.date+"T00:00:00").toLocaleDateString("es-ES",{day:"numeric",month:"short"}),
    sprint_20m: t.sprint_20m,
    sprint_60m: t.sprint_60m,
    sprint_100m: t.sprint_100m,
    sprint_200m: t.sprint_200m,
  })) || []

  const bodyChartData = tests?.map(t => ({
    fecha: new Date(t.date+"T00:00:00").toLocaleDateString("es-ES",{day:"numeric",month:"short"}),
    peso: t.weight_kg,
    musculo: t.muscle_kg,
    grasa: t.fat_pct,
  })) || []

  return (
    <main style={{minHeight:"100vh",backgroundColor:"#080808",padding:"32px 36px"}}>
      <div style={{maxWidth:"1000px",margin:"0 auto"}}>

        <div style={{backgroundColor:"#0E0E0E",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"16px",padding:"24px",marginBottom:"12px"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:"18px"}}>
            <div style={{width:"64px",height:"64px",borderRadius:"50%",flexShrink:0,background:"linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.3))",border:"1px solid rgba(99,102,241,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",fontWeight:"700",color:"#A5B4FC"}}>{initials}</div>
            <div style={{flex:1}}>
              <h1 style={{fontSize:"22px",fontWeight:"700",color:"#F0F0F0",letterSpacing:"-0.02em",margin:0}}>{athlete.first_name} {athlete.last_name}</h1>
              <div style={{display:"flex",gap:"12px",marginTop:"6px"}}>
                {athlete.sport && <span style={{color:"#444",fontSize:"13px"}}>{athlete.sport}</span>}
                {athlete.category && <span style={{color:"#444",fontSize:"13px"}}>· {athlete.category}</span>}
                {age && <span style={{color:"#444",fontSize:"13px"}}>· {age} años</span>}
              </div>
              <div style={{display:"flex",gap:"8px",marginTop:"10px",flexWrap:"wrap"}}>
                <span style={{padding:"3px 10px",borderRadius:"20px",fontSize:"11px",fontWeight:"600",backgroundColor:"rgba(16,185,129,0.1)",color:"#10B981",border:"1px solid rgba(16,185,129,0.2)"}}>● Activo</span>
                {records && records.length > 0 && <span style={{padding:"3px 10px",borderRadius:"20px",fontSize:"11px",fontWeight:"600",backgroundColor:"rgba(99,102,241,0.1)",color:"#A5B4FC",border:"1px solid rgba(99,102,241,0.2)"}}>{records.length} marcas</span>}
                {sessions && sessions.length > 0 && <span style={{padding:"3px 10px",borderRadius:"20px",fontSize:"11px",fontWeight:"600",backgroundColor:"rgba(245,158,11,0.1)",color:"#F59E0B",border:"1px solid rgba(245,158,11,0.2)"}}>{sessions.length} sesiones</span>}
                {weights && weights.length > 0 && <span style={{padding:"3px 10px",borderRadius:"20px",fontSize:"11px",fontWeight:"600",backgroundColor:"rgba(239,68,68,0.1)",color:"#EF4444",border:"1px solid rgba(239,68,68,0.2)"}}>{weights.length} registros pesas</span>}
              </div>
            </div>
            <a href={`/athletes/${id}/edit`} style={{padding:"8px 16px",borderRadius:"9px",backgroundColor:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",color:"#888",fontSize:"13px",fontWeight:"500",flexShrink:0}}>Editar</a>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px",marginBottom:"12px"}}>
          {[
            {href:`/athletes/${id}/sesion`,label:"+ Nueva sesion",color:"#6366F1",bg:"rgba(99,102,241,0.12)",bdr:"rgba(99,102,241,0.25)"},
            {href:`/athletes/${id}/pesas`,label:"+ Registro pesas",color:"#F59E0B",bg:"rgba(245,158,11,0.1)",bdr:"rgba(245,158,11,0.25)"},
            {href:`/athletes/${id}/test`,label:"+ Test fisico",color:"#10B981",bg:"rgba(16,185,129,0.1)",bdr:"rgba(16,185,129,0.25)"},
            {href:`/athletes/${id}/marca`,label:"+ Marca personal",color:"#A5B4FC",bg:"rgba(165,180,252,0.08)",bdr:"rgba(165,180,252,0.2)"},
            {href:`/athletes/${id}/edit`,label:"Editar perfil",color:"#888",bg:"rgba(255,255,255,0.04)",bdr:"rgba(255,255,255,0.08)"},
            {href:"/competitions",label:"Competiciones",color:"#EAB308",bg:"rgba(234,179,8,0.1)",bdr:"rgba(234,179,8,0.25)"},
          ].map(a => <a key={a.href} href={a.href} style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"11px",borderRadius:"10px",fontSize:"13px",fontWeight:"600",backgroundColor:a.bg,color:a.color,border:`1px solid ${a.bdr}`}}>{a.label}</a>)}
        </div>

        {chartData.length >= 2 && (
          <div style={{backgroundColor:"#0E0E0E",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"16px",padding:"20px",marginBottom:"12px"}}>
            <p style={{color:"#888",fontSize:"13px",fontWeight:"500",margin:"0 0 12px"}}>Progresion en competicion</p>
            <ProgressChart data={chartData} unit="s" lowerIsBetter={true} />
          </div>
        )}

        {weightChartData.length >= 2 && (
          <div style={{backgroundColor:"#0E0E0E",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"16px",padding:"20px",marginBottom:"12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
              <p style={{color:"#888",fontSize:"13px",fontWeight:"500",margin:0}}>Progresion de fuerza</p>
              <a href={`/athletes/${id}/pesas`} style={{color:"#F59E0B",fontSize:"12px",fontWeight:"500"}}>+ Nuevo →</a>
            </div>
            <StrengthChart
              data={weightChartData}
              series={[
                {key:"sentadilla",label:"Sentadilla",color:"#6366F1"},
                {key:"hip_thrust",label:"Hip Thrust",color:"#F59E0B"},
                {key:"peso_muerto",label:"Peso Muerto",color:"#EF4444"},
                {key:"press_banca",label:"Banca",color:"#10B981"},
                {key:"cargada",label:"Cargada",color:"#8B5CF6"},
              ]}
              unit="kg"
            />
          </div>
        )}

        {sprintChartData.length >= 2 && (
          <div style={{backgroundColor:"#0E0E0E",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"16px",padding:"20px",marginBottom:"12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
              <p style={{color:"#888",fontSize:"13px",fontWeight:"500",margin:0}}>Progresion de sprints</p>
              <a href={`/athletes/${id}/test`} style={{color:"#10B981",fontSize:"12px",fontWeight:"500"}}>+ Nuevo →</a>
            </div>
            <StrengthChart
              data={sprintChartData}
              series={[
                {key:"sprint_20m",label:"20m",color:"#6366F1"},
                {key:"sprint_60m",label:"60m",color:"#F59E0B"},
                {key:"sprint_100m",label:"100m",color:"#EF4444"},
                {key:"sprint_200m",label:"200m",color:"#10B981"},
              ]}
              unit="s"
            />
          </div>
        )}

        {bodyChartData.length >= 2 && (
          <div style={{backgroundColor:"#0E0E0E",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"16px",padding:"20px",marginBottom:"12px"}}>
            <p style={{color:"#888",fontSize:"13px",fontWeight:"500",margin:"0 0 12px"}}>Composicion corporal</p>
            <StrengthChart
              data={bodyChartData}
              series={[
                {key:"peso",label:"Peso",color:"#888"},
                {key:"musculo",label:"Musculo",color:"#10B981"},
                {key:"grasa",label:"Grasa %",color:"#EF4444"},
              ]}
              unit=""
            />
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"1fr 260px",gap:"12px",marginBottom:"12px"}}>
          <div style={{backgroundColor:"#0E0E0E",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"16px",overflow:"hidden"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
              <p style={{color:"#888",fontSize:"13px",fontWeight:"500",margin:0}}>Marcas personales</p>
              <a href={`/athletes/${id}/marca`} style={{color:"#6366F1",fontSize:"12px",fontWeight:"500"}}>+ Anadir</a>
            </div>
            {records && records.length > 0 ? records.map((r,i) => (
              <div key={r.id} style={{display:"flex",alignItems:"center",gap:"12px",padding:"14px 18px",borderBottom:i<records.length-1?"1px solid rgba(255,255,255,0.03)":"none"}}>
                <div style={{flex:1}}><div style={{color:"#CCC",fontSize:"14px",fontWeight:"500"}}>{r.discipline}</div><div style={{color:"#333",fontSize:"11px",marginTop:"2px"}}>{r.competition}</div></div>
                <div style={{color:"#A5B4FC",fontSize:"15px",fontWeight:"700",fontFamily:"monospace"}}>{r.mark}</div>
              </div>
            )) : <div style={{padding:"40px 18px",textAlign:"center"}}><a href={`/athletes/${id}/marca`} style={{color:"#6366F1",fontSize:"12px"}}>+ Anadir primera marca</a></div>}
          </div>
          <div style={{backgroundColor:"#0E0E0E",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"16px",overflow:"hidden"}}>
            <div style={{padding:"14px 18px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}><p style={{color:"#888",fontSize:"13px",fontWeight:"500",margin:0}}>Informacion</p></div>
            <div style={{padding:"16px 18px",display:"flex",flexDirection:"column",gap:"14px"}}>
              {[{label:"Email",value:athlete.email},{label:"Telefono",value:athlete.phone},{label:"Deporte",value:athlete.sport},{label:"Categoria",value:athlete.category}].filter(i=>i.value).map(item=>(
                <div key={item.label}><div style={{color:"#2A2A2A",fontSize:"10px",fontWeight:"600",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"3px"}}>{item.label}</div><div style={{color:"#888",fontSize:"13px"}}>{item.value}</div></div>
              ))}
            </div>
          </div>
        </div>

        {sessions && sessions.length > 0 && (
          <div style={{backgroundColor:"#0E0E0E",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"16px",overflow:"hidden",marginBottom:"12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
              <p style={{color:"#888",fontSize:"13px",fontWeight:"500",margin:0}}>Ultimas sesiones</p>
              <a href={`/athletes/${id}/sesion`} style={{color:"#6366F1",fontSize:"12px",fontWeight:"500"}}>+ Nueva</a>
            </div>
            {sessions.map((s,i)=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:"14px",padding:"14px 18px",borderBottom:i<sessions.length-1?"1px solid rgba(255,255,255,0.03)":"none"}}>
                <div style={{width:"40px",textAlign:"center",flexShrink:0,backgroundColor:"rgba(255,255,255,0.03)",borderRadius:"8px",padding:"6px 4px"}}>
                  <div style={{fontSize:"16px",fontWeight:"700",color:"#E0E0E0",lineHeight:1}}>{new Date(s.date+"T00:00:00").getDate()}</div>
                  <div style={{color:"#333",fontSize:"9px",textTransform:"uppercase"}}>{new Date(s.date+"T00:00:00").toLocaleDateString("es-ES",{month:"short"})}</div>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:"#CCC",fontSize:"13px",fontWeight:"500",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.exercise}</div>
                  {s.times && <div style={{color:"#333",fontSize:"11px",fontFamily:"monospace",marginTop:"2px"}}>{s.times}</div>}
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"4px",flexShrink:0}}>
                  {s.average && <div style={{color:"#A5B4FC",fontSize:"13px",fontWeight:"700",fontFamily:"monospace"}}>{s.average}</div>}
                  <div style={{padding:"2px 8px",borderRadius:"20px",fontSize:"10px",fontWeight:"600",backgroundColor:"rgba(99,102,241,0.1)",color:"#818CF8"}}>{s.effort}/10</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {results && results.length > 0 && (
          <div style={{backgroundColor:"#0E0E0E",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"16px",overflow:"hidden"}}>
            <div style={{padding:"14px 18px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}><p style={{color:"#888",fontSize:"13px",fontWeight:"500",margin:0}}>Historial de competiciones</p></div>
            {results.map((r,i)=>(
              <div key={r.id} style={{display:"flex",alignItems:"center",gap:"14px",padding:"14px 18px",borderBottom:i<results.length-1?"1px solid rgba(255,255,255,0.03)":"none"}}>
                <div style={{width:"28px",height:"28px",borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"800",backgroundColor:r.position===1?"rgba(234,179,8,0.2)":"rgba(255,255,255,0.04)",color:r.position===1?"#EAB308":"#333"}}>{r.position}</div>
                <div style={{flex:1,minWidth:0}}><div style={{color:"#CCC",fontSize:"13px",fontWeight:"500"}}>{r.competitions?.name}</div><div style={{color:"#333",fontSize:"11px",marginTop:"2px"}}>{r.discipline}</div></div>
                <div style={{color:"#A5B4FC",fontSize:"14px",fontWeight:"700",fontFamily:"monospace"}}>{r.mark}</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}