import { supabase } from '@/app/lib/supabase'

export default async function Extraescolares() {
  const { data: schools } = await supabase.from('schools').select('*').order('name')
  const { data: activities } = await supabase.from('activities').select('id, school_id, name, active')
  const { data: enrollments } = await supabase.from('enrollments').select('id, activity_id, status')

  const getSchoolStats = (schoolId: string) => {
    const acts = activities?.filter(a => a.school_id === schoolId) || []
    const actIds = acts.map(a => a.id)
    const enrolled = enrollments?.filter(e => actIds.includes(e.activity_id) && e.status === 'active').length || 0
    return { activities: acts.length, enrolled }
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em', margin: 0 }}>Extraescolares</h1>
            <p style={{ color: '#3A4A70', fontSize: '13px', marginTop: '6px' }}>{schools?.length || 0} colegios · Gestión de actividades extraescolares</p>
          </div>
          <a href="/extraescolares/nuevo" style={{ padding: '9px 18px', borderRadius: '9px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '13px', fontWeight: '600', textDecoration: 'none', boxShadow: '0 4px 16px rgba(75,163,217,0.2)' }}>
            + Nuevo colegio
          </a>
        </div>

        {/* Stats globales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '20px' }}>
          {[
            { label: 'Colegios', value: String(schools?.length || 0), color: '#4BA3D9' },
            { label: 'Actividades', value: String(activities?.length || 0), color: '#F59E0B' },
            { label: 'Alumnos inscritos', value: String(enrollments?.filter(e => e.status === 'active').length || 0), color: '#10B981' },
            { label: 'Actividades activas', value: String(activities?.filter(a => a.active).length || 0), color: '#A78BFA' },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '12px', padding: '14px 18px' }}>
              <div style={{ color: '#2A3550', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Lista de colegios */}
        {schools && schools.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' }}>
            {schools.map(school => {
              const stats = getSchoolStats(school.id)
              return (
                <a key={school.id} href={`/extraescolares/${school.id}`} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '20px', textDecoration: 'none', display: 'block', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#4BA3D9,transparent)' }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'rgba(75,163,217,0.1)', border: '1px solid rgba(75,163,217,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🏫</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#F0F4FF', fontSize: '15px', fontWeight: '700' }}>{school.name}</div>
                      {school.address && <div style={{ color: '#3A4A70', fontSize: '12px', marginTop: '2px' }}>📍 {school.address}</div>}
                    </div>
                  </div>
                  {school.contact_name && (
                    <div style={{ color: '#4A5580', fontSize: '12px', marginBottom: '12px' }}>
                      Contacto: {school.contact_name}{school.contact_phone ? ` · ${school.contact_phone}` : ''}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', padding: '8px 12px', textAlign: 'center' }}>
                      <div style={{ color: '#4BA3D9', fontSize: '18px', fontWeight: '800' }}>{stats.activities}</div>
                      <div style={{ color: '#2A3550', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Actividades</div>
                    </div>
                    <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', padding: '8px 12px', textAlign: 'center' }}>
                      <div style={{ color: '#10B981', fontSize: '18px', fontWeight: '800' }}>{stats.enrolled}</div>
                      <div style={{ color: '#2A3550', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Alumnos</div>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        ) : (
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.08)', borderRadius: '16px', padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '14px' }}>🏫</div>
            <div style={{ color: '#CDD0E0', fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>Sin colegios todavía</div>
            <div style={{ color: '#2A3550', fontSize: '13px', marginBottom: '20px' }}>Añade el primer colegio para empezar a gestionar sus actividades</div>
            <a href="/extraescolares/nuevo" style={{ color: '#4BA3D9', fontSize: '13px', textDecoration: 'none' }}>+ Añadir colegio →</a>
          </div>
        )}
      </div>
    </main>
  )
}
