import { supabase } from '@/app/lib/supabase'

export default async function Convocatorias() {
  const { data: convocatorias } = await supabase
    .from('convocatorias')
    .select('*')
    .order('date', { ascending: false })

  const { data: athletes } = await supabase
    .from('athletes')
    .select('id, first_name, last_name')

  const athleteMap: Record<string, string> = {}
  athletes?.forEach(a => { athleteMap[a.id] = `${a.first_name} ${a.last_name}` })

  const today = new Date().toISOString().split('T')[0]
  const proximas = convocatorias?.filter(c => c.date >= today) || []
  const pasadas = convocatorias?.filter(c => c.date < today) || []

  return (
    <main className="conv-main" style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <style>{`
        @media (max-width: 768px) {
          .conv-main { padding: 16px !important; }
          .conv-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
        }
      `}</style>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>

        <div className="conv-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em', margin: 0 }}>Convocatorias</h1>
            <p style={{ color: '#3A4A70', fontSize: '13px', marginTop: '6px' }}>Gestión de convocatorias para competiciones</p>
          </div>
          <a href="/convocatorias/nueva" style={{ padding: '9px 18px', borderRadius: '9px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '13px', fontWeight: '600', textDecoration: 'none', boxShadow: '0 4px 16px rgba(75,163,217,0.2)' }}>
            + Nueva convocatoria
          </a>
        </div>

        {/* Próximas */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Próximas · {proximas.length}</div>
          {proximas.length === 0 ? (
            <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '14px', padding: '40px', textAlign: 'center', color: '#2A3550', fontSize: '13px' }}>
              No hay convocatorias próximas — <a href="/convocatorias/nueva" style={{ color: '#4BA3D9', textDecoration: 'none' }}>crear una</a>
            </div>
          ) : proximas.map(c => (
            <ConvocatoriaCard key={c.id} c={c} athleteMap={athleteMap} upcoming />
          ))}
        </div>

        {/* Pasadas */}
        {pasadas.length > 0 && (
          <div>
            <div style={{ color: '#2A3550', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Historial · {pasadas.length}</div>
            {pasadas.map(c => (
              <ConvocatoriaCard key={c.id} c={c} athleteMap={athleteMap} upcoming={false} />
            ))}
          </div>
        )}

      </div>
    </main>
  )
}

function ConvocatoriaCard({ c, athleteMap, upcoming }: { c: any, athleteMap: Record<string,string>, upcoming: boolean }) {
  const convocados = (c.athlete_ids || []).map((id: string) => athleteMap[id]).filter(Boolean)
  return (
    <div style={{ backgroundColor: '#0A0E1A', border: `1px solid ${upcoming ? 'rgba(75,163,217,0.15)' : 'rgba(255,255,255,0.05)'}`, borderRadius: '14px', padding: '20px', marginBottom: '10px', position: 'relative', overflow: 'hidden' }}>
      {upcoming && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#4BA3D9,transparent)' }} />}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ flexShrink: 0, backgroundColor: upcoming ? 'rgba(75,163,217,0.1)' : 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px 14px', textAlign: 'center', minWidth: '52px' }}>
          <div style={{ fontSize: '20px', fontWeight: '800', color: upcoming ? '#4BA3D9' : '#3A4A70', lineHeight: 1 }}>
            {new Date(c.date + 'T00:00:00').getDate()}
          </div>
          <div style={{ color: upcoming ? '#4BA3D9' : '#2A3550', fontSize: '10px', textTransform: 'uppercase', fontWeight: '600', marginTop: '2px' }}>
            {new Date(c.date + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short' })}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#F0F4FF', margin: 0 }}>{c.competition_name}</h3>
            <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', backgroundColor: upcoming ? 'rgba(75,163,217,0.1)' : 'rgba(255,255,255,0.04)', color: upcoming ? '#4BA3D9' : '#3A4A70', border: `1px solid ${upcoming ? 'rgba(75,163,217,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
              {upcoming ? 'Próxima' : 'Finalizada'}
            </span>
          </div>
          {c.location && <div style={{ color: '#3A4A70', fontSize: '12px', marginBottom: '8px' }}>📍 {c.location}</div>}
          {c.description && <div style={{ color: '#4A5580', fontSize: '12px', marginBottom: '10px' }}>{c.description}</div>}
          <div>
            <div style={{ color: '#2A3550', fontSize: '11px', fontWeight: '600', marginBottom: '6px' }}>CONVOCADOS ({convocados.length})</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {convocados.length > 0 ? convocados.map((name: string) => (
                <span key={name} style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', backgroundColor: 'rgba(75,163,217,0.08)', color: '#4BA3D9', border: '1px solid rgba(75,163,217,0.15)' }}>{name}</span>
              )) : <span style={{ color: '#2A3550', fontSize: '12px' }}>Sin atletas convocados</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
