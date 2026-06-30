import { supabase } from '@/app/lib/supabase'
import RegistrarLesion from '@/app/components/RegistrarLesion'

type Props = { params: Promise<{ id: string }> }

export default async function LesionesPage({ params }: Props) {
  const { id } = await params
  const { data: athlete } = await supabase.from('athletes').select('id, first_name, last_name').eq('id', id).single()
  const { data: injuries } = await supabase.from('injury_records').select('*').eq('athlete_id', id).order('start_date', { ascending: false })

  if (!athlete) return <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '32px' }}><p style={{ color: '#3A4A70' }}>No encontrado</p></main>

  const active = injuries?.filter(i => !i.end_date) || []
  const resolved = injuries?.filter(i => i.end_date) || []

  const severityConfig: Record<string, { color: string, bg: string, label: string }> = {
    mild:     { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  label: 'Leve' },
    moderate: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: 'Moderada' },
    severe:   { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  label: 'Grave' },
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <a href={`/athletes/${id}`} style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← {athlete.first_name} {athlete.last_name}</a>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#F0F4FF', margin: '8px 0 4px' }}>Control de lesiones</h1>
          </div>
          <RegistrarLesion athleteId={id} />
        </div>

        {active.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: '#EF4444', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Activas · {active.length}</div>
            {active.map(injury => {
              const s = severityConfig[injury.severity] || severityConfig.moderate
              const days = Math.floor((new Date().getTime() - new Date(injury.start_date+'T00:00:00').getTime()) / (1000*60*60*24))
              return (
                <div key={injury.id} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', padding: '16px 18px', marginBottom: '8px', borderLeft: '3px solid #EF4444' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <span style={{ color: '#F0F4FF', fontSize: '14px', fontWeight: '700' }}>{injury.type}</span>
                      <span style={{ color: '#3A4A70', fontSize: '13px' }}> · {injury.body_part}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', backgroundColor: s.bg, color: s.color }}>{s.label}</span>
                      <span style={{ color: '#EF4444', fontSize: '11px', fontWeight: '600' }}>{days}d de baja</span>
                    </div>
                  </div>
                  <div style={{ color: '#3A4A70', fontSize: '11px' }}>Desde: {new Date(injury.start_date+'T00:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'long'})}</div>
                  {injury.notes && <div style={{ color: '#4A5580', fontSize: '12px', marginTop: '6px', lineHeight: '1.5' }}>{injury.notes}</div>}
                </div>
              )
            })}
          </div>
        )}

        {active.length === 0 && (
          <div style={{ backgroundColor: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '14px', padding: '18px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '20px' }}>✅</span>
            <div>
              <div style={{ color: '#10B981', fontSize: '13px', fontWeight: '600' }}>Sin lesiones activas</div>
              <div style={{ color: '#3A4A70', fontSize: '11px' }}>El atleta está disponible para entrenar</div>
            </div>
          </div>
        )}

        {resolved.length > 0 && (
          <div>
            <div style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Historial · {resolved.length}</div>
            <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
              {resolved.map((injury, i) => {
                const s = severityConfig[injury.severity] || severityConfig.moderate
                const days = Math.floor((new Date(injury.end_date+'T00:00:00').getTime() - new Date(injury.start_date+'T00:00:00').getTime()) / (1000*60*60*24))
                return (
                  <div key={injury.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 18px', borderBottom: i < resolved.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '500' }}>{injury.type}</span>
                      <span style={{ color: '#3A4A70', fontSize: '12px' }}> · {injury.body_part}</span>
                    </div>
                    <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', backgroundColor: s.bg, color: s.color }}>{s.label}</span>
                    <span style={{ color: '#3A4A70', fontSize: '11px' }}>{days}d</span>
                    <span style={{ color: '#2A3550', fontSize: '11px' }}>{new Date(injury.end_date+'T00:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'})}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
