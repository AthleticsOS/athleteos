import { supabase } from '@/app/lib/supabase'
import EvaluacionForm from '@/app/components/EvaluacionForm'
import NotasEntrenador from '@/app/components/NotasEntrenador'

type Props = { params: Promise<{ id: string }> }

export default async function EvaluacionPage({ params }: Props) {
  const { id } = await params
  const { data: athlete } = await supabase.from('athletes').select('*').eq('id', id).single()
  const { data: evals } = await supabase.from('athlete_evaluations').select('*').eq('athlete_id', id).order('created_at', { ascending: false })
  const { data: notas } = await supabase.from('coach_notes').select('*').eq('athlete_id', id).order('created_at', { ascending: false })

  if (!athlete) return <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '32px' }}><p style={{ color: '#3A4A70' }}>No encontrado</p></main>

  const latest = evals?.[0]

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <a href={`/athletes/${id}`} style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← {athlete.first_name} {athlete.last_name}</a>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#F0F4FF', margin: '8px 0 4px' }}>Evaluación del atleta</h1>
          <p style={{ color: '#3A4A70', fontSize: '13px', margin: 0 }}>{evals?.length || 0} evaluaciones registradas</p>
        </div>

        {/* Última evaluación */}
        {latest && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '10px', marginBottom: '16px' }}>
            {[
              { label: 'Actitud', value: latest.actitud, color: '#4BA3D9' },
              { label: 'Técnica', value: latest.tecnica, color: '#10B981' },
              { label: 'Físico', value: latest.fisico, color: '#F59E0B' },
              { label: 'Constancia', value: latest.constancia, color: '#A78BFA' },
              { label: 'Mental', value: latest.mental, color: '#EF4444' },
            ].map(s => (
              <div key={s.label} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                <div style={{ color: '#2A3550', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{s.label}</div>
                <div style={{ fontSize: '28px', fontWeight: '900', color: s.color }}>{s.value}</div>
                <div style={{ color: '#2A3550', fontSize: '9px', marginTop: '2px' }}>/5</div>
                <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', marginTop: '6px' }}>
                  {[1,2,3,4,5].map(n => (
                    <div key={n} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: n <= s.value ? s.color : 'rgba(255,255,255,0.06)' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <EvaluacionForm athleteId={id} />
          {/* Historial */}
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
              <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>Historial de evaluaciones</p>
            </div>
            {evals && evals.length > 0 ? evals.slice(0, 8).map((e, i) => {
              const media = ((e.actitud + e.tecnica + e.fisico + e.constancia + e.mental) / 5).toFixed(1)
              return (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: i < Math.min(evals.length, 8) - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                  <div style={{ color: '#3A4A70', fontSize: '12px' }}>{new Date(e.created_at).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'2-digit'})}</div>
                  <div style={{ color: '#CDD0E0', fontSize: '14px', fontWeight: '800' }}>{media}/5</div>
                  {e.notes && <div style={{ color: '#2A3550', fontSize: '11px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.notes}</div>}
                </div>
              )
            }) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#2A3550', fontSize: '12px' }}>Sin evaluaciones</div>
            )}
          </div>
        </div>

        <NotasEntrenador athleteId={id} initial={notas || []} />
      </div>
    </main>
  )
}
