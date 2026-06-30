import { supabase } from '@/app/lib/supabase'

type Props = { params: Promise<{ mes: string }> } // formato: 2025-06

export default async function InformeMensualPage({ params }: Props) {
  const { mes } = await params
  const [year, month] = mes.split('-').map(Number)

  if (!year || !month) return <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '32px' }}><p style={{ color: '#3A4A70' }}>Formato inválido. Usa /informe/2025-06</p></main>

  const firstDay = new Date(year, month - 1, 1).toISOString().split('T')[0]
  const lastDay = new Date(year, month, 0).toISOString().split('T')[0]
  const monthName = new Date(year, month - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  const [
    { data: sessions },
    { data: payments },
    { data: wellness },
    { data: injuries },
    { data: competitions },
    { data: athletes },
  ] = await Promise.all([
    supabase.from('athlete_sessions').select('athlete_id, effort, date, exercise').gte('date', firstDay).lte('date', lastDay),
    supabase.from('payments').select('amount_cents, status').gte('created_at', firstDay+'T00:00:00').lte('created_at', lastDay+'T23:59:59'),
    supabase.from('wellness_surveys').select('athlete_id, sleep, energy, stress, pain').gte('date', firstDay).lte('date', lastDay),
    supabase.from('injury_records').select('athlete_id, type, body_part, start_date, end_date, athletes(first_name, last_name)').gte('start_date', firstDay).lte('start_date', lastDay),
    supabase.from('competitions').select('name, date, location').gte('date', firstDay).lte('date', lastDay).order('date'),
    supabase.from('athletes').select('id').eq('status', 'active'),
  ])

  const totalSessions = sessions?.length || 0
  const avgEffort = totalSessions > 0 ? (sessions!.reduce((s, x) => s + (x.effort || 0), 0) / totalSessions).toFixed(1) : '—'
  const totalPaid = payments?.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount_cents, 0) || 0
  const pendingPayments = payments?.filter(p => p.status !== 'paid').length || 0
  const avgSleep = wellness && wellness.length > 0 ? (wellness.reduce((s, x) => s + (x.sleep || 0), 0) / wellness.length).toFixed(1) : '—'
  const avgEnergy = wellness && wellness.length > 0 ? (wellness.reduce((s, x) => s + (x.energy || 0), 0) / wellness.length).toFixed(1) : '—'

  // Atletas más activos
  const sessionsByAthlete: Record<string, number> = {}
  sessions?.forEach(s => { sessionsByAthlete[s.athlete_id] = (sessionsByAthlete[s.athlete_id] || 0) + 1 })
  const topAthletes = Object.entries(sessionsByAthlete).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Dias con más actividad
  const sessionsByDay: Record<string, number> = {}
  sessions?.forEach(s => { sessionsByDay[s.date] = (sessionsByDay[s.date] || 0) + 1 })

  // Calcular mes anterior/siguiente
  const prevDate = new Date(year, month - 2, 1)
  const nextDate = new Date(year, month, 1)
  const prevMes = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`
  const nextMes = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <a href="/dashboard" style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← Dashboard</a>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', margin: '8px 0 4px', textTransform: 'capitalize' }}>Informe: {monthName}</h1>
            <p style={{ color: '#3A4A70', fontSize: '13px', margin: 0 }}>{athletes?.length || 0} deportistas activos</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a href={`/informe/${prevMes}`} style={{ padding: '8px 14px', borderRadius: '9px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#3A4A70', fontSize: '12px', textDecoration: 'none' }}>← {prevMes}</a>
            <a href={`/informe/${nextMes}`} style={{ padding: '8px 14px', borderRadius: '9px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#3A4A70', fontSize: '12px', textDecoration: 'none' }}>{nextMes} →</a>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
          {[
            { label: 'Sesiones', value: String(totalSessions), sub: `Esfuerzo medio: ${avgEffort}/10`, color: '#4BA3D9' },
            { label: 'Ingresos', value: `€${(totalPaid / 100).toFixed(0)}`, sub: `${pendingPayments} pendientes`, color: '#10B981' },
            { label: 'Sueño medio', value: `${avgSleep}/10`, sub: `Energía: ${avgEnergy}/10`, color: '#A78BFA' },
            { label: 'Lesiones nuevas', value: String(injuries?.length || 0), sub: `${competitions?.length || 0} competiciones`, color: injuries?.length ? '#EF4444' : '#3A4A70' },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '14px', padding: '16px 18px' }}>
              <div style={{ color: '#2A3550', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ color: s.color, fontSize: '11px', marginTop: '4px', fontWeight: '500' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>

          {/* Atletas más activos */}
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
              <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>🏃 Atletas más activos</p>
            </div>
            {topAthletes.length > 0 ? topAthletes.map(([athleteId, count], i) => {
              const s = sessions?.find(x => x.athlete_id === athleteId)
              return (
                <div key={athleteId} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px', borderBottom: i < topAthletes.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                  <span style={{ color: '#3A4A70', fontSize: '13px', fontWeight: '700', width: '20px' }}>{i + 1}.</span>
                  <div style={{ flex: 1 }}>
                    <a href={`/athletes/${athleteId}`} style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '500', textDecoration: 'none' }}>{athleteId.slice(0, 8)}…</a>
                  </div>
                  <span style={{ color: '#4BA3D9', fontSize: '13px', fontWeight: '700' }}>{count} sesiones</span>
                </div>
              )
            }) : <div style={{ padding: '24px', textAlign: 'center', color: '#2A3550', fontSize: '12px' }}>Sin sesiones este mes</div>}
          </div>

          {/* Competiciones del mes */}
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
              <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>🏆 Competiciones del mes</p>
            </div>
            {competitions && competitions.length > 0 ? competitions.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 18px', borderBottom: i < competitions.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                <div style={{ backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: '8px', padding: '5px 8px', flexShrink: 0 }}>
                  <div style={{ color: '#F59E0B', fontSize: '13px', fontWeight: '700', lineHeight: 1 }}>{new Date(c.date + 'T00:00:00').getDate()}</div>
                </div>
                <div>
                  <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '500' }}>{c.name}</div>
                  {c.location && <div style={{ color: '#2A3550', fontSize: '11px' }}>{c.location}</div>}
                </div>
              </div>
            )) : <div style={{ padding: '24px', textAlign: 'center', color: '#2A3550', fontSize: '12px' }}>Sin competiciones este mes</div>}
          </div>
        </div>

        {/* Lesiones nuevas */}
        {injuries && injuries.length > 0 && (
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '14px', padding: '16px 18px' }}>
            <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '700', margin: '0 0 10px' }}>🩹 Lesiones registradas este mes</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {injuries.map(inj => (
                <div key={inj.id} style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: '12px', fontWeight: '600' }}>
                  {(inj as any).athletes?.first_name} {(inj as any).athletes?.last_name} · {inj.type} ({inj.body_part})
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
