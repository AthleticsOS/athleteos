import { supabase } from '@/app/lib/supabase'

export default async function Ranking() {
  const { data: records } = await supabase
    .from('personal_records')
    .select('*, athletes(first_name, last_name, category)')
    .order('mark', { ascending: true })

  const byDiscipline: Record<string, any[]> = {}
  records?.forEach((record) => {
    if (!byDiscipline[record.discipline]) byDiscipline[record.discipline] = []
    byDiscipline[record.discipline].push(record)
  })

  return (
    <main style={{minHeight:'100vh', backgroundColor:'#080808', padding:'32px 36px'}}>
      <div style={{maxWidth:'900px', margin:'0 auto'}}>

        <div style={{marginBottom:'32px'}}>
          <h1 style={{fontSize:'24px', fontWeight:'700', color:'#F0F0F0', letterSpacing:'-0.02em', margin:0}}>Ranking del club</h1>
          <p style={{color:'#333', fontSize:'13px', marginTop:'6px'}}>WeAthletics · Mejores marcas por prueba</p>
        </div>

        {Object.keys(byDiscipline).length > 0 ? (
          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            {Object.entries(byDiscipline).map(([discipline, athleteRecords]) => (
              <div key={discipline} style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden'}}>
                <div style={{padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.04)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <p style={{color:'#888', fontSize:'13px', fontWeight:'600', margin:0}}>{discipline}</p>
                  <span style={{color:'#2A2A2A', fontSize:'11px'}}>{athleteRecords.length} atleta{athleteRecords.length > 1 ? 's' : ''}</span>
                </div>
                {athleteRecords.map((record, index) => (
                  <div key={record.id} style={{
                    display:'flex', alignItems:'center', gap:'14px',
                    padding:'14px 20px',
                    borderBottom: index < athleteRecords.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                  }}>
                    <div style={{
                      width:'28px', height:'28px', borderRadius:'50%', flexShrink:0,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'11px', fontWeight:'800',
                      backgroundColor: index === 0 ? 'rgba(234,179,8,0.2)' : index === 1 ? 'rgba(156,163,175,0.15)' : index === 2 ? 'rgba(180,83,9,0.15)' : 'rgba(255,255,255,0.04)',
                      color: index === 0 ? '#EAB308' : index === 1 ? '#9CA3AF' : index === 2 ? '#B45309' : '#333',
                      border: index === 0 ? '1px solid rgba(234,179,8,0.3)' : 'none',
                    }}>
                      {index + 1}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{color:'#CCC', fontSize:'13px', fontWeight:'500'}}>
                        {record.athletes?.first_name} {record.athletes?.last_name}
                      </div>
                      <div style={{color:'#333', fontSize:'11px', marginTop:'2px'}}>{record.athletes?.category}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{color: index === 0 ? '#EAB308' : '#A5B4FC', fontSize:'15px', fontWeight:'700', fontFamily:'monospace'}}>{record.mark}</div>
                      {record.date && <div style={{color:'#2A2A2A', fontSize:'10px', marginTop:'2px'}}>{new Date(record.date).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' })}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'60px 20px', textAlign:'center'}}>
            <p style={{color:'#333'}}>No hay marcas registradas todavía</p>
          </div>
        )}
      </div>
    </main>
  )
}