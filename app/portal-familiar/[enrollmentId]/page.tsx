import { supabase } from '@/app/lib/supabase'

type Props = { params: Promise<{ enrollmentId: string }> }

export default async function PortalFamiliar({ params }: Props) {
  const { enrollmentId } = await params
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('*, activities(name, schedule, teacher, schools(name))')
    .eq('id', enrollmentId)
    .single()

  if (!enrollment) return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#3A4A70', fontSize: '14px' }}>Inscripción no encontrada</div>
    </main>
  )

  const { data: messages } = await supabase
    .from('parent_messages')
    .select('*')
    .eq('enrollment_id', enrollmentId)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: payments } = await supabase
    .from('activity_payments')
    .select('*')
    .eq('enrollment_id', enrollmentId)
    .order('created_at', { ascending: false })

  const { data: sessions } = await supabase
    .from('activity_sessions')
    .select('*, activity_attendance(enrollment_id, present)')
    .eq('activity_id', enrollment.activity_id)
    .order('date', { ascending: false })
    .limit(10)

  const pendingPayments = payments?.filter(p => p.status !== 'paid') || []
  const attendedSessions = sessions?.filter(s =>
    s.activity_attendance?.some((a: any) => a.enrollment_id === enrollmentId && a.present)
  ).length || 0
  const totalSessions = sessions?.length || 0

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', fontFamily: "-apple-system,'Inter',sans-serif" }}>
      {/* NAV */}
      <nav style={{ backgroundColor: '#070B18', borderBottom: '1px solid rgba(75,163,217,0.1)', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/escudo-wa.png?v=3" alt="WeAthletics" width={28} height={28} style={{ borderRadius: '50%' }} />
        <span style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '700' }}>WeAthletics · Portal Familiar</span>
      </nav>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '28px 24px' }}>

        {/* Cabecera alumno */}
        <div style={{ background: 'linear-gradient(135deg,#0A0F1E,#0D1428)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '20px', padding: '24px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#4BA3D9,transparent)' }} />
          <div style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
            {enrollment.activities?.schools?.name}
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#F0F4FF', margin: '0 0 4px' }}>{enrollment.student_name}</h1>
          <div style={{ color: '#4BA3D9', fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>{enrollment.activities?.name}</div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {enrollment.activities?.schedule && <span style={{ color: '#3A4A70', fontSize: '12px' }}>🕐 {enrollment.activities.schedule}</span>}
            {enrollment.activities?.teacher && <span style={{ color: '#3A4A70', fontSize: '12px' }}>👤 {enrollment.activities.teacher}</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '16px' }}>
            {[
              { label: 'Sesiones', value: `${attendedSessions}/${totalSessions}`, color: '#4BA3D9' },
              { label: 'Asistencia', value: totalSessions > 0 ? `${Math.round((attendedSessions/totalSessions)*100)}%` : '—', color: '#10B981' },
              { label: 'Pagos pend.', value: String(pendingPayments.length), color: pendingPayments.length > 0 ? '#F59E0B' : '#3A4A70' },
            ].map(s => (
              <div key={s.label} style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: s.color }}>{s.value}</div>
                <div style={{ color: '#2A3550', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagos pendientes */}
        {pendingPayments.length > 0 && (
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '14px', padding: '16px 18px', marginBottom: '12px' }}>
            <div style={{ color: '#F59E0B', fontSize: '13px', fontWeight: '700', marginBottom: '10px' }}>💶 Pagos pendientes</div>
            {pendingPayments.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <div>
                  <div style={{ color: '#CDD0E0', fontSize: '13px' }}>{p.concept}</div>
                  {p.due_date && <div style={{ color: '#3A4A70', fontSize: '11px' }}>Vence: {new Date(p.due_date+'T00:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'long'})}</div>}
                </div>
                <div style={{ color: '#F59E0B', fontSize: '15px', fontWeight: '800' }}>€{((p.amount_cents||0)/100).toFixed(0)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Asistencia reciente */}
        {sessions && sessions.length > 0 && (
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
              <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>Asistencia reciente</p>
            </div>
            {sessions.map((s, i) => {
              const att = s.activity_attendance?.find((a: any) => a.enrollment_id === enrollmentId)
              const present = att?.present ?? null
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 18px', borderBottom: i < sessions.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                  <div style={{ width: '36px', textAlign: 'center', backgroundColor: 'rgba(75,163,217,0.06)', borderRadius: '8px', padding: '5px 4px', flexShrink: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#CDD0E0', lineHeight: 1 }}>{new Date(s.date+'T00:00:00').getDate()}</div>
                    <div style={{ color: '#3A4A70', fontSize: '9px', textTransform: 'uppercase' }}>{new Date(s.date+'T00:00:00').toLocaleDateString('es-ES',{month:'short'})}</div>
                  </div>
                  <div style={{ flex: 1, color: '#4A5580', fontSize: '12px' }}>{s.notes || 'Sesión ordinaria'}</div>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                    backgroundColor: present === null ? 'rgba(255,255,255,0.04)' : present ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)',
                    color: present === null ? '#3A4A70' : present ? '#10B981' : '#EF4444',
                  }}>
                    {present === null ? 'Sin marcar' : present ? 'Presente' : 'Ausente'}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Mensajes del club */}
        {messages && messages.length > 0 && (
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '14px', overflow: 'hidden', marginTop: '12px' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
              <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>✉️ Mensajes del club</p>
            </div>
            {messages.map((msg, i) => (
              <div key={msg.id} style={{ padding: '12px 18px', borderBottom: i < messages.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                <div style={{ color: '#3A4A70', fontSize: '10px', marginBottom: '4px' }}>
                  {new Date(msg.created_at).toLocaleDateString('es-ES',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})}
                </div>
                <div style={{ color: '#CDD0E0', fontSize: '13px', lineHeight: '1.5' }}>{msg.content}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px', color: '#2A3550', fontSize: '11px' }}>
          Powered by AthleteOS · WeAthletics
        </div>
      </div>
    </main>
  )
}
