import { supabase } from "@/app/lib/supabase"
import ProgressChart from "@/app/components/ProgressChart"
import StrengthChart from "@/app/components/StrengthChart"
import ObjetivoTemporada from "@/app/components/ObjetivoTemporada"
import SubirFotoAtleta from "@/app/components/SubirFotoAtleta"
import ObjetivosAtleta from "@/app/components/ObjetivosAtleta"

type Props = { params: Promise<{ id: string }> }

export default async function AthleteProfile({ params }: Props) {
  const { id } = await params
  const { data: athlete } = await supabase.from("athletes").select("*").eq("id", id).single()
  const { data: records } = await supabase.from("personal_records").select("*").eq("athlete_id", id).order("date", { ascending: false })
  const { data: results } = await supabase.from("competition_results").select("*, competitions(name, date, location)").eq("athlete_id", id).order("created_at", { ascending: false })
  const { data: sessions } = await supabase.from("athlete_sessions").select("*").eq("athlete_id", id).order("date", { ascending: false })
  const { data: athleteGoals } = await supabase.from("athlete_goals").select("*").eq("athlete_id", id)
  const { data: weights } = await supabase.from("athlete_weights").select("*").eq("athlete_id", id).order("date", { ascending: true })
  const { data: tests } = await supabase.from("athlete_tests").select("*").eq("athlete_id", id).order("date", { ascending: true })

  if (!athlete) return (
    <main style={{minHeight:"100vh",backgroundColor:"#06080F",padding:"32px"}}>
      <p style={{color:"#555"}}>Deportista no encontrado</p>
    </main>
  )

  const initials = athlete.first_name[0] + athlete.last_name[0]
  const age = athlete.birth_date ? Math.floor((new Date().getTime() - new Date(athlete.birth_date).getTime()) / (365.25*24*60*60*1000)) : null
  const lastSession = sessions?.[0]
  const lastSessionDate = lastSession ? new Date(lastSession.date+"T00:00:00").toLocaleDateString("es-ES",{day:"numeric",month:"short"}) : null

  const chartData: {fecha:string,marca:number,competicion:string}[] = []
  results?.forEach(r => {
    if (!r.mark || !r.competitions?.date) return
    const n = parseFloat(r.mark.replace(/[^0-9.]/g,""))
    if (!isNaN(n)) chartData.push({ fecha: new Date(r.competitions.date).toLocaleDateString("es-ES",{day:"numeric",month:"short"}), marca: n, competicion: r.competitions.name })
  })

  const weightChartData = weights?.map(w => ({
    fecha: new Date(w.date+"T00:00:00").toLocaleDateString("es-ES",{day:"numeric",month:"short"}),
    sentadilla: w.sentadilla, hip_thrust: w.hip_thrust, peso_muerto: w.peso_muerto, press_banca: w.press_banca, cargada: w.cargada,
  })) || []

  const sprintChartData = tests?.map(t => ({
    fecha: new Date(t.date+"T00:00:00").toLocaleDateString("es-ES",{day:"numeric",month:"short"}),
    sprint_20m: t.sprint_20m, sprint_60m: t.sprint_60m, sprint_100m: t.sprint_100m, sprint_200m: t.sprint_200m,
  })) || []

  const effortChartData = [...(sessions || [])].reverse().map(s => ({
    fecha: new Date(s.date+"T00:00:00").toLocaleDateString("es-ES",{day:"numeric",month:"short"}),
    esfuerzo: s.effort,
  }))

  const bestMark = records?.[0]

  return (
    <main style={{minHeight:"100vh",backgroundColor:"#06080F",padding:"28px 32px"}}>
      <style>{`
        @media (max-width: 768px) {
          .ap-main { padding: 16px !important; }
          .ap-stats { grid-template-columns: repeat(2,1fr) !important; }
          .ap-nav { grid-template-columns: repeat(3,1fr) !important; flex-wrap: wrap !important; }
          .ap-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div className="ap-main" style={{maxWidth:"1060px",margin:"0 auto"}}>

        {/* CABECERA */}
        <div style={{background:"linear-gradient(135deg, #0A0F1E 0%, #0D1428 60%, #091020 100%)",border:"1px solid rgba(75,163,217,0.15)",borderRadius:"20px",padding:"28px",marginBottom:"16px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,#4BA3D9,transparent)"}} />
          <div style={{position:"absolute",top:"-80px",right:"-80px",width:"300px",height:"300px",borderRadius:"50%",background:"radial-gradient(circle,rgba(75,163,217,0.06) 0%,transparent 70%)",pointerEvents:"none"}} />

          <div style={{display:"flex",alignItems:"flex-start",gap:"20px"}}>
            <SubirFotoAtleta athleteId={id} currentUrl={athlete.photo_url || null} />
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"6px"}}>
                <h1 style={{fontSize:"24px",fontWeight:"800",color:"#F0F4FF",letterSpacing:"-0.03em",margin:0}}>{athlete.first_name} {athlete.last_name}</h1>
                <span style={{padding:"3px 10px",borderRadius:"20px",fontSize:"11px",fontWeight:"700",backgroundColor:"rgba(16,185,129,0.12)",color:"#10B981",border:"1px solid rgba(16,185,129,0.25)"}}>● Activo</span>
              </div>
              <div style={{display:"flex",gap:"16px",flexWrap:"wrap"}}>
                {athlete.sport && <span style={{color:"#4A5580",fontSize:"13px"}}>{athlete.sport}</span>}
                {athlete.category && <span style={{color:"#4A5580",fontSize:"13px"}}>· {athlete.category}</span>}
                {age && <span style={{color:"#4A5580",fontSize:"13px"}}>· {age} años</span>}
                {athlete.email && <span style={{color:"#4A5580",fontSize:"13px"}}>· {athlete.email}</span>}
              </div>
            </div>
            <div style={{display:"flex",gap:"8px",flexShrink:0}}>
              <a href={`/athletes/${id}/lesiones`} style={{padding:"8px 14px",borderRadius:"9px",backgroundColor:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.18)",color:"#EF4444",fontSize:"12px",fontWeight:"600",textDecoration:"none"}}>Lesiones</a>
              <a href={`/athletes/${id}/pagos`} style={{padding:"8px 14px",borderRadius:"9px",backgroundColor:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",color:"#F59E0B",fontSize:"12px",fontWeight:"600",textDecoration:"none"}}>Pagos</a>
              <a href={`/athletes/${id}/evaluacion`} style={{padding:"8px 14px",borderRadius:"9px",backgroundColor:"rgba(16,185,129,0.07)",border:"1px solid rgba(16,185,129,0.18)",color:"#10B981",fontSize:"12px",fontWeight:"600",textDecoration:"none"}}>Evaluación</a>
              <a href={`/athletes/${id}/medica`} style={{padding:"8px 14px",borderRadius:"9px",backgroundColor:"rgba(167,139,250,0.08)",border:"1px solid rgba(167,139,250,0.2)",color:"#A78BFA",fontSize:"12px",fontWeight:"600",textDecoration:"none"}}>Médica</a>
              <a href={`/athletes/${id}/morfologia`} style={{padding:"8px 14px",borderRadius:"9px",backgroundColor:"rgba(16,185,129,0.07)",border:"1px solid rgba(16,185,129,0.18)",color:"#10B981",fontSize:"12px",fontWeight:"600",textDecoration:"none"}}>Peso</a>
              <a href={`/athletes/${id}/carga`} style={{padding:"8px 14px",borderRadius:"9px",backgroundColor:"rgba(75,163,217,0.07)",border:"1px solid rgba(75,163,217,0.18)",color:"#4BA3D9",fontSize:"12px",fontWeight:"600",textDecoration:"none"}}>Carga</a>
              <a href={`/athletes/${id}/report`} style={{padding:"8px 14px",borderRadius:"9px",backgroundColor:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"#888",fontSize:"12px",fontWeight:"600",textDecoration:"none"}}>PDF</a>
              <a href={`/athletes/${id}/edit`} style={{padding:"8px 14px",borderRadius:"9px",backgroundColor:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"#888",fontSize:"12px",fontWeight:"600",textDecoration:"none"}}>Editar</a>
            </div>
          </div>

          {/* STATS RESUMEN */}
          <div className="ap-stats" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"12px",marginTop:"24px"}}>
            {[
              {label:"Sesiones",value:String(sessions?.length || 0),sub:lastSessionDate ? `Última: ${lastSessionDate}` : "Sin sesiones",color:"#4BA3D9"},
              {label:"Competiciones",value:String(results?.length || 0),sub:"Total historial",color:"#F59E0B"},
              {label:"Marcas",value:String(records?.length || 0),sub:bestMark ? `Mejor: ${bestMark.mark}` : "Sin marcas",color:"#10B981"},
              {label:"Registros pesas",value:String(weights?.length || 0),sub:"Sesiones de fuerza",color:"#EF4444"},
            ].map(s => (
              <div key={s.label} style={{backgroundColor:"rgba(255,255,255,0.03)",borderRadius:"12px",padding:"14px 16px",border:"1px solid rgba(255,255,255,0.05)"}}>
                <div style={{color:"#2A3550",fontSize:"10px",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"8px"}}>{s.label}</div>
                <div style={{fontSize:"26px",fontWeight:"800",color:"#F0F4FF",letterSpacing:"-0.03em",lineHeight:1}}>{s.value}</div>
                <div style={{color:s.color,fontSize:"11px",marginTop:"6px",fontWeight:"500"}}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ACCESOS RAPIDOS */}
        <div className="ap-nav" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"8px",marginBottom:"16px"}}>
          {[
            {href:`/athletes/${id}/tiempos`,label:"Tiempos",color:"#CDD0E0",bg:"rgba(255,255,255,0.04)",bdr:"rgba(255,255,255,0.08)"},
            {href:`/athletes/${id}/competiciones`,label:"Competiciones",color:"#F59E0B",bg:"rgba(245,158,11,0.08)",bdr:"rgba(245,158,11,0.2)"},
            {href:`/athletes/${id}/sesion`,label:"+ Nueva sesión",color:"#4BA3D9",bg:"rgba(75,163,217,0.1)",bdr:"rgba(75,163,217,0.25)"},
            {href:`/athletes/${id}/pesas`,label:"+ Pesas",color:"#EF4444",bg:"rgba(239,68,68,0.08)",bdr:"rgba(239,68,68,0.2)"},
            {href:`/athletes/${id}/test`,label:"+ Test físico",color:"#10B981",bg:"rgba(16,185,129,0.08)",bdr:"rgba(16,185,129,0.2)"},
            {href:`/athletes/${id}/vbt`,label:"VBT",color:"#A78BFA",bg:"rgba(167,139,250,0.08)",bdr:"rgba(167,139,250,0.2)"},
          ].map(a => (
            <a key={a.href} href={a.href} style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"12px 8px",borderRadius:"11px",fontSize:"12px",fontWeight:"600",backgroundColor:a.bg,color:a.color,border:`1px solid ${a.bdr}`,textDecoration:"none",textAlign:"center"}}>
              {a.label}
            </a>
          ))}
        </div>

        {/* ACTIVIDAD RECIENTE + MARCAS */}
        <div className="ap-grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"16px"}}>

          {/* Últimas sesiones */}
          <div style={{backgroundColor:"#0A0E1A",border:"1px solid rgba(75,163,217,0.1)",borderRadius:"16px",overflow:"hidden"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",borderBottom:"1px solid rgba(75,163,217,0.06)"}}>
              <p style={{color:"#CDD0E0",fontSize:"13px",fontWeight:"600",margin:0}}>Últimas sesiones</p>
              <a href={`/athletes/${id}/tiempos`} style={{color:"#4BA3D9",fontSize:"11px",fontWeight:"500",textDecoration:"none"}}>Ver todas →</a>
            </div>
            {sessions && sessions.length > 0 ? sessions.slice(0,4).map((s,i)=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px 18px",borderBottom:i<3&&i<sessions.length-1?"1px solid rgba(255,255,255,0.03)":"none"}}>
                <div style={{width:"36px",textAlign:"center",flexShrink:0,backgroundColor:"rgba(75,163,217,0.06)",borderRadius:"8px",padding:"5px 4px"}}>
                  <div style={{fontSize:"14px",fontWeight:"700",color:"#E0E0E0",lineHeight:1}}>{new Date(s.date+"T00:00:00").getDate()}</div>
                  <div style={{color:"#3A4A70",fontSize:"9px",textTransform:"uppercase"}}>{new Date(s.date+"T00:00:00").toLocaleDateString("es-ES",{month:"short"})}</div>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:"#CDD0E0",fontSize:"13px",fontWeight:"500",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.exercise}</div>
                  {s.average && <div style={{color:"#3A4A70",fontSize:"11px",fontFamily:"monospace",marginTop:"1px"}}>{s.average}</div>}
                </div>
                <div style={{padding:"2px 8px",borderRadius:"20px",fontSize:"10px",fontWeight:"700",backgroundColor:"rgba(75,163,217,0.1)",color:"#4BA3D9",flexShrink:0}}>{s.effort}/10</div>
              </div>
            )) : (
              <div style={{padding:"32px 18px",textAlign:"center"}}>
                <div style={{color:"#2A3550",fontSize:"13px",marginBottom:"8px"}}>Sin sesiones registradas</div>
                <a href={`/athletes/${id}/sesion`} style={{color:"#4BA3D9",fontSize:"12px",textDecoration:"none"}}>+ Añadir primera sesión</a>
              </div>
            )}
          </div>

          {/* Marcas personales */}
          <div style={{backgroundColor:"#0A0E1A",border:"1px solid rgba(75,163,217,0.1)",borderRadius:"16px",overflow:"hidden"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",borderBottom:"1px solid rgba(75,163,217,0.06)"}}>
              <p style={{color:"#CDD0E0",fontSize:"13px",fontWeight:"600",margin:0}}>Marcas personales</p>
              <a href={`/athletes/${id}/marca`} style={{color:"#4BA3D9",fontSize:"11px",fontWeight:"500",textDecoration:"none"}}>+ Añadir</a>
            </div>
            {records && records.length > 0 ? records.slice(0,5).map((r,i)=>(
              <div key={r.id} style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px 18px",borderBottom:i<Math.min(records.length,5)-1?"1px solid rgba(255,255,255,0.03)":"none"}}>
                <div style={{flex:1}}>
                  <div style={{color:"#CDD0E0",fontSize:"13px",fontWeight:"500"}}>{r.discipline}</div>
                  {r.competition && <div style={{color:"#2A3550",fontSize:"11px",marginTop:"2px"}}>{r.competition}</div>}
                </div>
                <div style={{color:"#4BA3D9",fontSize:"16px",fontWeight:"800",fontFamily:"monospace"}}>{r.mark}</div>
              </div>
            )) : (
              <div style={{padding:"32px 18px",textAlign:"center"}}>
                <div style={{color:"#2A3550",fontSize:"13px",marginBottom:"8px"}}>Sin marcas registradas</div>
                <a href={`/athletes/${id}/marca`} style={{color:"#4BA3D9",fontSize:"12px",textDecoration:"none"}}>+ Añadir primera marca</a>
              </div>
            )}
          </div>
        </div>

        {/* OBJETIVOS DE TEMPORADA */}
        <div style={{marginBottom:"12px"}}>
          <ObjetivoTemporada athleteId={id} records={records?.map(r=>({discipline:r.discipline,mark:r.mark})) || []} />
        </div>

        {/* OBJETIVOS PERSONALES */}
        <div style={{marginBottom:"12px"}}>
          <ObjetivosAtleta athleteId={id} initial={athleteGoals || []} />
        </div>

        {/* GRÁFICAS */}
        {chartData.length >= 2 && (
          <div style={{backgroundColor:"#0A0E1A",border:"1px solid rgba(75,163,217,0.1)",borderRadius:"16px",padding:"20px",marginBottom:"12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
              <p style={{color:"#CDD0E0",fontSize:"13px",fontWeight:"600",margin:0}}>Progresión en competición</p>
              <a href={`/athletes/${id}/competiciones`} style={{color:"#4BA3D9",fontSize:"11px",textDecoration:"none"}}>Ver detalle →</a>
            </div>
            <ProgressChart data={chartData} unit="s" lowerIsBetter={true} />
          </div>
        )}

        {effortChartData.length >= 2 && (
          <div style={{backgroundColor:"#0A0E1A",border:"1px solid rgba(75,163,217,0.1)",borderRadius:"16px",padding:"20px",marginBottom:"12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
              <p style={{color:"#CDD0E0",fontSize:"13px",fontWeight:"600",margin:0}}>Evolución del esfuerzo</p>
              <span style={{color:"#2A3550",fontSize:"11px"}}>{effortChartData.length} sesiones</span>
            </div>
            <StrengthChart data={effortChartData} series={[{key:"esfuerzo",label:"Esfuerzo",color:"#4BA3D9"}]} unit="/10" />
          </div>
        )}

        {weightChartData.length >= 2 && (
          <div style={{backgroundColor:"#0A0E1A",border:"1px solid rgba(75,163,217,0.1)",borderRadius:"16px",padding:"20px",marginBottom:"12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
              <p style={{color:"#CDD0E0",fontSize:"13px",fontWeight:"600",margin:0}}>Progresión de fuerza</p>
              <a href={`/athletes/${id}/pesas`} style={{color:"#EF4444",fontSize:"11px",textDecoration:"none"}}>+ Nuevo registro</a>
            </div>
            <StrengthChart data={weightChartData} series={[{key:"sentadilla",label:"Sentadilla",color:"#4BA3D9"},{key:"hip_thrust",label:"Hip Thrust",color:"#F59E0B"},{key:"peso_muerto",label:"Peso Muerto",color:"#EF4444"},{key:"press_banca",label:"Banca",color:"#10B981"},{key:"cargada",label:"Cargada",color:"#A78BFA"}]} unit="kg" />
          </div>
        )}

        {sprintChartData.length >= 2 && (
          <div style={{backgroundColor:"#0A0E1A",border:"1px solid rgba(75,163,217,0.1)",borderRadius:"16px",padding:"20px",marginBottom:"12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
              <p style={{color:"#CDD0E0",fontSize:"13px",fontWeight:"600",margin:0}}>Progresión de sprints</p>
              <a href={`/athletes/${id}/test`} style={{color:"#10B981",fontSize:"11px",textDecoration:"none"}}>+ Nuevo test</a>
            </div>
            <StrengthChart data={sprintChartData} series={[{key:"sprint_20m",label:"20m",color:"#4BA3D9"},{key:"sprint_60m",label:"60m",color:"#F59E0B"},{key:"sprint_100m",label:"100m",color:"#EF4444"},{key:"sprint_200m",label:"200m",color:"#10B981"}]} unit="s" />
          </div>
        )}

        {/* HISTORIAL COMPETICIONES */}
        {results && results.length > 0 && (
          <div style={{backgroundColor:"#0A0E1A",border:"1px solid rgba(75,163,217,0.1)",borderRadius:"16px",overflow:"hidden",marginBottom:"12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",borderBottom:"1px solid rgba(75,163,217,0.06)"}}>
              <p style={{color:"#CDD0E0",fontSize:"13px",fontWeight:"600",margin:0}}>Historial de competiciones</p>
              <a href={`/athletes/${id}/competiciones`} style={{color:"#F59E0B",fontSize:"11px",textDecoration:"none"}}>Ver estadísticas →</a>
            </div>
            {results.slice(0,5).map((r,i)=>(
              <div key={r.id} style={{display:"flex",alignItems:"center",gap:"14px",padding:"12px 18px",borderBottom:i<Math.min(results.length,5)-1?"1px solid rgba(255,255,255,0.03)":"none"}}>
                <div style={{width:"28px",height:"28px",borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"800",backgroundColor:r.position===1?"rgba(234,179,8,0.15)":"rgba(255,255,255,0.04)",color:r.position===1?"#EAB308":"#3A4A70"}}>{r.position || "—"}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:"#CDD0E0",fontSize:"13px",fontWeight:"500"}}>{r.competitions?.name}</div>
                  <div style={{color:"#2A3550",fontSize:"11px",marginTop:"2px"}}>{r.discipline}</div>
                </div>
                <div style={{color:"#4BA3D9",fontSize:"14px",fontWeight:"700",fontFamily:"monospace"}}>{r.mark}</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
