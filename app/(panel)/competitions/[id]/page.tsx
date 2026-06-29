import { supabase } from '@/app/lib/supabase'
import ExportCSV from '@/app/components/ExportCSV'

type Props = { params: Promise<{ id: string }> }

export default async function CompetitionDetail({ params }: Props) {
  const { id } = await params
  const { data: competition } = await supabase.from('competitions').select('*').eq('id', id).single()
  const { data: results } = await supabase.from('competition_results').select('*, athletes(first_name, last_name)').eq('competition_id', id).order('position', { ascending: true })

  if (!competition) return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '32px' }}>
      <p style={{ color: '#3A4A70' }}>Competición no encontrada</p>
    </main>
  )

  const podios = results?.filter(r => r.position && r.position <= 3) || []
  const exportData = results?.map(r => ({
    Posicion: r.position || '',
    Atleta: `${r.athletes?.first_name} ${r.athletes?.last_name}`,
    Prueba: r.discipline || '',
    Marca: r.mark || '',
    Viento: r.wind || '',
  })) || []

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <div style={{ marginBottom: '24px' }}>
          <a href="/competitions" style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← Competiciones</a>
        </div>

        {/* Cabecera */}
        <div style={{ background: 'linear-gradient(135deg,#0A0F1E 0%,#0D1428 60%,#091020 100%)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '20px', padding: '24px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#4BA3D9,transparent)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.02em', margin: '0 0 8px' }}>{competition.name}</h1>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {competition.location && <span style={{ color: '#3A4A70', fontSize: '13px' }}>📍 {competition.location}</span>}
                <span style={{ color: '#3A4A70', fontSize: '13px' }}>📅 {new Date(competition.date+'T00:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'})}</span>
                {competition.sport && <span style={{ color: '#3A4A70', fontSize: '13px' }}>🏃 {competition.sport}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', backgroundColor: competition.status === 'upcoming' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)', color: competition.status === 'upcoming' ? '#10B981' : '#3A4A70', border: `1px solid ${competition.status === 'upcoming' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                {competition.status === 'upcoming' ? '● Próxima' : 'Finalizada'}
              </span>
              {competition.level && <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', backgroundColor: 'rgba(245,158,11,0.08)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.15)' }}>{competition.level}</span>}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
            {[
              { label: 'Resultados', value: String(results?.length || 0), color: '#4BA3D9' },
              { label: 'Podios', value: String(podios.length), color: '#EAB308' },
              { label: 'Pruebas', value: String(new Set(results?.map(r=>r.discipline)).size || 0), color: '#10B981' },
            ].map(s => (
              <div key={s.label} style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: '800', color: s.color }}>{s.value}</div>
                <div style={{ color: '#2A3550', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '3px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Resultados */}
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid rgba(75,163,217,0.06)', backgroundColor: 'rgba(75,163,217,0.03)' }}>
            <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>Resultados · {results?.length || 0}</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {results && results.length > 0 && <ExportCSV data={exportData} filename={`resultados_${competition.name.replace(/\s/g,'_')}`} label="Exportar" />}
              <a href={`/competitions/${id}/resultado`} style={{ padding: '7px 14px', borderRadius: '8px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '12px', fontWeight: '600', textDecoration: 'none' }}>
                + Añadir resultado
              </a>
            </div>
          </div>

          {results && results.length > 0 ? results.map((result, i) => (
            <div key={result.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 20px', borderBottom: i < results.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800',
                backgroundColor: result.position===1?'rgba(234,179,8,0.15)':result.position===2?'rgba(156,163,175,0.1)':result.position===3?'rgba(180,83,9,0.1)':'rgba(255,255,255,0.04)',
                color: result.position===1?'#EAB308':result.position===2?'#9CA3AF':result.position===3?'#CD7C2F':'#3A4A70',
                border: result.position<=3?`1px solid ${result.position===1?'rgba(234,179,8,0.3)':result.position===2?'rgba(156,163,175,0.2)':'rgba(180,83,9,0.2)'}`:undefined,
              }}>
                {result.position || '—'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#CDD0E0', fontSize: '14px', fontWeight: '600' }}>{result.athletes?.first_name} {result.athletes?.last_name}</div>
                <div style={{ color: '#3A4A70', fontSize: '11px', marginTop: '2px' }}>{result.discipline}</div>
              </div>
              <div style={{ color: '#4BA3D9', fontSize: '16px', fontWeight: '800', fontFamily: 'monospace' }}>{result.mark}</div>
              {result.wind && <div style={{ color: '#3A4A70', fontSize: '12px', width: '50px', textAlign: 'right' }}>{result.wind} m/s</div>}
            </div>
          )) : (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ color: '#2A3550', fontSize: '13px', marginBottom: '12px' }}>No hay resultados registrados</div>
              <a href={`/competitions/${id}/resultado`} style={{ color: '#4BA3D9', fontSize: '13px', textDecoration: 'none' }}>+ Añadir el primero →</a>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
