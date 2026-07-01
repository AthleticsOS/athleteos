import { supabase } from '@/app/lib/supabase'

export default async function Calendar() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const firstStr = firstDay.toISOString().split('T')[0]
  const lastStr = lastDay.toISOString().split('T')[0]

  const { data: sessions } = await supabase.from('training_sessions').select('*').gte('date', firstStr).lte('date', lastStr)
  const { data: competitions } = await supabase.from('competitions').select('*').gte('date', firstStr).lte('date', lastStr)
  const { data: convocatorias } = await supabase.from('convocatorias').select('*').gte('date', firstStr).lte('date', lastStr)
  // Lesiones activas (sin end_date o end_date futura)
  const { data: injuries } = await supabase
    .from('injury_records')
    .select('*, athletes(first_name, last_name)')
    .or(`end_date.is.null,end_date.gte.${firstStr}`)
    .lte('start_date', lastStr)

  const eventsByDay: Record<number, { type: string, title: string, color: string, bg: string }[]> = {}

  sessions?.forEach(s => {
    const day = new Date(s.date + 'T00:00:00').getDate()
    if (!eventsByDay[day]) eventsByDay[day] = []
    eventsByDay[day].push({ type: 'training', title: s.title || 'Entrenamiento', color: '#4BA3D9', bg: 'rgba(75,163,217,0.15)' })
  })

  competitions?.forEach(c => {
    const day = new Date(c.date + 'T00:00:00').getDate()
    if (!eventsByDay[day]) eventsByDay[day] = []
    eventsByDay[day].push({ type: 'competition', title: c.name, color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' })
  })

  convocatorias?.forEach(c => {
    const day = new Date(c.date + 'T00:00:00').getDate()
    if (!eventsByDay[day]) eventsByDay[day] = []
    eventsByDay[day].push({ type: 'convocatoria', title: c.competition_name, color: '#10B981', bg: 'rgba(16,185,129,0.15)' })
  })

  const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
  const daysInMonth = lastDay.getDate()
  const totalCells = Math.ceil((startDayOfWeek + daysInMonth) / 7) * 7
  const days = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - startDayOfWeek + 1
    return dayNum >= 1 && dayNum <= daysInMonth ? dayNum : null
  })

  // Atletas de baja este mes
  const bajasActivas = injuries?.filter(inj => {
    const start = inj.start_date
    const end = inj.end_date
    return start <= lastStr && (end === null || end >= firstStr)
  }) || []

  const monthName = firstDay.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  const today = now.getDate()
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  // Próximos eventos del mes
  const allEvents: { day: number, title: string, type: string, color: string }[] = []
  Object.entries(eventsByDay).forEach(([day, events]) => {
    events.forEach(e => allEvents.push({ day: parseInt(day), ...e }))
  })
  allEvents.sort((a, b) => a.day - b.day)
  const upcoming = allEvents.filter(e => e.day >= today)

  return (
    <main className="cal-main" style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <style>{`
        @media (max-width: 768px) {
          .cal-main { padding: 16px !important; }
          .cal-layout { grid-template-columns: 1fr !important; }
          .cal-legend { flex-wrap: wrap !important; gap: 8px !important; }
        }
      `}</style>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em', margin: 0, textTransform: 'capitalize' }}>{monthName}</h1>
            <p style={{ color: '#3A4A70', fontSize: '13px', marginTop: '6px' }}>
              {sessions?.length || 0} entrenamientos · {competitions?.length || 0} competiciones · {convocatorias?.length || 0} convocatorias
            </p>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {[
              { color: '#4BA3D9', label: 'Entrenamiento' },
              { color: '#F59E0B', label: 'Competición' },
              { color: '#10B981', label: 'Convocatoria' },
              { color: '#EF4444', label: 'Baja' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: l.color }} />
                <span style={{ color: '#3A4A70', fontSize: '12px' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="cal-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '16px' }}>

          {/* Calendario */}
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
            {/* Días de la semana */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: '1px solid rgba(75,163,217,0.08)' }}>
              {weekDays.map(d => (
                <div key={d} style={{ padding: '10px', textAlign: 'center', color: '#2A3550', fontSize: '11px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Días */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
              {days.map((day, index) => (
                <div key={index} style={{
                  minHeight: '80px', padding: '8px',
                  borderBottom: Math.floor(index / 7) < Math.floor(totalCells / 7) - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                  borderRight: index % 7 < 6 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                  backgroundColor: day === today ? 'rgba(75,163,217,0.04)' : 'transparent',
                }}>
                  {day && (
                    <>
                      <div style={{
                        width: '26px', height: '26px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: day === today ? '800' : '400', marginBottom: '4px',
                        backgroundColor: day === today ? '#4BA3D9' : 'transparent',
                        color: day === today ? 'white' : eventsByDay[day] ? '#CDD0E0' : '#2A3550',
                      }}>
                        {day}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {eventsByDay[day]?.slice(0, 2).map((event, i) => (
                          <div key={i} style={{ fontSize: '10px', padding: '2px 5px', borderRadius: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', backgroundColor: event.bg, color: event.color, fontWeight: '600' }}>
                            {event.title}
                          </div>
                        ))}
                        {(eventsByDay[day]?.length || 0) > 2 && (
                          <div style={{ fontSize: '9px', color: '#3A4A70', paddingLeft: '5px' }}>+{(eventsByDay[day]?.length || 0) - 2} más</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Panel lateral */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Hoy */}
            <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '14px', padding: '16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#4BA3D9,transparent)' }} />
              <div style={{ color: '#3A4A70', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Hoy</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#4BA3D9', letterSpacing: '-0.02em' }}>{today}</div>
              <div style={{ color: '#CDD0E0', fontSize: '12px', marginTop: '2px', textTransform: 'capitalize' }}>
                {now.toLocaleDateString('es-ES', { weekday: 'long', month: 'long' })}
              </div>
              {eventsByDay[today] ? (
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {eventsByDay[today].map((e, i) => (
                    <div key={i} style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', backgroundColor: e.bg, color: e.color, fontWeight: '600' }}>{e.title}</div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#2A3550', fontSize: '11px', marginTop: '8px' }}>Sin eventos hoy</div>
              )}
            </div>

            {/* Bajas por lesión */}
            {bajasActivas.length > 0 && (
              <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px' }}>🩹</span>
                  <p style={{ color: '#EF4444', fontSize: '12px', fontWeight: '700', margin: 0 }}>Bajas este mes ({bajasActivas.length})</p>
                </div>
                {bajasActivas.map((inj, i) => {
                  const days = inj.end_date
                    ? Math.ceil((new Date(inj.end_date+'T00:00:00').getTime() - new Date(inj.start_date+'T00:00:00').getTime()) / (1000*60*60*24))
                    : Math.floor((Date.now() - new Date(inj.start_date+'T00:00:00').getTime()) / (1000*60*60*24))
                  return (
                    <div key={inj.id} style={{ padding: '10px 16px', borderBottom: i < bajasActivas.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                      <div style={{ color: '#CDD0E0', fontSize: '12px', fontWeight: '600' }}>{inj.athletes?.first_name} {inj.athletes?.last_name}</div>
                      <div style={{ color: '#EF4444', fontSize: '10px', marginTop: '2px' }}>{inj.type} · {inj.body_part}</div>
                      <div style={{ color: '#3A4A70', fontSize: '10px' }}>
                        {inj.end_date ? `Alta: ${new Date(inj.end_date+'T00:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'})}` : `${days}d de baja`}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Próximos eventos */}
            <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
                <p style={{ color: '#CDD0E0', fontSize: '12px', fontWeight: '600', margin: 0 }}>Próximos eventos</p>
              </div>
              {upcoming.length > 0 ? upcoming.slice(0, 6).map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: i < Math.min(upcoming.length, 6) - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: `${e.color}15`, border: `1px solid ${e.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', color: e.color, flexShrink: 0 }}>
                    {e.day}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#CDD0E0', fontSize: '12px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                    <div style={{ color: e.color, fontSize: '10px', marginTop: '1px' }}>{e.type === 'competition' ? 'Competición' : e.type === 'convocatoria' ? 'Convocatoria' : 'Entrenamiento'}</div>
                  </div>
                </div>
              )) : (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#2A3550', fontSize: '12px' }}>Sin eventos próximos</div>
              )}
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}
