import { supabase } from '@/app/lib/supabase'
import ExportCSV from '@/app/components/ExportCSV'

type Props = { params: Promise<{ id: string }> }

export default async function Tiempos({ params }: Props) {
  const { id } = await params
  const { data: athlete } = await supabase.from('athletes').select('*').eq('id', id).single()
  const { data: sessions } = await supabase.from('athlete_sessions').select('*').eq('athlete_id', id).order('date', { ascending: false })

  if (!athlete) return <main style={{minHeight:'100vh',backgroundColor:'#06080F',padding:'32px'}}><p style={{color:'#3A4A70'}}>No encontrado</p></main>

  const totalSessions = sessions?.length || 0
  const avgEffort = sessions && sessions.length > 0 ? (sessions.reduce((sum, s) => sum + (s.effort || 0), 0) / sessions.length).toFixed(1) : null
  const highIntensity = sessions?.filter(s => s.effort >= 8).length || 0
  const recovery = sessions?.filter(s => s.effort <= 5).length || 0

  const effortColor = (e: number) => e >= 9 ? '#EF4444' : e >= 7 ? '#F59E0B' : '#10B981'

  const exportData = sessions?.map(s => ({
    Fecha: s.date,
    Ejercicio: s.exercise || '',
    Series: s.series || '',
    Tiempos: s.times || '',
    Media: s.average || '',
    Esfuerzo: s.effort || '',
    Notas: s.notes || '',
  })) || []

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <a href={`/athletes/${id}`} style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← Perfil</a>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em', margin: '6px 0 4px' }}>Registro de tiempos</h1>
            <p style={{ color: '#3A4A70', fontSize: '13px', margin: 0 }}>{athlete.first_name} {athlete.last_name} · {athlete.sport}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <ExportCSV data={exportData} filename={`tiempos_${athlete.first_name}`} label="Exportar CSV" />
            <a href={`/athletes/${id}/sesion`} style={{ padding: '9px 18px', borderRadius: '9px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '13px', fontWeight: '600', textDecoration: 'none', boxShadow: '0 4px 16px rgba(75,163,217,0.2)' }}>
              + Nueva sesión
            </a>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '20px' }}>
          {[
            { label: 'Total sesiones', value: String(totalSessions), color: '#4BA3D9' },
            { label: 'Esfuerzo medio', value: avgEffort ? avgEffort + '/10' : '—', color: '#F59E0B' },
            { label: 'Alta intensidad', value: String(highIntensity), color: '#EF4444' },
            { label: 'Recuperación', value: String(recovery), color: '#10B981' },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ color: '#2A3550', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {sessions && sessions.length > 0 ? (
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
            {/* Cabecera tabla */}
            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 160px 90px 80px', padding: '10px 20px', borderBottom: '1px solid rgba(75,163,217,0.06)', backgroundColor: 'rgba(75,163,217,0.03)' }}>
              {['Fecha', 'Ejercicio / Series', 'Tiempos', 'Media', 'Esfuerzo'].map(h => (
                <div key={h} style={{ color: '#2A3550', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</div>
              ))}
            </div>

            {sessions.map((session, index) => (
              <div key={session.id} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 160px 90px 80px', padding: '13px 20px', borderBottom: index < sessions.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', alignItems: 'start' }}>
                <div>
                  <div style={{ color: '#F0F4FF', fontSize: '15px', fontWeight: '700', lineHeight: 1 }}>{new Date(session.date+'T00:00:00').getDate()}</div>
                  <div style={{ color: '#3A4A70', fontSize: '10px', textTransform: 'uppercase', marginTop: '2px' }}>
                    {new Date(session.date+'T00:00:00').toLocaleDateString('es-ES',{month:'short'})} {new Date(session.date+'T00:00:00').getFullYear().toString().slice(2)}
                  </div>
                </div>

                <div style={{ paddingRight: '16px' }}>
                  <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '500' }}>{session.exercise}</div>
                  {session.series && <div style={{ color: '#3A4A70', fontSize: '11px', marginTop: '2px' }}>{session.series} series</div>}
                  {session.notes && <div style={{ color: '#2A3550', fontSize: '11px', marginTop: '2px', fontStyle: 'italic' }}>{session.notes}</div>}
                  {session.target_distance && session.target_percentage && (
                    <span style={{ display: 'inline-block', marginTop: '4px', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', backgroundColor: 'rgba(75,163,217,0.1)', color: '#4BA3D9' }}>
                      {session.target_distance}m al {session.target_percentage}%
                    </span>
                  )}
                </div>

                <div>
                  {session.times ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                      {session.times.split('/').map((t: string, i: number) => (
                        <span key={i} style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(75,163,217,0.06)', color: '#4BA3D9', fontSize: '11px', fontFamily: 'monospace', border: '1px solid rgba(75,163,217,0.1)' }}>
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  ) : <span style={{ color: '#2A3550', fontSize: '12px' }}>—</span>}
                </div>

                <div>
                  {session.average
                    ? <span style={{ color: '#F0F4FF', fontSize: '15px', fontWeight: '800', fontFamily: 'monospace' }}>{session.average}</span>
                    : <span style={{ color: '#2A3550', fontSize: '12px' }}>—</span>}
                </div>

                <div>
                  {session.effort ? (
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', backgroundColor: `${effortColor(session.effort)}15`, color: effortColor(session.effort), border: `1px solid ${effortColor(session.effort)}30` }}>
                      {session.effort}/10
                    </span>
                  ) : <span style={{ color: '#2A3550', fontSize: '12px' }}>—</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.08)', borderRadius: '16px', padding: '60px', textAlign: 'center' }}>
            <div style={{ color: '#2A3550', fontSize: '14px', marginBottom: '12px' }}>No hay sesiones registradas todavía</div>
            <a href={`/athletes/${id}/sesion`} style={{ color: '#4BA3D9', fontSize: '13px', textDecoration: 'none' }}>+ Añadir la primera →</a>
          </div>
        )}
      </div>
    </main>
  )
}
