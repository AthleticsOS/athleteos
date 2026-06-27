import { supabase } from '@/app/lib/supabase'

export default async function Stats() {
  const { data: athletes } = await supabase.from('athletes').select('*')
  const { data: competitions } = await supabase.from('competitions').select('*')
  const { data: sessions } = await supabase.from('training_sessions').select('*')
  const { data: payments } = await supabase.from('payments').select('*')
  const { data: records } = await supabase.from('personal_records').select('*')
  const { data: results } = await supabase.from('competition_results').select('*')

  const totalIngresos = payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount_cents, 0) || 0
  const totalPendiente = payments?.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount_cents, 0) || 0
  const podios = results?.filter(r => r.position <= 3).length || 0
  const oros = results?.filter(r => r.position === 1).length || 0

  const deporteCount: Record<string, number> = {}
  athletes?.forEach(a => { deporteCount[a.sport] = (deporteCount[a.sport] || 0) + 1 })
  const deportes = Object.entries(deporteCount).sort((a, b) => b[1] - a[1])

  const categoriaCount: Record<string, number> = {}
  athletes?.forEach(a => { categoriaCount[a.category] = (categoriaCount[a.category] || 0) + 1 })
  const categorias = Object.entries(categoriaCount).sort((a, b) => b[1] - a[1])

  const totalDeportistas = athletes?.length || 0
  const totalResultados = results?.length || 0

  return (
    <main style={{minHeight:'100vh', backgroundColor:'#080808', padding:'32px 36px'}}>
      <div style={{maxWidth:'1000px', margin:'0 auto'}}>

        <div style={{marginBottom:'32px'}}>
          <h1 style={{fontSize:'24px', fontWeight:'700', color:'#F0F0F0', letterSpacing:'-0.02em', margin:0}}>Estadísticas</h1>
          <p style={{color:'#333', fontSize:'13px', marginTop:'6px'}}>WeAthletics · Temporada 2024–2025</p>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'16px'}}>
          {[
            { label:'Ingresos cobrados', value:`€${(totalIngresos/100).toFixed(2)}`, sub: totalPendiente > 0 ? `€${(totalPendiente/100).toFixed(2)} pendientes` : 'Todo cobrado', color:'#10B981' },
            { label:'Podios conseguidos', value:String(podios), sub:`${oros} oros esta temporada`, color:'#EAB308' },
            { label:'Récords personales', value:String(records?.length || 0), sub:`En ${totalResultados} resultados`, color:'#6366F1' },
          ].map(stat => (
            <div key={stat.label} style={{
              backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)',
              borderRadius:'14px', padding:'20px',
            }}>
              <div style={{color:'#333', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'12px'}}>{stat.label}</div>
              <div style={{fontSize:'28px', fontWeight:'700', color:stat.color, letterSpacing:'-0.02em'}}>{stat.value}</div>
              <div style={{color:'#444', fontSize:'12px', marginTop:'6px'}}>{stat.sub}</div>
            </div>
          ))}
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'16px'}}>
          {[
            { label:'Deportistas', value:totalDeportistas },
            { label:'Competiciones', value:competitions?.length || 0 },
            { label:'Sesiones', value:sessions?.length || 0 },
            { label:'Resultados', value:totalResultados },
          ].map(stat => (
            <div key={stat.label} style={{
              backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)',
              borderRadius:'14px', padding:'18px', textAlign:'center',
            }}>
              <div style={{fontSize:'28px', fontWeight:'700', color:'#E0E0E0', letterSpacing:'-0.02em'}}>{stat.value}</div>
              <div style={{color:'#333', fontSize:'12px', marginTop:'6px'}}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'16px'}}>
          {[
            { title:'Deportistas por deporte', data:deportes, color:'#6366F1' },
            { title:'Deportistas por categoría', data:categorias, color:'#8B5CF6' },
          ].map(section => (
            <div key={section.title} style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'20px'}}>
              <p style={{color:'#888', fontSize:'13px', fontWeight:'500', margin:'0 0 16px'}}>{section.title}</p>
              <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                {section.data.map(([name, count]) => (
                  <div key={name}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
                      <span style={{color:'#888', fontSize:'12px'}}>{name}</span>
                      <span style={{color:'#444', fontSize:'12px'}}>{count}</span>
                    </div>
                    <div style={{height:'4px', backgroundColor:'rgba(255,255,255,0.04)', borderRadius:'2px', overflow:'hidden'}}>
                      <div style={{
                        height:'100%', borderRadius:'2px',
                        background:`linear-gradient(90deg, ${section.color}, ${section.color}88)`,
                        width:`${(count/totalDeportistas)*100}%`,
                      }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'20px'}}>
          <p style={{color:'#888', fontSize:'13px', fontWeight:'500', margin:'0 0 16px'}}>Resumen de la temporada</p>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0'}}>
            {[
              { label:'Ratio podios / competiciones', value: totalResultados > 0 ? `${Math.round((podios/totalResultados)*100)}%` : '—' },
              { label:'Competiciones próximas', value: competitions?.filter(c => c.status === 'upcoming').length || 0 },
              { label:'Media ingresos por deportista', value: totalDeportistas > 0 ? `€${((totalIngresos/100)/totalDeportistas).toFixed(0)}` : '—' },
              { label:'Competiciones finalizadas', value: competitions?.filter(c => c.status === 'finished').length || 0 },
              { label:'Sesiones por deportista', value: totalDeportistas > 0 ? ((sessions?.length || 0)/totalDeportistas).toFixed(1) : '—' },
              { label:'Estado de pagos', value: totalPendiente > 0 ? '⚠ Pendientes' : '✓ Al día' },
            ].map((item, i) => (
              <div key={item.label} style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'12px 0',
                borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                marginRight: i % 2 === 0 ? '24px' : '0',
              }}>
                <span style={{color:'#444', fontSize:'13px'}}>{item.label}</span>
                <span style={{color:'#888', fontSize:'13px', fontWeight:'600'}}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}