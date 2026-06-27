import { supabase } from '@/app/lib/supabase'

export default async function Competitions() {
  const { data: competitions } = await supabase
    .from('competitions')
    .select('*')
    .order('date', { ascending: false })

  return (
    <main style={{minHeight:'100vh', backgroundColor:'#080808', padding:'32px 36px'}}>
      <div style={{maxWidth:'1000px', margin:'0 auto'}}>

        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'32px'}}>
          <div>
            <h1 style={{fontSize:'24px', fontWeight:'700', color:'#F0F0F0', letterSpacing:'-0.02em', margin:0}}>Competiciones</h1>
            <p style={{color:'#333', fontSize:'13px', marginTop:'6px'}}>Temporada 2024–2025</p>
          </div>
          <a href="/competitions/nueva" style={{
            padding:'9px 16px', borderRadius:'9px',
            background:'linear-gradient(135deg, #6366F1, #8B5CF6)',
            color:'white', fontSize:'13px', fontWeight:'600',
            boxShadow:'0 0 20px rgba(99,102,241,0.3)',
          }}>
            + Añadir competición
          </a>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
          {competitions && competitions.length > 0 ? (
            competitions.map((comp) => (
              <a href={`/competitions/${comp.id}`} key={comp.id} style={{
                display:'flex', alignItems:'center', gap:'16px',
                backgroundColor:'#0E0E0E',
                border:'1px solid rgba(255,255,255,0.06)',
                borderRadius:'14px', padding:'16px 20px',
              }}
                className="hover:border-white/10 transition-colors">
                <div style={{
                  width:'48px', textAlign:'center', flexShrink:0,
                  backgroundColor:'rgba(255,255,255,0.03)',
                  borderRadius:'10px', padding:'8px 4px',
                }}>
                  <div style={{fontSize:'20px', fontWeight:'700', color:'#E0E0E0', lineHeight:1}}>
                    {new Date(comp.date + 'T00:00:00').getDate()}
                  </div>
                  <div style={{color:'#333', fontSize:'10px', textTransform:'uppercase', marginTop:'2px'}}>
                    {new Date(comp.date + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short' })}
                  </div>
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{color:'#E0E0E0', fontSize:'14px', fontWeight:'600'}}>{comp.name}</div>
                  <div style={{color:'#333', fontSize:'12px', marginTop:'3px'}}>{comp.location} · {comp.sport}</div>
                </div>
                <div style={{display:'flex', gap:'6px', flexShrink:0}}>
                  <span style={{
                    padding:'4px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600',
                    backgroundColor: comp.status === 'upcoming' ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
                    color: comp.status === 'upcoming' ? '#818CF8' : '#444',
                    border: `1px solid ${comp.status === 'upcoming' ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)'}`,
                  }}>
                    {comp.status === 'upcoming' ? 'Próxima' : 'Finalizada'}
                  </span>
                  <span style={{
                    padding:'4px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600',
                    backgroundColor:'rgba(245,158,11,0.1)', color:'#F59E0B',
                    border:'1px solid rgba(245,158,11,0.2)',
                  }}>
                    {comp.level}
                  </span>
                </div>
                <div style={{color:'#222', fontSize:'16px'}}>→</div>
              </a>
            ))
          ) : (
            <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'60px 20px', textAlign:'center'}}>
              <p style={{color:'#333', marginBottom:'16px'}}>No hay competiciones registradas</p>
              <a href="/competitions/nueva" style={{color:'#6366F1', fontSize:'13px'}}>Añadir la primera →</a>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}