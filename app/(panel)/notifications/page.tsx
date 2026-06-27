import { supabase } from '@/app/lib/supabase'

export default async function Notifications() {
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })

  const unread = notifications?.filter(n => !n.read).length || 0

  const typeConfig: Record<string, { color: string, bg: string, icon: string }> = {
    info: { color: '#818CF8', bg: 'rgba(99,102,241,0.08)', icon: 'ℹ️' },
    success: { color: '#10B981', bg: 'rgba(16,185,129,0.08)', icon: '✅' },
    warning: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', icon: '⚠️' },
    urgent: { color: '#EF4444', bg: 'rgba(239,68,68,0.08)', icon: '🚨' },
  }

  return (
    <main style={{minHeight:'100vh', backgroundColor:'#080808', padding:'32px 36px'}}>
      <div style={{maxWidth:'800px', margin:'0 auto'}}>

        <div style={{marginBottom:'32px'}}>
          <h1 style={{fontSize:'24px', fontWeight:'700', color:'#F0F0F0', letterSpacing:'-0.02em', margin:0}}>Notificaciones</h1>
          <p style={{color:'#333', fontSize:'13px', marginTop:'6px'}}>
            {unread > 0 ? `${unread} sin leer` : 'Todo leído'}
          </p>
        </div>

        {notifications && notifications.length > 0 ? (
          <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
            {notifications.map((notif) => {
              const config = typeConfig[notif.type] || typeConfig.info
              return (
                <div key={notif.id} style={{
                  display:'flex', gap:'14px', alignItems:'flex-start',
                  backgroundColor: notif.read ? '#0E0E0E' : '#111',
                  border:`1px solid ${notif.read ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius:'14px', padding:'16px 20px',
                  opacity: notif.read ? 0.6 : 1,
                }}>
                  <div style={{
                    width:'36px', height:'36px', borderRadius:'10px', flexShrink:0,
                    backgroundColor: config.bg,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'18px',
                  }}>
                    {config.icon}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'4px'}}>
                      <p style={{color:'#E0E0E0', fontSize:'14px', fontWeight:'600', margin:0}}>{notif.title}</p>
                      <span style={{color:'#2A2A2A', fontSize:'11px', flexShrink:0, marginLeft:'12px'}}>
                        {new Date(notif.created_at).toLocaleDateString('es-ES', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                      </span>
                    </div>
                    <p style={{color:'#555', fontSize:'13px', lineHeight:'1.5', margin:0}}>{notif.body}</p>
                    {notif.link && (
                      <a href={notif.link} style={{color: config.color, fontSize:'12px', marginTop:'8px', display:'inline-block', fontWeight:'500'}}>
                        Ver más →
                      </a>
                    )}
                  </div>
                  {!notif.read && (
                    <div style={{width:'7px', height:'7px', borderRadius:'50%', backgroundColor: config.color, flexShrink:0, marginTop:'5px'}}/>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'80px 20px', textAlign:'center'}}>
            <div style={{fontSize:'40px', marginBottom:'16px'}}>🔔</div>
            <p style={{color:'#E0E0E0', fontSize:'15px', fontWeight:'600', margin:'0 0 8px'}}>Sin notificaciones</p>
            <p style={{color:'#333', fontSize:'13px', margin:0}}>Aquí aparecerán los avisos importantes del club</p>
          </div>
        )}
      </div>
    </main>
  )
}