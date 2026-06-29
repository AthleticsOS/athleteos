import { supabase } from "@/app/lib/supabase"
import ExportCSV from "@/app/components/ExportCSV"
import AprobarAtletaButton from "@/app/components/AprobarAtletaButton"

export default async function Athletes() {
  const { data: athletes } = await supabase.from("athletes").select("*").eq("status", "active").order("first_name")
  const { data: pending } = await supabase.from("athletes").select("*").eq("status", "pending").order("created_at", { ascending: false })

  const exportData = athletes?.map(a => ({
    Nombre: `${a.first_name} ${a.last_name}`,
    Email: a.email || '',
    Telefono: a.phone || '',
    Deporte: a.sport || '',
    Categoria: a.category || '',
    Estado: a.status || '',
    Fecha_nacimiento: a.birth_date || '',
  })) || []

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#06080F", padding: "28px 32px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#F0F4FF", letterSpacing: "-0.03em", margin: 0 }}>Deportistas</h1>
            <p style={{ color: "#3A4A70", fontSize: "13px", marginTop: "6px" }}>{athletes?.length || 0} deportistas en WeAthletics</p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <ExportCSV data={exportData} filename="atleteos_atletas" label="Exportar CSV" />
            <a href="/athletes/nuevo" style={{ padding: "9px 18px", borderRadius: "9px", background: "linear-gradient(135deg,#1E2A5E,#4BA3D9)", color: "white", fontSize: "13px", fontWeight: "600", textDecoration: "none", boxShadow: "0 4px 16px rgba(75,163,217,0.2)" }}>+ Añadir deportista</a>
          </div>
        </div>
        {/* Solicitudes pendientes */}
        {pending && pending.length > 0 && (
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(245,158,11,0.1)', backgroundColor: 'rgba(245,158,11,0.04)' }}>
              <p style={{ color: '#F59E0B', fontSize: '13px', fontWeight: '700', margin: 0 }}>⏳ Solicitudes pendientes · {pending.length}</p>
            </div>
            {pending.map((a, i) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: i < pending.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,rgba(245,158,11,0.3),rgba(245,158,11,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#F59E0B' }}>{a.first_name[0]}{a.last_name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#CDD0E0', fontSize: '14px', fontWeight: '500' }}>{a.first_name} {a.last_name}</div>
                  <div style={{ color: '#2A3550', fontSize: '11px' }}>{a.email} · {a.category}</div>
                </div>
                <AprobarAtletaButton athleteId={a.id} />
              </div>
            ))}
          </div>
        )}

        <div style={{ backgroundColor: "#0A0E1A", border: "1px solid rgba(75,163,217,0.1)", borderRadius: "16px", overflow: "hidden" }}>
          {athletes && athletes.length > 0 ? athletes.map((athlete, index) => (
            <a href={`/athletes/${athlete.id}`} key={athlete.id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 100px 32px", alignItems: "center", padding: "14px 20px", borderBottom: index < athletes.length-1 ? "1px solid rgba(255,255,255,0.03)" : "none", textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#1E2A5E,#4BA3D9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "white" }}>{athlete.first_name[0]}{athlete.last_name[0]}</div>
                <div>
                  <div style={{ color: "#CDD0E0", fontSize: "14px", fontWeight: "500" }}>{athlete.first_name} {athlete.last_name}</div>
                  <div style={{ color: "#2A3550", fontSize: "11px", marginTop: "2px" }}>{athlete.email || "Sin email"}</div>
                </div>
              </div>
              <div style={{ color: "#4A5580", fontSize: "13px" }}>{athlete.sport}</div>
              <div style={{ color: "#4A5580", fontSize: "13px" }}>{athlete.category}</div>
              <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", backgroundColor: athlete.status === "active" ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.04)", color: athlete.status === "active" ? "#10B981" : "#555", border: `1px solid ${athlete.status === "active" ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.06)"}` }}>
                {athlete.status === "active" ? "● Activo" : athlete.status}
              </span>
              <div style={{ color: "#3A4A70", fontSize: "16px", textAlign: "right" }}>→</div>
            </a>
          )) : (
            <div style={{ padding: "60px 20px", textAlign: "center", color: "#2A3550", fontSize: "13px" }}>No hay deportistas</div>
          )}
        </div>
      </div>
    </main>
  )
}
