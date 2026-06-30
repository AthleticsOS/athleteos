import { supabase } from '@/app/lib/supabase'

type Props = { params: Promise<{ id: string }> }

export default async function CargaEntrenamientoPage({ params }: Props) {
  const { id } = await params
  const { data: athlete } = await supabase.from('athletes').select('first_name, last_name').eq('id', id).single()

  const monthAgo = new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0]
  const { data: sessions } = await supabase
    .from('athlete_sessions')
    .select('date, effort, duration')
    .eq('athlete_id', id)
    .gte('date', monthAgo)
    .order('date', { ascending: true })

  if (!athlete) return <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '32px' }}><p style={{ color: '#3A4A70' }}>No encontrado</p></main>

  // Agrupar por semana
  const weeks: Record<string, { sessions: number; load: number; effort: number[] }> = {}
  sessions?.forEach(s => {
    const d = new Date(s.date + 'T00:00:00')
    const monday = new Date(d)
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    const key = monday.toISOString().split('T')[0]
    if (!weeks[key]) weeks[key] = { sessions: 0, load: 0, effort: [] }
    weeks[key].sessions++
    weeks[key].load += (s.effort || 5) * (s.duration || 60)
    weeks[key].effort.push(s.effort || 5)
  })

  const weekEntries = Object.entries(weeks).sort((a, b) => a[0].localeCompare(b[0]))
  const maxLoad = Math.max(...weekEntries.map(([, w]) => w.load), 1)

  const totalLoad = sessions?.reduce((s, x) => s + (x.effort || 5) * (x.duration || 60), 0) || 0
  const avgEffort = sessions && sessions.length > 0 ? (sessions.reduce((s, x) => s + (x.effort || 0), 0) / sessions.length).toFixed(1) : '—'

  // Detectar semana pico (mayor carga)
  const peakWeek = weekEntries.reduce((best, curr) => curr[1].load > (best?.[1]?.load || 0) ? curr : best, weekEntries[0])

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <a href={`/athletes/${id}`} style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← {athlete.first_name} {athlete.last_name}</a>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#F0F4FF', margin: '8px 0 4px' }}>Carga de entrenamiento</h1>
          <p style={{ color: '#3A4A70', fontSize: '13px', margin: 0 }}>Últimos 30 días · {sessions?.length || 0} sesiones</p>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
          {[
            { label: 'Sesiones', value: String(sessions?.length || 0), color: '#4BA3D9' },
            { label: 'Carga total', value: String(totalLoad), color: '#F59E0B', sub: 'UA (min×RPE)' },
            { label: 'Esfuerzo medio', value: `${avgEffort}/10`, color: '#A78BFA' },
            { label: 'Semanas activas', value: String(weekEntries.length), color: '#10B981' },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '14px', padding: '14px 16px' }}>
              <div style={{ color: '#2A3550', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
              {(s as any).sub && <div style={{ color: '#3A4A70', fontSize: '10px', marginTop: '2px' }}>{(s as any).sub}</div>}
            </div>
          ))}
        </div>

        {/* Gráfica por semanas */}
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '20px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>Carga semanal (Unidades Arbitrarias)</p>
            {peakWeek && <span style={{ color: '#F59E0B', fontSize: '11px' }}>Pico: semana del {new Date(peakWeek[0]+'T00:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'})}</span>}
          </div>

          {weekEntries.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#2A3550', fontSize: '12px', padding: '24px 0' }}>Sin sesiones en los últimos 30 días</div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '120px' }}>
              {weekEntries.map(([weekKey, w]) => {
                const pct = Math.max((w.load / maxLoad) * 100, 8)
                const avgE = w.effort.reduce((a, b) => a + b, 0) / w.effort.length
                const color = avgE >= 8 ? '#EF4444' : avgE >= 6 ? '#F59E0B' : '#4BA3D9'
                const weekLabel = new Date(weekKey + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                return (
                  <div key={weekKey} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ color, fontSize: '9px', fontWeight: '700' }}>{w.load}</span>
                    <div style={{ width: '100%', position: 'relative', height: `${pct}%` }}>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, top: 0, backgroundColor: color, borderRadius: '4px 4px 0 0', boxShadow: `0 0 8px ${color}40` }} />
                    </div>
                    <div style={{ color: '#2A3550', fontSize: '9px', textAlign: 'center', lineHeight: 1.2 }}>{weekLabel}</div>
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            {[{ color: '#4BA3D9', label: 'Baja (<6)' }, { color: '#F59E0B', label: 'Media (6-7)' }, { color: '#EF4444', label: 'Alta (≥8)' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: l.color }} />
                <span style={{ color: '#2A3550', fontSize: '10px' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabla sesiones */}
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
            <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>Sesiones recientes</p>
          </div>
          {sessions && sessions.length > 0 ? [...sessions].reverse().slice(0, 10).map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 18px', borderBottom: i < Math.min(sessions.length, 10) - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
              <div style={{ color: '#3A4A70', fontSize: '12px', width: '80px' }}>{new Date(s.date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</div>
              <div style={{ flex: 1, color: '#4A5580', fontSize: '12px' }}>{s.duration ? `${s.duration} min` : '—'}</div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: 10 }).map((_, j) => (
                  <div key={j} style={{ width: '6px', height: '16px', borderRadius: '2px', backgroundColor: j < (s.effort || 0) ? (s.effort >= 8 ? '#EF4444' : s.effort >= 6 ? '#F59E0B' : '#4BA3D9') : 'rgba(255,255,255,0.04)' }} />
                ))}
              </div>
              <div style={{ color: s.effort >= 8 ? '#EF4444' : s.effort >= 6 ? '#F59E0B' : '#4BA3D9', fontSize: '12px', fontWeight: '700', width: '40px', textAlign: 'right' }}>{s.effort}/10</div>
            </div>
          )) : (
            <div style={{ padding: '24px', textAlign: 'center', color: '#2A3550', fontSize: '12px' }}>Sin sesiones</div>
          )}
        </div>
      </div>
    </main>
  )
}
