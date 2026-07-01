import { supabase } from '@/app/lib/supabase'

export default async function Competitions() {
  const { data: competitions } = await supabase.from('competitions').select('*').order('date', { ascending: false })
  const { data: results } = await supabase.from('competition_results').select('*, athletes(first_name, last_name)').order('created_at', { ascending: false })

  const today = new Date().toISOString().split('T')[0]
  const proximas = competitions?.filter(c => c.date >= today) || []
  const pasadas = competitions?.filter(c => c.date < today) || []

  const getResults = (compId: string) => results?.filter(r => r.competition_id === compId) || []

  return (
    <main className="comp-main" style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <style>{`
        @media (max-width: 768px) {
          .comp-main { padding: 16px !important; }
          .comp-grid { grid-template-columns: repeat(2,1fr) !important; }
          .comp-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
        }
      `}</style>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>

        <div className="comp-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em', margin: 0 }}>Competiciones</h1>
            <p style={{ color: '#3A4A70', fontSize: '13px', marginTop: '6px' }}>Temporada 2024–2025 · {competitions?.length || 0} competiciones</p>
          </div>
          <a href="/competitions/nueva" style={{ padding: '9px 18px', borderRadius: '9px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '13px', fontWeight: '600', textDecoration: 'none', boxShadow: '0 4px 16px rgba(75,163,217,0.2)' }}>
            + Añadir competición
          </a>
        </div>

        {/* Stats */}
        <div className="comp-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '20px' }}>
          {[
            { label: 'Total', value: String(competitions?.length || 0), color: '#4BA3D9' },
            { label: 'Próximas', value: String(proximas.length), color: '#10B981' },
            { label: 'Resultados', value: String(results?.length || 0), color: '#F59E0B' },
            { label: 'Podios', value: String(results?.filter(r => r.position && r.position <= 3).length || 0), color: '#EAB308' },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '12px', padding: '14px 18px' }}>
              <div style={{ color: '#2A3550', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Próximas */}
        {proximas.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ color: '#3A4A70', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Próximas</div>
            {proximas.map(comp => (
              <CompCard key={comp.id} comp={comp} results={getResults(comp.id)} upcoming />
            ))}
          </div>
        )}

        {/* Pasadas */}
        {pasadas.length > 0 && (
          <div>
            <div style={{ color: '#2A3550', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Historial</div>
            {pasadas.map(comp => (
              <CompCard key={comp.id} comp={comp} results={getResults(comp.id)} upcoming={false} />
            ))}
          </div>
        )}

        {competitions?.length === 0 && (
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.08)', borderRadius: '16px', padding: '60px', textAlign: 'center' }}>
            <div style={{ color: '#2A3550', fontSize: '14px', marginBottom: '12px' }}>No hay competiciones registradas</div>
            <a href="/competitions/nueva" style={{ color: '#4BA3D9', fontSize: '13px', textDecoration: 'none' }}>Añadir la primera →</a>
          </div>
        )}
      </div>
    </main>
  )
}

function CompCard({ comp, results, upcoming }: { comp: any, results: any[], upcoming: boolean }) {
  return (
    <div style={{ backgroundColor: '#0A0E1A', border: `1px solid ${upcoming ? 'rgba(75,163,217,0.15)' : 'rgba(255,255,255,0.05)'}`, borderRadius: '14px', marginBottom: '10px', overflow: 'hidden' }}>
      <a href={`/competitions/${comp.id}`} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', textDecoration: 'none' }}>
        <div style={{ width: '48px', textAlign: 'center', flexShrink: 0, backgroundColor: upcoming ? 'rgba(75,163,217,0.08)' : 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '8px 4px' }}>
          <div style={{ fontSize: '20px', fontWeight: '800', color: upcoming ? '#4BA3D9' : '#CDD0E0', lineHeight: 1 }}>{new Date(comp.date+'T00:00:00').getDate()}</div>
          <div style={{ color: upcoming ? '#4BA3D9' : '#3A4A70', fontSize: '10px', textTransform: 'uppercase', marginTop: '2px' }}>{new Date(comp.date+'T00:00:00').toLocaleDateString('es-ES',{month:'short'})}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#F0F4FF', fontSize: '14px', fontWeight: '700' }}>{comp.name}</div>
          <div style={{ color: '#3A4A70', fontSize: '12px', marginTop: '3px' }}>{comp.location}{comp.sport ? ` · ${comp.sport}` : ''}</div>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
          {results.length > 0 && <span style={{ color: '#F59E0B', fontSize: '12px', fontWeight: '600' }}>{results.length} resultado{results.length !== 1 ? 's' : ''}</span>}
          <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', backgroundColor: upcoming ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)', color: upcoming ? '#10B981' : '#3A4A70', border: `1px solid ${upcoming ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
            {upcoming ? '● Próxima' : 'Finalizada'}
          </span>
          {comp.level && <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', backgroundColor: 'rgba(245,158,11,0.08)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.15)' }}>{comp.level}</span>}
          <div style={{ color: '#3A4A70', fontSize: '16px' }}>→</div>
        </div>
      </a>

      {/* Resultados */}
      {results.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', padding: '10px 20px 12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {results.slice(0, 5).map((r, i) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', backgroundColor: r.position === 1 ? 'rgba(234,179,8,0.08)' : 'rgba(255,255,255,0.02)', borderRadius: '8px', border: `1px solid ${r.position === 1 ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.05)'}` }}>
              {r.position && r.position <= 3 && <span style={{ fontSize: '11px' }}>{r.position === 1 ? '🥇' : r.position === 2 ? '🥈' : '🥉'}</span>}
              <span style={{ color: '#888', fontSize: '11px' }}>{r.athletes?.first_name}</span>
              <span style={{ color: '#4BA3D9', fontSize: '12px', fontWeight: '700', fontFamily: 'monospace' }}>{r.mark}</span>
              <span style={{ color: '#3A4A70', fontSize: '10px' }}>{r.discipline}</span>
            </div>
          ))}
          {results.length > 5 && <span style={{ color: '#3A4A70', fontSize: '11px', padding: '4px 0' }}>+{results.length - 5} más</span>}
        </div>
      )}
    </div>
  )
}
