import { supabase } from '@/app/lib/supabase'
import ExportCSV from '@/app/components/ExportCSV'
import MarcarAsistenciaButton from '@/app/components/MarcarAsistenciaButton'

type Props = { params: Promise<{ schoolId: string, activityId: string }> }

export default async function ActivityDetail({ params }: Props) {
  const { schoolId, activityId } = await params
  const { data: activity } = await supabase.from('activities').select('*, schools(name)').eq('id', activityId).single()
  const { data: enrollments } = await supabase.from('enrollments').select('*').eq('activity_id', activityId).order('student_name')
  const { data: sessions } = await supabase.from('activity_sessions').select('*, activity_attendance(id, enrollment_id, present)').eq('activity_id', activityId).order('date', { ascending: false })
  const { data: payments } = await supabase.from('activity_payments').select('*, enrollments(student_name)').in('enrollment_id', enrollments?.map(e=>e.id) || []).order('created_at', { ascending: false })

  if (!activity) return <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '32px' }}><p style={{ color: '#3A4A70' }}>No encontrado</p></main>

  const active = enrollments?.filter(e => e.status === 'active') || []
  const pendingPayments = payments?.filter(p => p.status !== 'paid').length || 0
  const totalCollected = payments?.filter(p => p.status === 'paid').reduce((s,p) => s + p.amount_cents, 0) || 0

  const exportData = active.map(e => ({
    Alumno: e.student_name,
    Padre_Madre: e.parent_name || '',
    Telefono: e.parent_phone || '',
    Email: e.parent_email || '',
    Fecha_nacimiento: e.student_birth_date || '',
    Notas: e.notes || '',
  }))

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>

        <div style={{ marginBottom: '24px' }}>
          <a href={`/extraescolares/${schoolId}`} style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← {activity.schools?.name}</a>
        </div>

        {/* Cabecera */}
        <div style={{ background: 'linear-gradient(135deg,#0A0F1E 0%,#0D1428 60%,#091020 100%)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '20px', padding: '24px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#4BA3D9,transparent)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#F0F4FF', margin: '0 0 6px' }}>{activity.name}</h1>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {activity.schedule && <span style={{ color: '#3A4A70', fontSize: '13px' }}>🕐 {activity.schedule}</span>}
                {activity.teacher && <span style={{ color: '#3A4A70', fontSize: '13px' }}>👤 {activity.teacher}</span>}
                {activity.price_cents > 0 && <span style={{ color: '#10B981', fontSize: '13px' }}>€{(activity.price_cents/100).toFixed(0)}/mes</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <a href={`/extraescolares/${schoolId}/actividad/${activityId}/sesion`} style={{ padding: '8px 14px', borderRadius: '9px', backgroundColor: 'rgba(75,163,217,0.1)', border: '1px solid rgba(75,163,217,0.2)', color: '#4BA3D9', fontSize: '12px', fontWeight: '600', textDecoration: 'none' }}>+ Sesión</a>
              <a href={`/extraescolares/${schoolId}/actividad/${activityId}/inscripcion`} style={{ padding: '8px 14px', borderRadius: '9px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '12px', fontWeight: '600', textDecoration: 'none' }}>+ Inscripción</a>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
            {[
              { label: 'Inscritos', value: String(active.length) + (activity.max_students ? `/${activity.max_students}` : ''), color: '#4BA3D9' },
              { label: 'Sesiones', value: String(sessions?.length || 0), color: '#F59E0B' },
              { label: 'Cobrado', value: `€${(totalCollected/100).toFixed(0)}`, color: '#10B981' },
              { label: 'Pagos pend.', value: String(pendingPayments), color: pendingPayments > 0 ? '#EF4444' : '#3A4A70' },
            ].map(s => (
              <div key={s.label} style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: s.color }}>{s.value}</div>
                <div style={{ color: '#2A3550', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '3px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>

          {/* Alumnos inscritos */}
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
              <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>Alumnos inscritos · {active.length}</p>
              <ExportCSV data={exportData} filename={`alumnos_${activity.name.replace(/\s/g,'_')}`} label="CSV" />
            </div>
            {active.length > 0 ? active.map((e, i) => (
              <div key={e.id} style={{ padding: '11px 18px', borderBottom: i < active.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '500' }}>{e.student_name}</div>
                <div style={{ color: '#2A3550', fontSize: '11px', marginTop: '1px' }}>
                  {e.parent_name && `${e.parent_name}`}{e.parent_phone && ` · ${e.parent_phone}`}
                </div>
              </div>
            )) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#2A3550', fontSize: '12px' }}>Sin alumnos inscritos</div>
            )}
          </div>

          {/* Pagos */}
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
              <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>Pagos recientes</p>
            </div>
            {payments && payments.length > 0 ? payments.slice(0,6).map((p, i) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px', borderBottom: i < Math.min(payments.length,6)-1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#CDD0E0', fontSize: '12px', fontWeight: '500' }}>{p.enrollments?.student_name}</div>
                  <div style={{ color: '#2A3550', fontSize: '11px' }}>{p.concept}</div>
                </div>
                <div style={{ color: '#F0F4FF', fontSize: '13px', fontWeight: '700', fontFamily: 'monospace' }}>€{(p.amount_cents/100).toFixed(0)}</div>
                <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', backgroundColor: p.status==='paid'?'rgba(16,185,129,0.1)':'rgba(245,158,11,0.1)', color: p.status==='paid'?'#10B981':'#F59E0B', border: `1px solid ${p.status==='paid'?'rgba(16,185,129,0.2)':'rgba(245,158,11,0.2)'}` }}>
                  {p.status==='paid'?'Pagado':'Pendiente'}
                </span>
              </div>
            )) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#2A3550', fontSize: '12px' }}>Sin pagos registrados</div>
            )}
          </div>
        </div>

        {/* Sesiones y asistencia */}
        {sessions && sessions.length > 0 && (
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
              <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>Sesiones · {sessions.length}</p>
            </div>
            {sessions.map((s, i) => {
              const present = s.activity_attendance?.filter((a:any) => a.present).length || 0
              const pct = active.length > 0 ? Math.round((present/active.length)*100) : 0
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 18px', borderBottom: i < sessions.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                  <div style={{ width: '36px', textAlign: 'center', flexShrink: 0, backgroundColor: 'rgba(75,163,217,0.06)', borderRadius: '8px', padding: '5px 4px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#CDD0E0', lineHeight: 1 }}>{new Date(s.date+'T00:00:00').getDate()}</div>
                    <div style={{ color: '#3A4A70', fontSize: '9px', textTransform: 'uppercase' }}>{new Date(s.date+'T00:00:00').toLocaleDateString('es-ES',{month:'short'})}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div style={{ flex: 1, height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444', borderRadius: '4px' }} />
                      </div>
                      <span style={{ color: '#CDD0E0', fontSize: '12px', fontWeight: '600', flexShrink: 0 }}>{present}/{active.length}</span>
                    </div>
                    {s.notes && <div style={{ color: '#2A3550', fontSize: '11px' }}>{s.notes}</div>}
                  </div>
                  <MarcarAsistenciaButton sessionId={s.id} enrollments={active.map(e=>({id:e.id,name:e.student_name}))} attendance={s.activity_attendance || []} />
                </div>
              )
            })}
          </div>
        )}

      </div>
    </main>
  )
}
