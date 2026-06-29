import { supabase } from '@/app/lib/supabase'

export default async function Asistencia() {
  const { data: athletes } = await supabase.from('athletes').select('id, first_name, last_name, category').order('first_name')
  const { data: sessions } = await supabase.from('athlete_sessions').select('athlete_id, date, exercise, effort').order('date', { ascending: false })

  // Agrupar sesiones por fecha
  const byDate: Record<string, { athlete_id: string, exercise: string, effort: number }[]> = {}
  sessions?.forEach(s => {
    if (!byDate[s.date]) byDate[s.date] = []
    byDate[s.date].push({ athlete_id: s.athlete_id, exercise: s.exercise, effort: s.effort })
  })

  const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a)).slice(0, 30)
  const totalAthletes = athletes?.length || 0

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em', margin: 0 }}>Control de asistencia</h1>
          <p style={{ color: '#3A4A70', fontSize: '13px', marginTop: '6px' }}>Atletas que han registrado sus entrenamientos</p>
        </div>

        {/* Resumen global */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Atletas en el club', value: String(totalAthletes), color: '#4BA3D9' },
            { label: 'Días con actividad', value: String(dates.length), color: '#10B981' },
            { label: 'Sesiones totales', value: String(sessions?.length || 0), color: '#F59E0B' },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '14px', padding: '18px 20px' }}>
              <div style={{ color: '#2A3550', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em' }}>{s.value}</div>
              <div style={{ width: '24px', height: '2px', backgroundColor: s.color, borderRadius: '2px', marginTop: '8px' }} />
            </div>
          ))}
        </div>

        {/* Lista por fecha */}
        {dates.length === 0 ? (
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
            <div style={{ color: '#3A4A70', fontSize: '14px' }}>Aún no hay entrenamientos registrados por los atletas</div>
          </div>
        ) : dates.map(date => {
          const daySessions = byDate[date]
          const presentIds = new Set(daySessions.map(s => s.athlete_id))
          const present = athletes?.filter(a => presentIds.has(a.id)) || []
          const absent = athletes?.filter(a => !presentIds.has(a.id)) || []
          const pct = Math.round((present.length / totalAthletes) * 100)

          return (
            <div key={date} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', marginBottom: '12px', overflow: 'hidden' }}>
              {/* Cabecera del día */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', borderBottom: '1px solid rgba(75,163,217,0.06)', backgroundColor: 'rgba(75,163,217,0.03)' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#F0F4FF', lineHeight: 1 }}>
                    {new Date(date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </div>
                  <div style={{ color: '#3A4A70', fontSize: '11px', marginTop: '2px', textTransform: 'capitalize' }}>
                    {new Date(date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long' })}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ flex: 1, height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, backgroundColor: pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444', borderRadius: '4px', transition: 'width 0.3s' }} />
                    </div>
                    <span style={{ color: pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444', fontSize: '13px', fontWeight: '700', flexShrink: 0 }}>{present.length}/{totalAthletes}</span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 20px' }}>
                {/* Presentes */}
                {present.length > 0 && (
                  <div style={{ marginBottom: absent.length > 0 ? '14px' : 0 }}>
                    <div style={{ color: '#10B981', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Registraron entrenamiento</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {present.map(a => {
                        const s = daySessions.find(s => s.athlete_id === a.id)
                        return (
                          <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', backgroundColor: 'rgba(16,185,129,0.05)', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.1)' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                              {a.first_name[0]}{a.last_name[0]}
                            </div>
                            <div style={{ flex: 1 }}>
                              <span style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '500' }}>{a.first_name} {a.last_name}</span>
                              <span style={{ color: '#3A4A70', fontSize: '11px', marginLeft: '8px' }}>{a.category}</span>
                            </div>
                            {s?.exercise && <span style={{ color: '#4A5580', fontSize: '11px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.exercise}</span>}
                            {s?.effort && <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', backgroundColor: 'rgba(75,163,217,0.1)', color: '#4BA3D9', flexShrink: 0 }}>{s.effort}/10</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Ausentes */}
                {absent.length > 0 && (
                  <div>
                    <div style={{ color: '#3A4A70', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Sin registro</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {absent.map(a => (
                        <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', color: '#3A4A70' }}>
                            {a.first_name[0]}{a.last_name[0]}
                          </div>
                          <span style={{ color: '#3A4A70', fontSize: '12px' }}>{a.first_name} {a.last_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}

      </div>
    </main>
  )
}
