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

  const { data: athletes } = await supabase.from("athletes").select("*").eq("status", "active").order("first_name")
  const athleteIds = athletes?.map(a => a.id) || []

  const { data: allSessions } = await supabase.from("athlete_sessions").select("*").in("athlete_id", athleteIds).order("date", { ascending: false })
  const { data: allWeights } = await supabase.from("athlete_weights").select("*").in("athlete_id", athleteIds).order("date", { ascending: false })
  const { data: allTests } = await supabase.from("athlete_tests").select("*").in("athlete_id", athleteIds).order("date", { ascending: false })
  const { data: allRecords } = await supabase.from("personal_records").select("*").in("athlete_id", athleteIds)
  const { data: convocatorias } = await supabase.from("convocatorias").select("*").gte("date", new Date().toISOString().split("T")[0]).order("date", { ascending: true }).limit(3)

  const getLastSession = (id: string) => allSessions?.find(s => s.athlete_id === id)
  const getLastWeight = (id: string) => allWeights?.find(w => w.athlete_id === id)
  const getLastTest = (id: string) => allTests?.find(t => t.athlete_id === id)
  const getSessionCount = (id: string) => allSessions?.filter(s => s.athlete_id === id).length || 0
  const getAvgEffort = (id: string) => {
    const s = allSessions?.filter(s => s.athlete_id === id && s.effort)
    if (!s?.length) return null
    return (s.reduce((sum, s) => sum + s.effort, 0) / s.length).toFixed(1)
  }
  const daysSince = (dateStr: string) => Math.floor((new Date().getTime() - new Date(dateStr + "T00:00:00").getTime()) / (1000 * 60 * 60 * 24))

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? "Buenos días" : hour < 20 ? "Buenas tardes" : "Buenas noches"
  const firstName = coachRole.name?.split(" ")[0] || "Entrenador"

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#06080F", fontFamily: "-apple-system,Inter,sans-serif" }}>

      {/* NAV */}
      <nav style={{ backgroundColor: "#070B18", borderBottom: "1px solid rgba(75,163,217,0.1)", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/escudo-wa.png?v=3" alt="WeAthletics" width={30} height={30} style={{ borderRadius: "50%" }} />
          <span style={{ color: "#CDD0E0", fontSize: "13px", fontWeight: "700" }}>WeAthletics</span>
          <span style={{ color: "#1E2A5E" }}>·</span>
          <span style={{ color: "#3A4A70", fontSize: "13px" }}>Entrenador</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "#4A5580", fontSize: "13px" }}>{coachRole.name}</span>
          <LogoutButton />
        </div>
      </nav>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 24px" }}>

        {/* CABECERA */}
        <div style={{ background: "linear-gradient(135deg,#0A0F1E 0%,#0D1428 60%,#091020 100%)", border: "1px solid rgba(75,163,217,0.15)", borderRadius: "20px", padding: "24px", marginBottom: "20px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,transparent,#4BA3D9,transparent)" }} />
          <div style={{ color: "#3A4A70", fontSize: "12px", marginBottom: "4px" }}>{greeting}</div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#F0F4FF", letterSpacing: "-0.03em", margin: "0 0 16px" }}>{firstName} — Panel del entrenador</h1>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
            {[
              { label: "Atletas activos", value: String(athletes?.length || 0), color: "#4BA3D9" },
              { label: "Sesiones totales", value: String(allSessions?.length || 0), color: "#F59E0B" },
              { label: "Tests realizados", value: String(allTests?.length || 0), color: "#10B981" },
              { label: "Marcas personales", value: String(allRecords?.length || 0), color: "#A78BFA" },
            ].map(s => (
              <div key={s.label} style={{ backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "12px 14px" }}>
                <div style={{ color: "#2A3550", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>{s.label}</div>
                <div style={{ fontSize: "24px", fontWeight: "800", color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CONVOCATORIAS PRÓXIMAS */}
        {convocatorias && convocatorias.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ color: "#3A4A70", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Próximas convocatorias</div>
            <div style={{ display: "flex", gap: "10px" }}>
              {convocatorias.map(c => (
                <div key={c.id} style={{ flex: 1, backgroundColor: "rgba(75,163,217,0.05)", border: "1px solid rgba(75,163,217,0.2)", borderRadius: "12px", padding: "12px 14px" }}>
                  <div style={{ color: "#4BA3D9", fontSize: "11px", fontWeight: "700" }}>{new Date(c.date+"T00:00:00").toLocaleDateString("es-ES",{day:"numeric",month:"short"})}</div>
                  <div style={{ color: "#CDD0E0", fontSize: "13px", fontWeight: "600", marginTop: "2px" }}>{c.competition_name}</div>
                  {c.location && <div style={{ color: "#3A4A70", fontSize: "11px", marginTop: "2px" }}>📍 {c.location}</div>}
                  <div style={{ color: "#4A5580", fontSize: "11px", marginTop: "4px" }}>{(c.athlete_ids||[]).length} convocados</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ATLETAS */}
        <div style={{ color: "#3A4A70", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>Mis atletas</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {athletes?.map(athlete => {
            const lastSession = getLastSession(athlete.id)
            const lastWeight = getLastWeight(athlete.id)
            const lastTest = getLastTest(athlete.id)
            const sessionCount = getSessionCount(athlete.id)
            const avgEffort = getAvgEffort(athlete.id)
            const daysSinceSession = lastSession ? daysSince(lastSession.date) : null
            const initials = athlete.first_name[0] + athlete.last_name[0]
            const alertLevel = daysSinceSession === null ? "none" : daysSinceSession > 14 ? "high" : daysSinceSession > 7 ? "medium" : "ok"
            const pesas = lastWeight ? [
              {label:"Sentadilla",value:lastWeight.sentadilla},
              {label:"Hip Thrust",value:lastWeight.hip_thrust},
              {label:"P. Muerto",value:lastWeight.peso_muerto},
              {label:"Banca",value:lastWeight.press_banca},
              {label:"Cargada",value:lastWeight.cargada}
            ].filter(p=>p.value) : []

            return (
              <div key={athlete.id} style={{ backgroundColor: "#0A0E1A", border: `1px solid ${alertLevel==="high"?"rgba(239,68,68,0.2)":alertLevel==="medium"?"rgba(245,158,11,0.15)":"rgba(75,163,217,0.1)"}`, borderRadius: "16px", padding: "18px 20px" }}>
                {/* Cabecera atleta */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#1E2A5E,#4BA3D9)", border: "2px solid rgba(75,163,217,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "800", color: "white" }}>{initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#F0F4FF", fontSize: "15px", fontWeight: "700" }}>{athlete.first_name} {athlete.last_name}</div>
                    <div style={{ color: "#3A4A70", fontSize: "12px", marginTop: "2px" }}>{athlete.sport} · {athlete.category} · {sessionCount} sesiones{avgEffort ? ` · Esfuerzo medio: ${avgEffort}/10` : ""}</div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {alertLevel === "high" && <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", backgroundColor: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>⚠ {daysSinceSession}d sin sesión</span>}
                    {alertLevel === "medium" && <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", backgroundColor: "rgba(245,158,11,0.1)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.2)" }}>{daysSinceSession}d sin sesión</span>}
                    {alertLevel === "ok" && <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", backgroundColor: "rgba(16,185,129,0.1)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)" }}>● Al día</span>}
                    {alertLevel === "none" && <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", backgroundColor: "rgba(255,255,255,0.04)", color: "#3A4A70", border: "1px solid rgba(255,255,255,0.06)" }}>Sin sesiones</span>}
                  </div>
                </div>

                {/* Datos */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                  <div style={{ backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "10px", padding: "12px" }}>
                    <div style={{ color: "#2A3550", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Última sesión</div>
                    {lastSession ? (
                      <>
                        <div style={{ color: daysSinceSession! > 7 ? "#F59E0B" : "#CDD0E0", fontSize: "13px", fontWeight: "600" }}>Hace {daysSinceSession} días</div>
                        <div style={{ color: "#3A4A70", fontSize: "12px", marginTop: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lastSession.exercise}</div>
                        {lastSession.average && <div style={{ color: "#4BA3D9", fontSize: "12px", fontFamily: "monospace", marginTop: "2px" }}>Media: {lastSession.average}</div>}
                        {lastSession.effort && <div style={{ color: "#4A5580", fontSize: "11px", marginTop: "2px" }}>Esfuerzo: {lastSession.effort}/10</div>}
                      </>
                    ) : <div style={{ color: "#2A3550", fontSize: "12px" }}>Sin sesiones</div>}
                  </div>

                  <div style={{ backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "10px", padding: "12px" }}>
                    <div style={{ color: "#2A3550", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Últimas pesas</div>
                    {pesas.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {pesas.map(p => (
                          <div key={p.label} style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "#4A5580", fontSize: "11px" }}>{p.label}</span>
                            <span style={{ color: "#F59E0B", fontSize: "12px", fontWeight: "700", fontFamily: "monospace" }}>{p.value}kg</span>
                          </div>
                        ))}
                      </div>
                    ) : <div style={{ color: "#2A3550", fontSize: "12px" }}>Sin registros</div>}
                  </div>

                  <div style={{ backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "10px", padding: "12px" }}>
                    <div style={{ color: "#2A3550", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Último test</div>
                    {lastTest ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {lastTest.sprint_60m && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#4A5580", fontSize: "11px" }}>60m</span><span style={{ color: "#10B981", fontSize: "12px", fontWeight: "700", fontFamily: "monospace" }}>{lastTest.sprint_60m}s</span></div>}
                        {lastTest.sprint_100m && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#4A5580", fontSize: "11px" }}>100m</span><span style={{ color: "#10B981", fontSize: "12px", fontWeight: "700", fontFamily: "monospace" }}>{lastTest.sprint_100m}s</span></div>}
                        {lastTest.weight_kg && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#4A5580", fontSize: "11px" }}>Peso</span><span style={{ color: "#888", fontSize: "12px", fontWeight: "700", fontFamily: "monospace" }}>{lastTest.weight_kg}kg</span></div>}
                        {!lastTest.sprint_60m && !lastTest.sprint_100m && !lastTest.weight_kg && <div style={{ color: "#2A3550", fontSize: "12px" }}>Sin datos</div>}
                      </div>
                    ) : <div style={{ color: "#2A3550", fontSize: "12px" }}>Sin tests</div>}
                  </div>
                </div>

                {/* Acciones */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <a href={`/athletes/${athlete.id}/sesion`} style={{ padding: "7px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", backgroundColor: "rgba(75,163,217,0.1)", color: "#4BA3D9", border: "1px solid rgba(75,163,217,0.2)", textDecoration: "none" }}>+ Sesión</a>
                  <a href={`/athletes/${athlete.id}/pesas`} style={{ padding: "7px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", backgroundColor: "rgba(245,158,11,0.08)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.2)", textDecoration: "none" }}>+ Pesas</a>
                  <a href={`/athletes/${athlete.id}/test`} style={{ padding: "7px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", backgroundColor: "rgba(16,185,129,0.08)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)", textDecoration: "none" }}>+ Test</a>
                  <a href={`/athletes/${athlete.id}/vbt`} style={{ padding: "7px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", backgroundColor: "rgba(167,139,250,0.08)", color: "#A78BFA", border: "1px solid rgba(167,139,250,0.2)", textDecoration: "none" }}>VBT</a>
                  <a href={`/athletes/${athlete.id}/tiempos`} style={{ padding: "7px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", backgroundColor: "rgba(255,255,255,0.04)", color: "#888", border: "1px solid rgba(255,255,255,0.08)", textDecoration: "none" }}>Tiempos</a>
                  <a href={`/athletes/${athlete.id}`} style={{ padding: "7px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", backgroundColor: "rgba(255,255,255,0.04)", color: "#CDD0E0", border: "1px solid rgba(255,255,255,0.08)", textDecoration: "none" }}>Ver perfil →</a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
