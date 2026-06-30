import { supabase } from '@/app/lib/supabase'

export default async function BienestarEquipoPage() {
  const weekAgo = new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0]

  const { data: athletes } = await supabase.from('athletes').select('id, first_name, last_name').eq('status','active').order('first_name')
  const { data: surveys } = await supabase.from('wellness_surveys').select('*').gte('date', weekAgo).order('date', { ascending: false })

  // Promedios globales de la semana
  const allSurveys = surveys || []
  const avg = (key: string) => allSurveys.length > 0
    ? (allSurveys.reduce((s: number, x: any) => s + (x[key] || 0), 0) / allSurveys.length).toFixed(1)
    : '—'

  // Por atleta: última encuesta y promedio
  const byAthlete: Record<string, any[]> = {}
  athletes?.forEach(a => { byAthlete[a.id] = [] })
  allSurveys.forEach(s => { if (byAthlete[s.athlete_id]) byAthlete[s.athlete_id].push(s) })

  // Días de la semana para heatmap
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i*24*60*60*1000)
    days.push(d.toISOString().split('T')[0])
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <a href="/stats" style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← Estadísticas</a>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', margin: '8px 0 4px' }}>Bienestar del equipo</h1>
          <p style={{ color: '#3A4A70', fontSize: '13px', margin: 0 }}>Últimos 7 días · {allSurveys.length} encuestas recibidas</p>
        </div>

        {/* Promedios globales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Sueño', value: avg('sleep'), max: 10, color: '#4BA3D9', icon: '😴' },
            { label: 'Energía', value: avg('energy'), max: 10, color: '#10B981', icon: '⚡' },
            { label: 'Estrés', value: avg('stress'), max: 10, color: '#F59E0B', icon: '😰' },
            { label: 'Dolor', value: avg('pain'), max: 10, color: '#EF4444', icon: '🩹' },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '14px', padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#2A3550', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</span>
                <span style={{ fontSize: '14px' }}>{s.icon}</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ color: '#2A3550', fontSize: '10px', marginTop: '2px' }}>promedio /10</div>
            </div>
          ))}
        </div>

        {/* Tabla por atleta */}
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
            <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>Estado por atleta esta semana</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(7,36px)', gap: '4px', padding: '10px 18px', borderBottom: '1px solid rgba(75,163,217,0.04)' }}>
            <div style={{ color: '#2A3550', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>Atleta</div>
            {days.map(d => (
              <div key={d} style={{ color: '#2A3550', fontSize: '9px', textAlign: 'center', fontWeight: '600' }}>
                {new Date(d+'T00:00:00').toLocaleDateString('es-ES',{weekday:'narrow'})}
              </div>
            ))}
          </div>
          {athletes?.map((athlete, i) => {
            const athleteSurveys = byAthlete[athlete.id] || []
            const surveyByDate = Object.fromEntries(athleteSurveys.map(s => [s.date, s]))
            const avgEnergy = athleteSurveys.length > 0 ? athleteSurveys.reduce((s,x) => s+(x.energy||0),0)/athleteSurveys.length : null
            return (
              <div key={athlete.id} style={{ display: 'grid', gridTemplateColumns: '1fr repeat(7,36px)', gap: '4px', padding: '10px 18px', borderBottom: i < (athletes.length-1) ? '1px solid rgba(255,255,255,0.03)' : 'none', alignItems: 'center' }}>
                <div>
                  <span style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '500' }}>{athlete.first_name} {athlete.last_name}</span>
                  {avgEnergy && <span style={{ color: '#3A4A70', fontSize: '11px', marginLeft: '8px' }}>⚡{avgEnergy.toFixed(1)}</span>}
                </div>
                {days.map(d => {
                  const s = surveyByDate[d]
                  const score = s ? Math.round((s.sleep + s.energy + (10 - s.stress) + (10 - s.pain)) / 4) : null
                  const color = score === null ? 'rgba(255,255,255,0.04)' : score >= 7 ? 'rgba(16,185,129,0.3)' : score >= 5 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'
                  return (
                    <div key={d} title={s ? `Sueño:${s.sleep} Energía:${s.energy} Estrés:${s.stress} Dolor:${s.pain}` : 'Sin datos'} style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: score !== null ? 'rgba(255,255,255,0.8)' : 'transparent' }}>
                      {score ?? ''}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        <div style={{ color: '#2A3550', fontSize: '11px', textAlign: 'center' }}>
          🟢 Bueno (7-10) &nbsp;·&nbsp; 🟡 Regular (5-6) &nbsp;·&nbsp; 🔴 Bajo (1-4) &nbsp;·&nbsp; ⬛ Sin datos
        </div>
      </div>
    </main>
  )
}
