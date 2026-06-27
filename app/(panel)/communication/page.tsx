import { supabase } from '@/app/lib/supabase'

export default async function Communication() {
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })

  const typeConfig: Record<string, { color: string, bg: string, border: string, label: string }> = {
    info: { color: '#818CF8', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', label: 'Aviso' },
    success: { color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', label: 'Buenas noticias' },
    warning: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', label: 'Atención' },
    urgent: { color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', label: 'Urgente' },
  }

  return (
    <main style={{minHeight:'100vh', backgroundColor:'#080808', padding:'32px 36px'}}>
      <div style={{maxWidth:'900px', margin:'0 auto'}}>

        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'32px'}}>
          <div>
            <h1 style={{fontSize:'24px', fontWeight:'700', color:'#F0F0F0', letterSpacing:'-0.02em', margin:0}}>Comunicación</h1>
            <p style={{color:'#333', fontSize:'13px', marginTop:'6px'}}>Avisos y anuncios del club</p>
          </div>
          <a href="/communication/nuevo" style={{
            padding:'9px 16px', borderRadius:'9px',
            background:'linear-gradient(135deg, #6366F1, #8B5CF6)',
            color:'white', fontSize:'13px', fontWeight:'600',
            boxShadow:'0 0 20px rgba(99,102,241,0.3)',
          }}>
            + Nuevo aviso
          </a>
        </div>

        {announcements && announcements.length > 0 ? (
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {announcements.map((ann) => {
              const config = typeConfig[ann.type] || typeConfig.info
              return (
                <div key={ann.id} style={{
                  backgroundColor:'#0E0E0E',
                  border:`1px solid ${ann.pinned ? config.border : 'rgba(255,255,255,0.06)'}`,
                  borderRadius:'14px', padding:'20px',
                  borderLeft: `3px solid ${config.color}`,
                }}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                      {ann.pinned && <span style={{color:'#6366F1', fontSize:'11px', fontWeight:'600'}}>📌 Fijado</span>}
                      <span style={{
                        padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600',
                        backgroundColor: config.bg, color: config.color, border: `1px solid ${config.border}`,
                      }}>
                        {config.label}
                      </span>
                    </div>
                    <span style={{color:'#2A2A2A', fontSize:'11px'}}>
                      {new Date(ann.created_at).toLocaleDateString('es-ES', { day:'numeric', month:'long' })}
                    </span>
                  </div>
                  <h3 style={{color:'#E0E0E0', fontSize:'15px', fontWeight:'600', margin:'0 0 8px'}}>{ann.title}</h3>
                  <p style={{color:'#555', fontSize:'13px', lineHeight:'1.6', margin:0}}>{ann.content}</p>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'60px 20px', textAlign:'center'}}>
            <p style={{color:'#333', marginBottom:'16px'}}>No hay avisos publicados todavía</p>
            <a href="/communication/nuevo" style={{color:'#6366F1', fontSize:'13px'}}>Crear el primero →</a>
          </div>
        )}
      </div>
    </main>
  )
}