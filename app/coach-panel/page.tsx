import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import LogoutButton from "@/app/components/LogoutButton"

export default async function CoachPanel() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: coachRole } = await supabase.from("club_roles").select("*").eq("user_id", user.id).single()
  if (!coachRole) redirect("/login")

  const { data: athletes } = await supabase.from("athletes").select("*").eq("status", "active")
  const athleteIds = athletes?.map(a => a.id) || []

  const { data: allSessions } = await supabase.from("athlete_sessions").select("*").in("athlete_id", athleteIds).order("date", { ascending: false })
  const { data: allWeights } = await supabase.from("athlete_weights").select("*").in("athlete_id", athleteIds).order("date", { ascending: false })
  const { data: allTests } = await supabase.from("athlete_tests").select("*").in("athlete_id", athleteIds).order("date", { ascending: false })

  const getLastSession = (id: string) => allSessions?.find(s => s.athlete_id === id)
  const getLastWeight = (id: string) => allWeights?.find(w => w.athlete_id === id)
  const getLastTest = (id: string) => allTests?.find(t => t.athlete_id === id)
  const getSessionCount = (id: string) => allSessions?.filter(s => s.athlete_id === id).length || 0
  const daysSince = (dateStr: string) => Math.floor((new Date().getTime() - new Date(dateStr + "T00:00:00").getTime()) / (1000 * 60 * 60 * 24))

  return (
    <main style={{minHeight:"100vh", backgroundColor:"#080808", fontFamily:"-apple-system,Inter,sans-serif"}}>
      <nav style={{backgroundColor:"#0C0C0C", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"0 24px", height:"56px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50}}>
        <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
          <div style={{width:"28px", height:"28px", borderRadius:"7px", background:"linear-gradient(135deg,#6366F1,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:"700", color:"white"}}>A</div>
          <span style={{color:"#888", fontSize:"13px"}}>AthleteOS</span>
          <span style={{color:"#2A2A2A"}}>·</span>
          <span style={{color:"#555", fontSize:"13px"}}>Entrenador</span>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
          <span style={{color:"#555", fontSize:"13px"}}>{coachRole.name}</span>
          <LogoutButton />
        </div>
      </nav>

      <div style={{maxWidth:"1100px", margin:"0 auto", padding:"32px 24px"}}>
        <div style={{marginBottom:"28px"}}>
          <h1 style={{fontSize:"22px", fontWeight:"700", color:"#F0F0F0", letterSpacing:"-0.02em", margin:0}}>Hola, {coachRole.name.split(" ")[0]} 👋</h1>
          <p style={{color:"#333", fontSize:"13px", marginTop:"6px"}}>{athletes?.length || 0} atletas activos · WeAthletics</p>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px", marginBottom:"24px"}}>
          {[
            { label:"Atletas", value: athletes?.length || 0, color:"#6366F1" },
            { label:"Sesiones registradas", value: allSessions?.length || 0, color:"#F59E0B" },
            { label:"Tests realizados", value: allTests?.length || 0, color:"#10B981" },
          ].map(stat => (
            <div key={stat.label} style={{backgroundColor:"#0E0E0E", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"14px", padding:"18px"}}>
              <div style={{color:"#333", fontSize:"11px", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"8px"}}>{stat.label}</div>
              <div style={{fontSize:"28px", fontWeight:"700", color:stat.color, letterSpacing:"-0.02em"}}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
          {athletes?.map(athlete => {
            const lastSession = getLastSession(athlete.id)
            const lastWeight = getLastWeight(athlete.id)
            const lastTest = getLastTest(athlete.id)
            const sessionCount = getSessionCount(athlete.id)
            const daysSinceSession = lastSession ? daysSince(lastSession.date) : null
            const initials = athlete.first_name[0] + athlete.last_name[0]
            const alertLevel = daysSinceSession === null ? "none" : daysSinceSession > 14 ? "high" : daysSinceSession > 7 ? "medium" : "ok"
            const pesas = lastWeight ? [{label:"Sentadilla",value:lastWeight.sentadilla},{label:"Hip Thrust",value:lastWeight.hip_thrust},{label:"P. Muerto",value:lastWeight.peso_muerto},{label:"Banca",value:lastWeight.press_banca},{label:"Cargada",value:lastWeight.cargada}].filter(p=>p.value) : []

            return (
              <div key={athlete.id} style={{backgroundColor:"#0E0E0E", border:`1px solid ${alertLevel==="high"?"rgba(239,68,68,0.25)":alertLevel==="medium"?"rgba(245,158,11,0.2)":"rgba(255,255,255,0.06)"}`, borderRadius:"16px", padding:"20px", display:"flex", flexDirection:"column", gap:"14px"}}>
                <div style={{display:"flex", alignItems:"center", gap:"14px"}}>
                  <div style={{width:"44px", height:"44px", borderRadius:"50%", flexShrink:0, background:"linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.3))", border:"1px solid rgba(99,102,241,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"15px", fontWeight:"700", color:"#A5B4FC"}}>{initials}</div>
                  <div style={{flex:1}}>
                    <div style={{color:"#E0E0E0", fontSize:"15px", fontWeight:"600"}}>{athlete.first_name} {athlete.last_name}</div>
                    <div style={{color:"#444", fontSize:"12px", marginTop:"2px"}}>{athlete.sport} · {athlete.category} · {sessionCount} sesiones</div>
                  </div>
                  <div style={{display:"flex", gap:"8px"}}>
                    {alertLevel==="high" && <span style={{padding:"4px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:"600", backgroundColor:"rgba(239,68,68,0.1)", color:"#EF4444", border:"1px solid rgba(239,68,68,0.2)"}}>⚠ {daysSinceSession}d sin sesion</span>}
                    {alertLevel==="medium" && <span style={{padding:"4px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:"600", backgroundColor:"rgba(245,158,11,0.1)", color:"#F59E0B", border:"1px solid rgba(245,158,11,0.2)"}}>{daysSinceSession}d sin sesion</span>}
                    {alertLevel==="ok" && <span style={{padding:"4px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:"600", backgroundColor:"rgba(16,185,129,0.1)", color:"#10B981", border:"1px solid rgba(16,185,129,0.2)"}}>● Al dia</span>}
                  </div>
                </div>

                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px"}}>
                  <div style={{backgroundColor:"rgba(255,255,255,0.02)", borderRadius:"10px", padding:"12px"}}>
                    <div style={{color:"#333", fontSize:"10px", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"8px"}}>Ultima sesion</div>
                    {lastSession ? (
                      <>
                        <div style={{color:daysSinceSession!>7?"#F59E0B":"#888", fontSize:"13px", fontWeight:"600"}}>Hace {daysSinceSession} dias</div>
                        <div style={{color:"#444", fontSize:"12px", marginTop:"4px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{lastSession.exercise}</div>
                        {lastSession.average && <div style={{color:"#6366F1", fontSize:"12px", fontFamily:"monospace", marginTop:"2px"}}>Media: {lastSession.average}</div>}
                        {lastSession.effort && <div style={{color:"#555", fontSize:"11px", marginTop:"2px"}}>Esfuerzo: {lastSession.effort}/10</div>}
                      </>
                    ) : <div style={{color:"#2A2A2A", fontSize:"12px"}}>Sin sesiones</div>}
                  </div>
                  <div style={{backgroundColor:"rgba(255,255,255,0.02)", borderRadius:"10px", padding:"12px"}}>
                    <div style={{color:"#333", fontSize:"10px", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"8px"}}>Ultimas pesas</div>
                    {pesas.length > 0 ? (
                      <div style={{display:"flex", flexDirection:"column", gap:"4px"}}>
                        {pesas.map(p => (
                          <div key={p.label} style={{display:"flex", justifyContent:"space-between"}}>
                            <span style={{color:"#555", fontSize:"11px"}}>{p.label}</span>
                            <span style={{color:"#F59E0B", fontSize:"13px", fontWeight:"700", fontFamily:"monospace"}}>{p.value}kg</span>
                          </div>
                        ))}
                      </div>
                    ) : <div style={{color:"#2A2A2A", fontSize:"12px"}}>Sin registros</div>}
                  </div>
                  <div style={{backgroundColor:"rgba(255,255,255,0.02)", borderRadius:"10px", padding:"12px"}}>
                    <div style={{color:"#333", fontSize:"10px", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"8px"}}>Ultimo test</div>
                    {lastTest ? (
                      <div style={{display:"flex", flexDirection:"column", gap:"4px"}}>
                        {lastTest.sprint_60m && <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"#555", fontSize:"11px"}}>60m</span><span style={{color:"#10B981", fontSize:"13px", fontWeight:"700", fontFamily:"monospace"}}>{lastTest.sprint_60m}s</span></div>}
                        {lastTest.sprint_100m && <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"#555", fontSize:"11px"}}>100m</span><span style={{color:"#10B981", fontSize:"13px", fontWeight:"700", fontFamily:"monospace"}}>{lastTest.sprint_100m}s</span></div>}
                        {lastTest.weight_kg && <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"#555", fontSize:"11px"}}>Peso</span><span style={{color:"#888", fontSize:"13px", fontWeight:"700", fontFamily:"monospace"}}>{lastTest.weight_kg}kg</span></div>}
                        {!lastTest.sprint_60m && !lastTest.sprint_100m && !lastTest.weight_kg && <div style={{color:"#2A2A2A", fontSize:"12px"}}>Sin datos</div>}
                      </div>
                    ) : <div style={{color:"#2A2A2A", fontSize:"12px"}}>Sin tests</div>}
                  </div>
                </div>

                <div style={{display:"flex", gap:"8px"}}>
                  <a href={`/athletes/${athlete.id}/sesion`} style={{padding:"8px 14px", borderRadius:"8px", fontSize:"12px", fontWeight:"600", backgroundColor:"rgba(99,102,241,0.1)", color:"#818CF8", border:"1px solid rgba(99,102,241,0.2)"}}>+ Sesion</a>
                  <a href={`/athletes/${athlete.id}/pesas`} style={{padding:"8px 14px", borderRadius:"8px", fontSize:"12px", fontWeight:"600", backgroundColor:"rgba(245,158,11,0.08)", color:"#F59E0B", border:"1px solid rgba(245,158,11,0.2)"}}>+ Pesas</a>
                  <a href={`/athletes/${athlete.id}/test`} style={{padding:"8px 14px", borderRadius:"8px", fontSize:"12px", fontWeight:"600", backgroundColor:"rgba(16,185,129,0.08)", color:"#10B981", border:"1px solid rgba(16,185,129,0.2)"}}>+ Test</a>
                  <a href={`/athletes/${athlete.id}`} style={{padding:"8px 14px", borderRadius:"8px", fontSize:"12px", fontWeight:"600", backgroundColor:"rgba(255,255,255,0.04)", color:"#888", border:"1px solid rgba(255,255,255,0.08)"}}>Ver perfil</a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
