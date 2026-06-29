import { supabase } from '@/app/lib/supabase'
import StrengthChart from '@/app/components/StrengthChart'

type Props = { params: Promise<{ id: string }> }

export default async function AthleteCompetitions({ params }: Props) {
  const { id } = await params

  const { data: athlete } = await supabase.from('athletes').select('*').eq('id', id).single()
  const { data: results } = await supabase
    .from('competition_results')
    .select('*, competitions(name, date, location, level)')
    .eq('athlete_id', id)
    .order('created_at', { ascending: true })

  if (!athlete) return <main style={{minHeight:'100vh',backgroundColor:'#080808',padding:'32px'}}><p style={{color:'#555'}}>No encontrado</p></main>

  const parseTime = (mark: string) => {
    const n = parseFloat(mark.replace(',', '.').replace(/[^0-9.]/g, ''))
    return isNaN(n) ? null : n
  }

  const currentYear = new Date().getFullYear()
  const currentSeason = `${currentYear - 1}-${currentYear}`

  const byDiscipline: Record<string, {
    results: typeof results
    mmp: number | null
    mmt: number | null
    avg: number | null
    lowerIsBetter: boolean
  }> = {}

  results?.forEach(r => {
    const disc = r.discipline
    if (!byDiscipline[disc]) {
      byDiscipline[disc] = { results: [], mmp: null, mmt: null, avg: null, lowerIsBetter: true }
    }
    byDiscipline[disc].results!.push(r)
  })

  Object.entries(byDiscipline).forEach(([disc, data]) => {
    const marks = data.results!
      .map(r => ({ mark: parseTime(r.mark), date: r.competitions?.date, season: r.competitions?.date ? new Date(r.competitions.date).getFullYear() : null }))
      .filter(m => m.mark !== null) as { mark: number, date: string, season: number }[]

    if (marks.length === 0) return

    const lowerIsBetter = !disc.toLowerCase().includes('salto') && !disc.toLowerCase().includes('lanzamiento') && !disc.toLowerCase().includes('altura')
    data.lowerIsBetter = lowerIsBetter

    const allMarks = marks.map(m => m.mark)
    data.mmp = lowerIsBetter ? Math.min(...allMarks) : Math.max(...allMarks)

    const thisSeasonMarks = marks.filter(m => {
      if (!m.date) return false
      const year = new Date(m.date).getFullYear()
      const month = new Date(m.date).getMonth()
      return month >= 9 ? year === currentYear - 1 : year === currentYear
    }).map(m => m.mark)

    if (thisSeasonMarks.length > 0) {
      data.mmt = lowerIsBetter ? Math.min(...thisSeasonMarks) : Math.max(...thisSeasonMarks)
    }

    data.avg = allMarks.reduce((a, b) => a + b, 0) / allMarks.length
  })

  const totalComps = results?.length || 0
  const podios = results?.filter(r => r.position <= 3).length || 0
  const oros = results?.filter(r => r.position === 1).length || 0
  const disciplines = Object.keys(byDiscipline)

  return (
    <main style={{minHeight:'100vh', backgroundColor:'#080808', padding:'32px 36px'}}>
      <div style={{maxWidth:'1000px', margin:'0 auto'}}>

        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'28px'}}>
          <div>
            <a href={`/athletes/${id}`} style={{color:'#444', fontSize:'13px'}}>← Perfil</a>
            <h1 style={{fontSize:'24px', fontWeight:'700', color:'#F0F0F0', letterSpacing:'-0.02em', margin:'6px 0 4px'}}>
              Competiciones
            </h1>
            <p style={{color:'#333', fontSize:'13px', margin:0}}>
              {athlete.first_name} {athlete.last_name} · {athlete.sport}
            </p>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'24px'}}>
          {[
            { label:'Total competiciones', value: String(totalComps), color:'#6366F1' },
            { label:'Podios', value: String(podios), color:'#EAB308' },
            { label:'Oros', value: String(oros), color:'#F59E0B' },
            { label:'Pruebas distintas', value: String(disciplines.length), color:'#10B981' },
          ].map(stat => (
            <div key={stat.label} style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', padding:'16px'}}>
              <div style={{color:'#333', fontSize:'10px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px'}}>{stat.label}</div>
              <div style={{fontSize:'24px', fontWeight:'700', color:stat.color, letterSpacing:'-0.02em'}}>{stat.value}</div>
            </div>
          ))}
        </div>

        {disciplines.map(disc => {
          const data = byDiscipline[disc]
          const chartData = data.results!
            .filter(r => r.competitions?.date && parseTime(r.mark) !== null)
            .map(r => ({
              fecha: new Date(r.competitions!.date + 'T00:00:00').toLocaleDateString('es-ES', {day:'numeric', month:'short', year:'2-digit'}),
              marca: parseTime(r.mark)!,
              competicion: r.competitions?.name || '',
            }))
            .sort((a, b) => a.fecha.localeCompare(b.fecha))

          return (
            <div key={disc} style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden', marginBottom:'12px'}}>
              <div style={{padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px'}}>
                  <h2 style={{fontSize:'16px', fontWeight:'700', color:'#F0F0F0', margin:0}}>{disc}</h2>
                  <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                    {data.mmp !== null && (
                      <div style={{textAlign:'center', backgroundColor:'rgba(234,179,8,0.1)', border:'1px solid rgba(234,179,8,0.2)', borderRadius:'10px', padding:'8px 16px'}}>
                        <div style={{color:'#EAB308', fontSize:'10px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'4px'}}>MMP</div>
                        <div style={{color:'#FDE68A', fontSize:'20px', fontWeight:'800', fontFamily:'monospace'}}>{data.mmp!.toFixed(2)}</div>
                      </div>
                    )}
                    {data.mmt !== null && (
                      <div style={{textAlign:'center', backgroundColor:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:'10px', padding:'8px 16px'}}>
                        <div style={{color:'#818CF8', fontSize:'10px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'4px'}}>MMT</div>
                        <div style={{color:'#A5B4FC', fontSize:'20px', fontWeight:'800', fontFamily:'monospace'}}>{data.mmt!.toFixed(2)}</div>
                      </div>
                    )}
                    {data.avg !== null && (
                      <div style={{textAlign:'center', backgroundColor:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'10px', padding:'8px 16px'}}>
                        <div style={{color:'#555', fontSize:'10px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'4px'}}>Media</div>
                        <div style={{color:'#888', fontSize:'20px', fontWeight:'800', fontFamily:'monospace'}}>{data.avg!.toFixed(2)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {chartData.length >= 2 && (
                <div style={{padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                  <p style={{color:'#444', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', margin:'0 0 10px'}}>Progresión</p>
                  <StrengthChart
                    data={chartData}
                    series={[{key:'marca', label:disc, color:'#6366F1'}]}
                    unit=""
                  />
                </div>
              )}

              <div>
                {data.results!.map((r, i) => (
                  <div key={r.id} style={{
                    display:'flex', alignItems:'center', gap:'14px',
                    padding:'12px 20px',
                    borderBottom: i < data.results!.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                  }}>
                    <div style={{
                      width:'28px', height:'28px', borderRadius:'50%', flexShrink:0,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'11px', fontWeight:'800',
                      backgroundColor: r.position === 1 ? 'rgba(234,179,8,0.2)' : r.position === 2 ? 'rgba(156,163,175,0.15)' : r.position === 3 ? 'rgba(180,83,9,0.15)' : 'rgba(255,255,255,0.04)',
                      color: r.position === 1 ? '#EAB308' : r.position === 2 ? '#9CA3AF' : r.position === 3 ? '#B45309' : '#333',
                    }}>{r.position}º</div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{color:'#CCC', fontSize:'13px', fontWeight:'500'}}>{r.competitions?.name}</div>
                      <div style={{color:'#333', fontSize:'11px', marginTop:'2px'}}>
                        {r.competitions?.location}
                        {r.competitions?.date && ` · ${new Date(r.competitions.date + 'T00:00:00').toLocaleDateString('es-ES', {day:'numeric', month:'short', year:'numeric'})}`}
                        {r.competitions?.level && ` · ${r.competitions.level}`}
                      </div>
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                      {parseTime(r.mark) === data.mmp && (
                        <span style={{padding:'2px 7px', borderRadius:'4px', fontSize:'10px', fontWeight:'700', backgroundColor:'rgba(234,179,8,0.15)', color:'#EAB308'}}>★ MMP</span>
                      )}
                      <div style={{color:'#A5B4FC', fontSize:'15px', fontWeight:'700', fontFamily:'monospace'}}>{r.mark}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {disciplines.length === 0 && (
          <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'60px', textAlign:'center'}}>
            <p style={{color:'#333', marginBottom:'16px'}}>No hay resultados de competición registrados</p>
          </div>
        )}

      </div>
    </main>
  )
}