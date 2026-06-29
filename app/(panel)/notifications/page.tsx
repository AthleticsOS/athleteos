import { supabase } from '@/app/lib/supabase'
import MarcarLeidoButton from '@/app/components/MarcarLeidoButton'

export default async function Notifications() {
  const { data: notifications } = await supabase.from('notifications').select('*').order('created_at', { ascending: false })

  // Generar notificaciones automáticas del sistema
  const { data: payments } = await supabase.from('payments').select('*, athletes(first_name, last_name)').eq('status', 'overdue')
  const { data: convocatorias } = await supabase.from('convocatorias').select('*').gte('date', new Date().toISOString().split('T')[0]).order('date', { ascending: true }).limit(3)

  const unread = notifications?.filter(n => !n.read).length || 0

  const typeConfig: Record<string, { color: string, bg: string, border: string }> = {
    info:    { color: '#4BA3D9', bg: 'rgba(75,163,217,0.08)',  border: 'rgba(75,163,217,0.15)' },
    success: { color: '#10B981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.15)' },
    warning: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.15)' },
    urgent:  { color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.15)' },
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em', margin: 0 }}>Notificaciones</h1>
            <p style={{ color: '#3A4A70', fontSize: '13px', marginTop: '6px' }}>{unread > 0 ? `${unread} sin leer` : 'Todo leído'}</p>
          </div>
        </div>

        {/* Alertas automáticas del sistema */}
        {(payments && payments.length > 0 || convocatorias && convocatorias.length > 0) && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ color: '#3A4A70', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Alertas del sistema</div>

            {payments && payments.map(p => (
              <div key={p.id} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', backgroundColor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '12px', padding: '14px 18px', marginBottom: '8px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', backgroundColor: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>💸</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#EF4444', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>Pago vencido</div>
                  <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600' }}>{p.athletes?.first_name} {p.athletes?.last_name}</div>
                  <div style={{ color: '#4A5580', fontSize: '12px', marginTop: '2px' }}>{p.concept} · €{(p.amount_cents/100).toFixed(0)}</div>
                </div>
                <a href="/finances" style={{ padding: '5px 12px', borderRadius: '7px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: '11px', fontWeight: '600', textDecoration: 'none', flexShrink: 0 }}>Ver</a>
              </div>
            ))}

            {convocatorias && convocatorias.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '12px', padding: '14px 18px', marginBottom: '8px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', backgroundColor: 'rgba(75,163,217,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>📣</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#4BA3D9', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>Convocatoria próxima</div>
                  <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600' }}>{c.competition_name}</div>
                  <div style={{ color: '#4A5580', fontSize: '12px', marginTop: '2px' }}>{new Date(c.date+'T00:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'long'})} · {(c.athlete_ids||[]).length} convocados</div>
                </div>
                <a href="/convocatorias" style={{ padding: '5px 12px', borderRadius: '7px', backgroundColor: 'rgba(75,163,217,0.1)', border: '1px solid rgba(75,163,217,0.2)', color: '#4BA3D9', fontSize: '11px', fontWeight: '600', textDecoration: 'none', flexShrink: 0 }}>Ver</a>
              </div>
            ))}
          </div>
        )}

        {/* Notificaciones manuales */}
        {notifications && notifications.length > 0 ? (
          <div>
            <div style={{ color: '#3A4A70', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Historial</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {notifications.map(notif => {
                const config = typeConfig[notif.type] || typeConfig.info
                return (
                  <div key={notif.id} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', backgroundColor: '#0A0E1A', border: `1px solid ${notif.read ? 'rgba(255,255,255,0.04)' : config.border}`, borderRadius: '12px', padding: '14px 18px', opacity: notif.read ? 0.6 : 1 }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '9px', backgroundColor: config.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: config.color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600' }}>{notif.title}</span>
                        <span style={{ color: '#2A3550', fontSize: '11px', flexShrink: 0, marginLeft: '12px' }}>
                          {new Date(notif.created_at).toLocaleDateString('es-ES',{day:'numeric',month:'short'})}
                        </span>
                      </div>
                      <p style={{ color: '#4A5580', fontSize: '12px', lineHeight: '1.5', margin: 0 }}>{notif.body}</p>
                      {notif.link && <a href={notif.link} style={{ color: config.color, fontSize: '12px', marginTop: '6px', display: 'inline-block', fontWeight: '500' }}>Ver más →</a>}
                    </div>
                    {!notif.read && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: config.color }} />
                        <MarcarLeidoButton notifId={notif.id} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : payments?.length === 0 && convocatorias?.length === 0 && (
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.08)', borderRadius: '16px', padding: '80px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '14px' }}>🔔</div>
            <p style={{ color: '#CDD0E0', fontSize: '15px', fontWeight: '700', margin: '0 0 8px' }}>Sin notificaciones</p>
            <p style={{ color: '#2A3550', fontSize: '13px', margin: 0 }}>Aquí aparecerán los avisos importantes del club</p>
          </div>
        )}
      </div>
    </main>
  )
}
