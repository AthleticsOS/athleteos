import { supabase } from '@/app/lib/supabase'

type Props = { params: Promise<{ schoolId: string }> }

export default async function SchoolDetail({ params }: Props) {
  const { schoolId } = await params
  const { data: school } = await supabase.from('schools').select('*').eq('id', schoolId).single()
  const { data: activities } = await supabase.from('activities').select('*').eq('school_id', schoolId).order('name')
  const { data: enrollments } = await supabase.from('enrollments').select('id, activity_id, status')

  if (!school) return <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '32px' }}><p style={{ color: '#3A4A70' }}>Colegio no encontrado</p></main>

  const getEnrolled = (actId: string) => enrollments?.filter(e => e.activity_id === actId && e.status === 'active').length || 0
  const totalEnrolled = enrollments?.filter(e => activities?.map(a=>a.id).includes(e.activity_id) && e.status === 'active').length || 0

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>

        <div style={{ marginBottom: '24px' }}>
          <a href="/extraescolares" style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← Extraescolares</a>
        </div>

        {/* Cabecera colegio */}
        <div style={{ background: 'linear-gradient(135deg,#0A0F1E 0%,#0D1428 60%,#091020 100%)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '20px', padding: '24px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#4BA3D9,transparent)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🏫</div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#F0F4FF', margin: '0 0 6px' }}>{school.name}</h1>
              {school.address && <div style={{ color: '#3A4A70', fontSize: '13px' }}>📍 {school.address}</div>}
              {school.contact_name && <div style={{ color: '#4A5580', fontSize: '12px', marginTop: '4px' }}>Contacto: {school.contact_name} {school.contact_phone ? `· ${school.contact_phone}` : ''} {school.contact_email ? `· ${school.contact_email}` : ''}</div>}
            </div>
            <a href={`/extraescolares/${schoolId}/actividad/nueva`} style={{ padding: '9px 18px', borderRadius: '9px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '13px', fontWeight: '600', textDecoration: 'none', flexShrink: 0 }}>
              + Nueva actividad
            </a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
            {[
              { label: 'Actividades', value: String(activities?.length || 0), color: '#4BA3D9' },
              { label: 'Alumnos inscritos', value: String(totalEnrolled), color: '#10B981' },
              { label: 'Activas', value: String(activities?.filter(a=>a.active).length || 0), color: '#F59E0B' },
            ].map(s => (
              <div key={s.label} style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: '800', color: s.color }}>{s.value}</div>
                <div style={{ color: '#2A3550', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '3px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actividades */}
        {activities && activities.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' }}>
            {activities.map(act => {
              const enrolled = getEnrolled(act.id)
              const pct = act.max_students ? Math.round((enrolled / act.max_students) * 100) : null
              return (
                <a key={act.id} href={`/extraescolares/${schoolId}/actividad/${act.id}`} style={{ backgroundColor: '#0A0E1A', border: `1px solid ${act.active ? 'rgba(75,163,217,0.12)' : 'rgba(255,255,255,0.05)'}`, borderRadius: '16px', padding: '18px 20px', textDecoration: 'none', display: 'block' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ color: '#F0F4FF', fontSize: '15px', fontWeight: '700' }}>{act.name}</div>
                      {act.schedule && <div style={{ color: '#3A4A70', fontSize: '12px', marginTop: '2px' }}>🕐 {act.schedule}</div>}
                      {act.teacher && <div style={{ color: '#4A5580', fontSize: '12px', marginTop: '1px' }}>👤 {act.teacher}</div>}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {act.price_cents > 0 && <div style={{ color: '#10B981', fontSize: '14px', fontWeight: '700' }}>€{(act.price_cents/100).toFixed(0)}/mes</div>}
                      <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', backgroundColor: act.active ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)', color: act.active ? '#10B981' : '#3A4A70', border: `1px solid ${act.active ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                        {act.active ? '● Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: pct !== null ? `${Math.min(pct,100)}%` : '0%', backgroundColor: pct !== null && pct >= 90 ? '#EF4444' : '#4BA3D9', borderRadius: '4px' }} />
                    </div>
                    <span style={{ color: '#4BA3D9', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                      {enrolled}{act.max_students ? `/${act.max_students}` : ''} alumnos
                    </span>
                  </div>
                </a>
              )
            })}
          </div>
        ) : (
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.08)', borderRadius: '16px', padding: '60px', textAlign: 'center' }}>
            <div style={{ color: '#2A3550', fontSize: '14px', marginBottom: '12px' }}>Sin actividades todavía</div>
            <a href={`/extraescolares/${schoolId}/actividad/nueva`} style={{ color: '#4BA3D9', fontSize: '13px', textDecoration: 'none' }}>+ Crear primera actividad →</a>
          </div>
        )}
      </div>
    </main>
  )
}
