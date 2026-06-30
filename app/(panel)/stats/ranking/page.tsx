import { supabase } from '@/app/lib/supabase'

export default async function RankingPage() {
  const { data: records } = await supabase
    .from('personal_records')
    .select('*, athletes(id, first_name, last_name, category, photo_url)')
    .order('date', { ascending: false })

  // Agrupar por disciplina
  const byDiscipline: Record<string, any[]> = {}
  records?.forEach(r => {
    if (!r.discipline) return
    if (!byDiscipline[r.discipline]) byDiscipline[r.discipline] = []
    byDiscipline[r.discipline].push(r)
  })

  // Por cada disciplina, ordenar por marca (asumiendo menor=mejor para tiempos, mayor=mejor para saltos/lanzamientos)
  // Detectar si es tiempo (contiene ':' o '.' con menos de 3 dígitos antes) o distancia/altura
  const disciplines = Object.entries(byDiscipline).sort((a, b) => b[1].length - a[1].length)

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <a href="/stats" style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← Estadísticas</a>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', margin: '8px 0 4px' }}>Ranking interno</h1>
          <p style={{ color: '#3A4A70', fontSize: '13px', margin: 0 }}>Mejores marcas por disciplina · {disciplines.length} disciplinas</p>
        </div>

        {disciplines.length === 0 && (
          <div style={{ textAlign: 'center', color: '#3A4A70', padding: '60px 0', fontSize: '14px' }}>
            Sin marcas personales registradas aún
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {disciplines.map(([discipline, recs]) => (
            <div key={discipline} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(75,163,217,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: '#CDD0E0', fontSize: '14px', fontWeight: '700', margin: 0 }}>{discipline}</p>
                <span style={{ color: '#3A4A70', fontSize: '11px' }}>{recs.length} marca{recs.length > 1 ? 's' : ''}</span>
              </div>
              {recs.slice(0, 5).map((r, i) => (
                <a href={`/athletes/${r.athletes?.id}`} key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 18px', borderBottom: i < Math.min(recs.length, 5) - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', textDecoration: 'none' }}>
                  <div style={{ width: '24px', textAlign: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : i === 2 ? '#CD7F32' : '#3A4A70' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}º`}
                    </span>
                  </div>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                    {r.athletes?.first_name?.[0]}{r.athletes?.last_name?.[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '500' }}>{r.athletes?.first_name} {r.athletes?.last_name}</div>
                    {r.athletes?.category && <div style={{ color: '#2A3550', fontSize: '11px' }}>{r.athletes.category}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: i === 0 ? '#F59E0B' : '#CDD0E0', fontSize: '17px', fontWeight: '800', letterSpacing: '-0.02em' }}>{r.mark}</div>
                    <div style={{ color: '#2A3550', fontSize: '10px' }}>{new Date(r.date+'T00:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'2-digit'})}</div>
                  </div>
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
