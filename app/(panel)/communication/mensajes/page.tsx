import { supabase } from '@/app/lib/supabase'
import NuevoMensajeButton from '@/app/components/NuevoMensajeButton'

export default async function MensajesPage() {
  const { data: threads } = await supabase
    .from('direct_messages')
    .select('*')
    .order('created_at', { ascending: false })

  // Agrupar por thread (athlete_id)
  const byAthlete: Record<string, typeof threads> = {}
  threads?.forEach(m => {
    if (!byAthlete[m.athlete_id]) byAthlete[m.athlete_id] = []
    byAthlete[m.athlete_id]!.push(m)
  })

  const { data: athletes } = await supabase
    .from('athletes')
    .select('id, first_name, last_name')
    .eq('status', 'active')
    .order('first_name')

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <a href="/communication" style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← Comunicación</a>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em', margin: '8px 0 4px' }}>Mensajes directos</h1>
            <p style={{ color: '#3A4A70', fontSize: '13px', margin: 0 }}>Mensajes privados con atletas</p>
          </div>
          <NuevoMensajeButton athletes={athletes || []} />
        </div>

        {Object.keys(byAthlete).length === 0 ? (
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
            <div style={{ color: '#CDD0E0', fontSize: '14px', fontWeight: '600' }}>Sin mensajes todavía</div>
            <div style={{ color: '#3A4A70', fontSize: '12px', marginTop: '4px' }}>Envía el primer mensaje a un atleta</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(byAthlete).map(([athleteId, msgs]) => {
              const ath = athletes?.find(a => a.id === athleteId)
              const last = msgs![0]
              const unread = msgs!.filter(m => !m.read && m.from_director).length
              return (
                <a key={athleteId} href={`/communication/mensajes/${athleteId}`} style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '14px', padding: '14px 18px', textDecoration: 'none', transition: 'border-color 150ms' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                    {ath ? ath.first_name[0] + ath.last_name[0] : '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#CDD0E0', fontSize: '14px', fontWeight: '600' }}>{ath ? `${ath.first_name} ${ath.last_name}` : 'Atleta'}</div>
                    <div style={{ color: '#3A4A70', fontSize: '12px', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{last?.content}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ color: '#2A3550', fontSize: '11px' }}>{last ? new Date(last.created_at).toLocaleDateString('es-ES',{day:'numeric',month:'short'}) : ''}</div>
                    {unread > 0 && <div style={{ marginTop: '4px', backgroundColor: '#4BA3D9', color: 'white', fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '8px', display: 'inline-block' }}>{unread}</div>}
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
