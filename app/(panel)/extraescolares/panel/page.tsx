import { supabase } from '@/app/lib/supabase'

export default async function PanelGlobalExtraescolaresPage() {
  const { data: schools } = await supabase.from('schools').select('id, name, address, status').order('name')

  const { data: activities } = await supabase.from('activities').select('id, name, school_id, price_cents, status')
  const { data: enrollments } = await supabase.from('enrollments').select('id, activity_id, status').eq('status', 'active')
  const { data: payments } = await supabase.from('activity_payments').select('amount_cents, status, enrollment_id')

  // Por colegio
  const actBySchool: Record<string, typeof activities> = {}
  schools?.forEach(s => { actBySchool[s.id] = [] })
  activities?.forEach(a => {
    if (actBySchool[a.school_id]) actBySchool[a.school_id]!.push(a)
  })

  // IDs de enrollments por actividad
  const enrollByActivity: Record<string, string[]> = {}
  enrollments?.forEach(e => {
    if (!enrollByActivity[e.activity_id]) enrollByActivity[e.activity_id] = []
    enrollByActivity[e.activity_id].push(e.id)
  })

  // Pagos por enrollment
  const paidByEnrollment: Record<string, number> = {}
  const pendingByEnrollment: Record<string, number> = {}
  payments?.forEach(p => {
    if (p.status === 'paid') paidByEnrollment[p.enrollment_id] = (paidByEnrollment[p.enrollment_id] || 0) + p.amount_cents
    else pendingByEnrollment[p.enrollment_id] = (pendingByEnrollment[p.enrollment_id] || 0) + p.amount_cents
  })

  const totalStudents = enrollments?.length || 0
  const totalActivities = activities?.length || 0
  const totalRecaudado = Object.values(paidByEnrollment).reduce((s, v) => s + v, 0)
  const totalPendiente = Object.values(pendingByEnrollment).reduce((s, v) => s + v, 0)

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <a href="/extraescolares" style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← Extraescolares</a>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', margin: '8px 0 4px' }}>Panel global</h1>
            <p style={{ color: '#3A4A70', fontSize: '13px', margin: 0 }}>Visión agregada de todos los centros</p>
          </div>
          <a href="/extraescolares/nuevo" style={{ padding: '9px 18px', borderRadius: '10px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}>
            + Nuevo colegio
          </a>
        </div>

        {/* KPIs globales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Colegios', value: String(schools?.length || 0), color: '#4BA3D9', href: '/extraescolares' },
            { label: 'Actividades', value: String(totalActivities), color: '#F59E0B', href: '/extraescolares' },
            { label: 'Alumnos activos', value: String(totalStudents), color: '#10B981', href: '/extraescolares' },
            { label: 'Recaudado', value: `€${(totalRecaudado / 100).toFixed(0)}`, color: '#A78BFA', sub: totalPendiente > 0 ? `€${(totalPendiente / 100).toFixed(0)} pend.` : undefined },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '14px', padding: '16px 18px' }}>
              <div style={{ color: '#2A3550', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
              {(s as any).sub && <div style={{ color: '#EF4444', fontSize: '11px', marginTop: '3px', fontWeight: '500' }}>{(s as any).sub}</div>}
            </div>
          ))}
        </div>

        {/* Por colegio */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {schools?.map(school => {
            const schoolActivities = actBySchool[school.id] || []
            const schoolEnrollments = schoolActivities.flatMap(a => enrollByActivity[a.id] || [])
            const schoolPaid = schoolEnrollments.reduce((s, eid) => s + (paidByEnrollment[eid] || 0), 0)
            const schoolPending = schoolEnrollments.reduce((s, eid) => s + (pendingByEnrollment[eid] || 0), 0)

            return (
              <a key={school.id} href={`/extraescolares/${school.id}`} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.08)', borderRadius: '14px', padding: '16px 20px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '20px', transition: 'border-color 150ms' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#CDD0E0', fontSize: '14px', fontWeight: '700', marginBottom: '3px' }}>{school.name}</div>
                  {school.address && <div style={{ color: '#3A4A70', fontSize: '12px' }}>{school.address}</div>}
                </div>
                <div style={{ display: 'flex', gap: '20px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#4BA3D9', fontSize: '18px', fontWeight: '700' }}>{schoolActivities.length}</div>
                    <div style={{ color: '#2A3550', fontSize: '10px', textTransform: 'uppercase' }}>activ.</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#10B981', fontSize: '18px', fontWeight: '700' }}>{schoolEnrollments.length}</div>
                    <div style={{ color: '#2A3550', fontSize: '10px', textTransform: 'uppercase' }}>alumnos</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#A78BFA', fontSize: '18px', fontWeight: '700' }}>€{(schoolPaid / 100).toFixed(0)}</div>
                    <div style={{ color: '#2A3550', fontSize: '10px', textTransform: 'uppercase' }}>cobrado</div>
                  </div>
                  {schoolPending > 0 && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#EF4444', fontSize: '18px', fontWeight: '700' }}>€{(schoolPending / 100).toFixed(0)}</div>
                      <div style={{ color: '#2A3550', fontSize: '10px', textTransform: 'uppercase' }}>pend.</div>
                    </div>
                  )}
                </div>
                <div style={{ color: '#3A4A70', fontSize: '16px' }}>→</div>
              </a>
            )
          })}
        </div>
      </div>
    </main>
  )
}
