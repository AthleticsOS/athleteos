import { supabase } from '@/app/lib/supabase'

export default async function Calendar() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const firstStr = firstDay.toISOString().split('T')[0]
  const lastStr = lastDay.toISOString().split('T')[0]

  const { data: sessions } = await supabase
    .from('training_sessions')
    .select('*')
    .gte('date', firstStr)
    .lte('date', lastStr)

  const { data: competitions } = await supabase
    .from('competitions')
    .select('*')
    .gte('date', firstStr)
    .lte('date', lastStr)

  const eventsByDay: Record<number, { type: string, title: string, color: string }[]> = {}

  sessions?.forEach(s => {
    const day = new Date(s.date + 'T00:00:00').getDate()
    if (!eventsByDay[day]) eventsByDay[day] = []
    eventsByDay[day].push({ type: 'training', title: s.title, color: '#7C3AED' })
  })

  competitions?.forEach(c => {
    const day = new Date(c.date + 'T00:00:00').getDate()
    if (!eventsByDay[day]) eventsByDay[day] = []
    eventsByDay[day].push({ type: 'competition', title: c.name, color: '#D97706' })
  })

  const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
  const daysInMonth = lastDay.getDate()
  const totalCells = Math.ceil((startDayOfWeek + daysInMonth) / 7) * 7
  const days = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - startDayOfWeek + 1
    return dayNum >= 1 && dayNum <= daysInMonth ? dayNum : null
  })

  const monthName = firstDay.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  const today = now.getDate()
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-white capitalize">{monthName}</h1>
            <p className="text-[#555] text-sm mt-1">
              {sessions?.length || 0} entrenamientos · {competitions?.length || 0} competiciones
            </p>
          </div>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="text-[#555]">Entrenamiento</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-[#555]">Competición</span>
            </div>
          </div>
        </div>

        <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl overflow-hidden">
          <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', borderBottom:'1px solid #1A1A1A'}}>
            {weekDays.map(d => (
              <div key={d} style={{padding:'10px', textAlign:'center', color:'#444', fontSize:'11px', letterSpacing:'0.06em', textTransform:'uppercase'}}>
                {d}
              </div>
            ))}
          </div>

          <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)'}}>
            {days.map((day, index) => (
              <div key={index} style={{
                minHeight:'80px',
                padding:'8px',
                borderBottom: Math.floor(index / 7) < Math.floor(totalCells / 7) - 1 ? '1px solid #161616' : 'none',
                borderRight: index % 7 < 6 ? '1px solid #161616' : 'none',
              }}>
                {day && (
                  <>
                    <div style={{
                      width:'28px', height:'28px', borderRadius:'50%',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'12px', fontWeight:'500', marginBottom:'4px',
                      backgroundColor: day === today ? '#2563EB' : 'transparent',
                      color: day === today ? 'white' : '#555',
                    }}>
                      {day}
                    </div>
                    <div style={{display:'flex', flexDirection:'column', gap:'2px'}}>
                      {eventsByDay[day]?.map((event, i) => (
                        <div key={i} style={{
                          fontSize:'10px',
                          padding:'2px 6px',
                          borderRadius:'4px',
                          overflow:'hidden',
                          textOverflow:'ellipsis',
                          whiteSpace:'nowrap',
                          backgroundColor: `${event.color}20`,
                          color: event.color,
                        }}>
                          {event.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}