import { supabase } from '@/app/lib/supabase'
import AlertasInactividad from '@/app/components/AlertasInactividad'

export default async function Dashboard() {
  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0]

  const [
    { data: athletes },
    { data: competitions },
    { data: payments },
    { data: recentSessions },
    { data: upcomingConvocatorias },
    { data: weekSessions },
    { data: pendingAthletes },
  ] = await Promise.all([
    supabase.from('athletes').select('id, first_name, last_name, category, sport, photo_url').eq('status','active').order('first_name'),
    supabase.from('competitions').select('*').order('date', { ascending: false }),
    supabase.from('payments').select('*'),
    supabase.from('athlete_sessions').select('*, athletes(first_name, last_name)').gte('date', weekAgo).order('date', { ascending: false }).limit(8),
    supabase.from('convocatorias').select('*').gte('date', today).order('date').limit(3),
    supabase.from('athlete_sessions').select('date').gte('date', weekAgo),
    supabase.from('athletes').select('id').eq('status','pending'),
  ])

  const upcoming = competitions?.filter(c => c.status === 'upcoming').length || 0
  const pending = payments?.filter(p => p.status !== 'paid').length || 0
  const totalPaid = payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount_cents||0), 0) || 0
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'

  // Sesiones por día de la semana (últimos 7 días)
  const dayLabels = ['L','M','X','J','V','S','D']
  const sessionsByDay: number[] = Array(7).fill(0)
  weekSessions?.forEach(s => {
    const d = new Date(s.date+'T00:00:00')
    const dow = (d.getDay() + 6) % 7 // lunes=0
    sessionsByDay[dow]++
  })
  const maxDay = Math.max(...sessionsByDay, 1)

  return (
    <main className="dash-main" style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px', fontFamily: "-apple-system,'Inter',sans-serif" }}>
      <style>{`
        @media (max-width: 768px) {
          .dash-main { padding: 16px !important; }
          .dash-kpis { grid-template-columns: repeat(2,1fr) !important; gap: 8px !important; }
          .dash-body { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* CABECERA */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em', margin: 0 }}>{greeting}, Aaron</h1>
          <p style={{ color: '#3A4A70', fontSize: '13px', marginTop: '4px' }}>Temporada 2024–2025 · WeAthletics</p>
        </div>

        {/* ALERTAS */}
        {((pendingAthletes?.length || 0) > 0 || pending > 0) && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {(pendingAthletes?.length || 0) > 0 && (
              <a href="/athletes" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', textDecoration: 'none' }}>
                <span style={{ fontSize: '14px' }}>⏳</span>
                <span style={{ color: '#F59E0B', fontSize: '13px', fontWeight: '600' }}>{pendingAthletes?.length} solicitud{pendingAthletes!.length > 1 ? 'es' : ''} pendiente{pendingAthletes!.length > 1 ? 's' : ''} de aprobación</span>
              </a>
            )}
            {pending > 0 && (
              <a href="/finances" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', textDecoration: 'none' }}>
                <span style={{ fontSize: '14px' }}>💶</span>
                <span style={{ color: '#EF4444', fontSize: '13px', fontWeight: '600' }}>{pending} pago{pending > 1 ? 's' : ''} pendiente{pending > 1 ? 's' : ''}</span>
              </a>
            )}
          </div>
        )}

        {/* ALERTAS INACTIVIDAD */}
        <AlertasInactividad />

        {/* STATS */}
        <div className="dash-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
          {[
            { label: 'Deportistas', value: String(athletes?.length || 0), sub: 'Activos en el club', color: '#4BA3D9', href: '/athletes' },
            { label: 'Competiciones', value: String(competitions?.length || 0), sub: `${upcoming} próximas`, color: '#F59E0B', href: '/competitions' },
            { label: 'Ingresos', value: `€${(totalPaid/100).toFixed(0)}`, sub: pending > 0 ? `${pending} pendientes` : 'Todo al día', color: pending > 0 ? '#EF4444' : '#10B981', href: '/finances' },
            { label: 'Sesiones esta semana', value: String(weekSessions?.length || 0), sub: 'Últimos 7 días', color: '#A78BFA', href: '/asistencia' },
          ].map(s => (
            <a key={s.label} href={s.href} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '14px', padding: '18px 20px', textDecoration: 'none', display: 'block', transition: 'border-color 150ms' }}>
              <div style={{ color: '#2A3550', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>{s.label}</div>
              <div style={{ fontSize: '30px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: s.color, marginTop: '6px', fontWeight: '500' }}>{s.sub}</div>
            </a>
          ))}
        </div>

        <div className="dash-body" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '12px', marginBottom: '12px' }}>

          {/* Actividad de la semana */}
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600' }}>Actividad esta semana</div>
              <span style={{ color: '#3A4A70', fontSize: '11px' }}>{weekSessions?.length || 0} sesiones registradas</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', height: '100px', padding: '0 4px' }}>
              {dayLabels.map((label, i) => {
                const val = sessionsByDay[i]
                const pct = val > 0 ? Math.max((val / maxDay) * 100, 15) : 0
                return (
                  <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                    {val > 0 && <span style={{ color: '#4BA3D9', fontSize: '10px', fontWeight: '700' }}>{val}</span>}
                    <div style={{ width: '100%', position: 'relative', height: `${pct}%`, minHeight: val > 0 ? '16px' : '3px' }}>
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, top: 0,
                        backgroundColor: val > 0 ? '#4BA3D9' : 'rgba(75,163,217,0.07)',
                        borderRadius: '4px',
                        boxShadow: val > 0 ? '0 0 8px rgba(75,163,217,0.3)' : 'none',
                      }} />
                    </div>
                    <div style={{ color: val > 0 ? '#4A5580' : '#2A3550', fontSize: '11px', fontWeight: '600' }}>{label}</div>
                  </div>
                )
              })}
            </div>

            {/* Sesiones recientes */}
            <div style={{ marginTop: '18px', borderTop: '1px solid rgba(75,163,217,0.06)', paddingTop: '14px' }}>
              <div style={{ color: '#3A4A70', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Últimas sesiones</div>
              {recentSessions && recentSessions.length > 0 ? recentSessions.slice(0,5).map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                    {s.athletes?.first_name?.[0]}{s.athletes?.last_name?.[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#CDD0E0', fontSize: '12px', fontWeight: '500' }}>{s.athletes?.first_name} {s.athletes?.last_name}</div>
                    <div style={{ color: '#2A3550', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.exercise}</div>
                  </div>
                  <div style={{ color: '#4BA3D9', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>{s.effort}/10</div>
                </div>
              )) : (
                <div style={{ color: '#2A3550', fontSize: '12px' }}>Sin sesiones esta semana</div>
              )}
            </div>
          </div>

          {/* Panel derecho */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Próximas convocatorias */}
            <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '14px', padding: '16px', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600' }}>Próximas convocatorias</div>
                <a href="/convocatorias" style={{ color: '#4BA3D9', fontSize: '11px', textDecoration: 'none' }}>Ver todas →</a>
              </div>
              {upcomingConvocatorias && upcomingConvocatorias.length > 0 ? upcomingConvocatorias.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ backgroundColor: 'rgba(75,163,217,0.08)', borderRadius: '8px', padding: '6px 8px', textAlign: 'center', flexShrink: 0, minWidth: '36px' }}>
                    <div style={{ color: '#4BA3D9', fontSize: '14px', fontWeight: '800', lineHeight: 1 }}>{new Date(c.date+'T00:00:00').getDate()}</div>
                    <div style={{ color: '#4BA3D9', fontSize: '8px', textTransform: 'uppercase' }}>{new Date(c.date+'T00:00:00').toLocaleDateString('es-ES',{month:'short'})}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#CDD0E0', fontSize: '12px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.competition_name}</div>
                    {c.location && <div style={{ color: '#2A3550', fontSize: '11px' }}>{c.location}</div>}
                  </div>
                </div>
              )) : (
                <div style={{ color: '#2A3550', fontSize: '12px' }}>Sin convocatorias próximas</div>
              )}
            </div>

            {/* Accesos rápidos */}
            <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '14px', padding: '16px' }}>
              <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', marginBottom: '10px' }}>Accesos rápidos</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {[
                  { href:'/athletes/nuevo', label:'+ Nuevo deportista' },
                  { href:'/competitions/nueva', label:'+ Nueva competición' },
                  { href:'/convocatorias/nueva', label:'+ Nueva convocatoria' },
                  { href:'/finances/cuotas', label:'€ Cuotas del club' },
                  { href:'/training/plantillas', label:'📋 Plantillas' },
                  { href:'/training/sesion-grupal', label:'👥 Sesión grupal' },
                  { href:'/athletes/comparar', label:'⚡ Comparar atletas' },
                  { href:`/informe/${new Date().toISOString().slice(0,7)}`, label:'📊 Informe del mes' },
                  { href:'/stats/ranking', label:'🥇 Ranking interno' },
                ].map(item => (
                  <a key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', borderRadius: '8px', color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lista de atletas */}
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
            <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600' }}>Deportistas del club</div>
            <a href="/athletes" style={{ color: '#4BA3D9', fontSize: '12px', textDecoration: 'none' }}>Ver todos →</a>
          </div>
          {athletes?.slice(0,8).map((athlete, i) => (
            <a href={`/athletes/${athlete.id}`} key={athlete.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 20px', borderBottom: i < Math.min((athletes.length||0),8)-1 ? '1px solid rgba(255,255,255,0.03)' : 'none', textDecoration: 'none' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                {athlete.first_name[0]}{athlete.last_name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '500' }}>{athlete.first_name} {athlete.last_name}</div>
                <div style={{ color: '#2A3550', fontSize: '11px', marginTop: '1px' }}>{athlete.sport}{athlete.category ? ` · ${athlete.category}` : ''}</div>
              </div>
            </a>
          ))}
        </div>

      </div>
    </main>
  )
}
