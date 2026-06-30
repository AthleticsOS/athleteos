import { supabase } from '@/app/lib/supabase'
import EnviarMensajeForm from '@/app/components/EnviarMensajeForm'

type Props = { params: Promise<{ athleteId: string }> }

export default async function ConversacionPage({ params }: Props) {
  const { athleteId } = await params
  const { data: athlete } = await supabase.from('athletes').select('id, first_name, last_name, user_id').eq('id', athleteId).single()
  const { data: messages } = await supabase
    .from('direct_messages')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('created_at', { ascending: true })

  const initials = athlete ? athlete.first_name[0] + athlete.last_name[0] : '?'

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '20px' }}>
          <a href="/communication/mensajes" style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← Mensajes</a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: 'white' }}>{initials}</div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#F0F4FF', margin: 0 }}>{athlete?.first_name} {athlete?.last_name}</h1>
              <div style={{ color: '#3A4A70', fontSize: '12px' }}>Atleta</div>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        <div style={{ flex: 1, backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '16px', overflowY: 'auto', minHeight: '300px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(!messages || messages.length === 0) && (
            <div style={{ textAlign: 'center', color: '#2A3550', fontSize: '12px', marginTop: '40px' }}>Sin mensajes todavía</div>
          )}
          {messages?.map(m => (
            <div key={m.id} style={{ display: 'flex', justifyContent: m.from_director ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '70%', padding: '10px 14px', borderRadius: m.from_director ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                backgroundColor: m.from_director ? 'rgba(30,42,94,0.8)' : 'rgba(75,163,217,0.08)',
                border: `1px solid ${m.from_director ? 'rgba(75,163,217,0.2)' : 'rgba(75,163,217,0.1)'}`,
              }}>
                <div style={{ color: '#CDD0E0', fontSize: '13px', lineHeight: '1.5' }}>{m.content}</div>
                <div style={{ color: '#2A3550', fontSize: '10px', marginTop: '4px', textAlign: 'right' }}>
                  {new Date(m.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} · {new Date(m.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <EnviarMensajeForm athleteId={athleteId} athleteUserId={athlete?.user_id} athleteName={athlete?.first_name} />
      </div>
    </main>
  )
}
