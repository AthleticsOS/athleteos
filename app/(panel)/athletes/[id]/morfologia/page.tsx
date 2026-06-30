import { supabase } from '@/app/lib/supabase'
import MorfologiaForm from '@/app/components/MorfologiaForm'
import MorfologiaChart from '@/app/components/MorfologiaChart'

type Props = { params: Promise<{ id: string }> }

export default async function MorfologiaPage({ params }: Props) {
  const { id } = await params
  const { data: athlete } = await supabase.from('athletes').select('*').eq('id', id).single()
  const { data: measurements } = await supabase
    .from('body_measurements')
    .select('*')
    .eq('athlete_id', id)
    .order('date', { ascending: true })

  if (!athlete) return <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '32px' }}><p style={{ color: '#3A4A70' }}>No encontrado</p></main>

  const latest = measurements?.[measurements.length - 1]
  const prev = measurements?.[measurements.length - 2]
  const bmi = latest?.weight && latest?.height ? (latest.weight / ((latest.height / 100) ** 2)).toFixed(1) : null

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <a href={`/athletes/${id}`} style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← {athlete.first_name} {athlete.last_name}</a>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#F0F4FF', margin: '8px 0 4px' }}>Peso y morfología</h1>
          <p style={{ color: '#3A4A70', fontSize: '13px', margin: 0 }}>{measurements?.length || 0} registros</p>
        </div>

        {/* Stats actuales */}
        {latest && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
            {[
              { label: 'Peso', value: latest.weight ? `${latest.weight} kg` : '—', diff: prev?.weight ? (latest.weight - prev.weight).toFixed(1) : null, color: '#4BA3D9' },
              { label: 'Altura', value: latest.height ? `${latest.height} cm` : '—', diff: null, color: '#10B981' },
              { label: 'IMC', value: bmi || '—', diff: null, color: '#F59E0B' },
              { label: '% Grasa', value: latest.fat_pct ? `${latest.fat_pct}%` : '—', diff: prev?.fat_pct ? (latest.fat_pct - prev.fat_pct).toFixed(1) : null, color: '#A78BFA' },
            ].map(s => (
              <div key={s.label} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '14px', padding: '16px 18px' }}>
                <div style={{ color: '#2A3550', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{s.label}</div>
                <div style={{ fontSize: '26px', fontWeight: '800', color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
                {s.diff !== null && (
                  <div style={{ color: parseFloat(s.diff) > 0 ? '#EF4444' : '#10B981', fontSize: '11px', marginTop: '3px', fontWeight: '600' }}>
                    {parseFloat(s.diff) > 0 ? '▲' : '▼'} {Math.abs(parseFloat(s.diff))} vs anterior
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '12px' }}>
          {/* Gráfica */}
          {measurements && measurements.length > 1 && (
            <MorfologiaChart data={measurements.map(m => ({
              fecha: new Date(m.date+'T00:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'}),
              peso: m.weight,
              grasa: m.fat_pct,
            }))} />
          )}

          {/* Formulario nuevo registro */}
          <MorfologiaForm athleteId={id} />
        </div>

        {/* Historial */}
        {measurements && measurements.length > 0 && (
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '14px', overflow: 'hidden', marginTop: '12px' }}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
              <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>Historial</p>
            </div>
            {[...measurements].reverse().map((m, i) => (
              <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 1fr 1fr', gap: '8px', padding: '10px 18px', borderBottom: i < measurements.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none', alignItems: 'center' }}>
                <div style={{ color: '#3A4A70', fontSize: '12px' }}>{new Date(m.date+'T00:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'2-digit'})}</div>
                <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600' }}>{m.weight ? `${m.weight} kg` : '—'}</div>
                <div style={{ color: '#CDD0E0', fontSize: '13px' }}>{m.height ? `${m.height} cm` : '—'}</div>
                <div style={{ color: '#CDD0E0', fontSize: '13px' }}>{m.fat_pct ? `${m.fat_pct}% grasa` : '—'}</div>
                <div style={{ color: '#3A4A70', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.notes || ''}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
