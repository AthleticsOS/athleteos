import { supabase } from '@/app/lib/supabase'

export default async function Ranking() {
  const { data: records } = await supabase
    .from('personal_records')
    .select('*, athletes(first_name, last_name, category)')
    .order('mark', { ascending: true })

  const byDiscipline: Record<string, any[]> = {}
  records?.forEach(r => {
    if (!byDiscipline[r.discipline]) byDiscipline[r.discipline] = []
    byDiscipline[r.discipline].push(r)
  })

  const disciplines = Object.keys(byDiscipline).sort()

  return (
    <main className="rank-main" style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <style>{`
        @media (max-width: 768px) {
          .rank-main { padding: 16px !important; }
          .rank-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em', margin: 0 }}>Ranking del club</h1>
          <p style={{ color: '#3A4A70', fontSize: '13px', marginTop: '6px' }}>WeAthletics · Mejores marcas personales por prueba</p>
        </div>

        {/* Resumen */}
        <div className="rank-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '20px' }}>
          {[
            { label: 'Pruebas', value: String(disciplines.length), color: '#4BA3D9' },
            { label: 'Marcas totales', value: String(records?.length || 0), color: '#10B981' },
            { label: 'Atletas', value: String(new Set(records?.map(r => r.athlete_id)).size), color: '#F59E0B' },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '12px', padding: '14px 18px' }}>
              <div style={{ color: '#2A3550', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {disciplines.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {disciplines.map(discipline => {
              const athleteRecords = byDiscipline[discipline]
              return (
                <div key={discipline} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(75,163,217,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(75,163,217,0.03)' }}>
                    <p style={{ color: '#CDD0E0', fontSize: '14px', fontWeight: '700', margin: 0 }}>{discipline}</p>
                    <span style={{ color: '#3A4A70', fontSize: '11px' }}>{athleteRecords.length} marca{athleteRecords.length > 1 ? 's' : ''}</span>
                  </div>
                  {athleteRecords.map((record, index) => (
                    <div key={record.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 20px', borderBottom: index < athleteRecords.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: '800',
                        backgroundColor: index === 0 ? 'rgba(234,179,8,0.15)' : index === 1 ? 'rgba(156,163,175,0.1)' : index === 2 ? 'rgba(180,83,9,0.1)' : 'rgba(255,255,255,0.03)',
                        color: index === 0 ? '#EAB308' : index === 1 ? '#9CA3AF' : index === 2 ? '#CD7C2F' : '#3A4A70',
                        border: index === 0 ? '1px solid rgba(234,179,8,0.3)' : 'none',
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600' }}>
                          {record.athletes?.first_name} {record.athletes?.last_name}
                        </div>
                        <div style={{ color: '#2A3550', fontSize: '11px', marginTop: '1px' }}>{record.athletes?.category}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: index === 0 ? '#EAB308' : '#4BA3D9', fontSize: '16px', fontWeight: '800', fontFamily: 'monospace' }}>{record.mark}</div>
                        {record.date && <div style={{ color: '#2A3550', fontSize: '10px', marginTop: '2px' }}>{new Date(record.date).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'})}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.08)', borderRadius: '14px', padding: '60px 20px', textAlign: 'center', color: '#2A3550', fontSize: '13px' }}>
            No hay marcas registradas todavía
          </div>
        )}
      </div>
    </main>
  )
}
