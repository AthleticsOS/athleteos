import { supabase } from '@/app/lib/supabase'

export default async function Notifications() {
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })

  const unread = notifications?.filter(n => !n.read).length || 0

  const typeConfig: Record<string, { color: string, bg: string, icon: string }> = {
    info: { color: '#60A5FA', bg: 'rgba(96,165,250,0.1)', icon: 'ℹ️' },
    success: { color: '#4ADE80', bg: 'rgba(74,222,128,0.1)', icon: '✅' },
    warning: { color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', icon: '⚠️' },
    urgent: { color: '#F87171', bg: 'rgba(248,113,113,0.1)', icon: '🚨' },
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-white">Notificaciones</h1>
            <p className="text-[#555] text-sm mt-1">
              {unread > 0 ? `${unread} sin leer` : 'Todo leído'}
            </p>
          </div>
        </div>

        {notifications && notifications.length > 0 ? (
          <div className="flex flex-col gap-3">
            {notifications.map((notif) => {
              const config = typeConfig[notif.type] || typeConfig.info
              return (
                <div key={notif.id}
                  style={{
                    background: notif.read ? '#111' : config.bg,
                    border: `1px solid ${notif.read ? '#1A1A1A' : config.color}30`,
                    borderRadius: '16px',
                    padding: '16px 20px',
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'flex-start',
                    opacity: notif.read ? 0.6 : 1,
                  }}>
                  <span style={{fontSize:'20px', flexShrink:0, marginTop:'2px'}}>{config.icon}</span>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', marginBottom:'4px'}}>
                      <p style={{color:'white', fontSize:'14px', fontWeight:'500'}}>{notif.title}</p>
                      <span style={{color:'#444', fontSize:'11px', flexShrink:0}}>
                        {new Date(notif.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{color:'#888', fontSize:'13px', lineHeight:'1.5'}}>{notif.body}</p>
                    {notif.link && (
                      <a href={notif.link} style={{color: config.color, fontSize:'12px', marginTop:'8px', display:'inline-block'}}>
                        Ver más →
                      </a>
                    )}
                  </div>
                  {!notif.read && (
                    <div style={{width:'8px', height:'8px', borderRadius:'50%', background: config.color, flexShrink:0, marginTop:'6px'}}></div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl p-16 text-center">
            <p className="text-4xl mb-4">🔔</p>
            <p className="text-white font-medium mb-2">Sin notificaciones</p>
            <p className="text-[#555] text-sm">Aquí aparecerán los avisos importantes del club</p>
          </div>
        )}
      </div>
    </main>
  )
}