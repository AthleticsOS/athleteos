import { supabase } from '@/app/lib/supabase'
import ExportCSV from '@/app/components/ExportCSV'

export default async function Stats() {
  const { data: athletes } = await supabase.from('athletes').select('*').order('first_name')
  const { data: competitions } = await supabase.from('competitions').select('*')
  const { data: sessions } = await supabase.from('training_sessions').select('*')
  const { data: payments } = await supabase.from('payments').select('*')
  const { data: records } = await supabase.from('personal_records').select('*')
  const { data: results } = await supabase.from('competition_results').select('*')
  const { data: athleteSessions } = await supabase.from('athlete_sessions').select('athlete_id, effort, date')
  const { data: allWeights } = await supabase.from('athlete_weights').select('athlete_id, sentadilla, hip_thrust, peso_muerto').order('date', { ascending: false })

  const totalIngresos = payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount_cents, 0) || 0
  const totalPendiente = payments?.filter(p => p.status !== 'paid').reduce((sum, p) => sum + p.amount_cents, 0) || 0
  const podios = results?.filter(r => r.position && r.position <= 3).length || 0
  const oros = results?.filter(r => r.position === 1).length || 0
  const totalDeportistas = athletes?.length || 0
  const totalResultados = results?.length || 0

  const avgEsfuerzo = athleteSessions && athleteSessions.length > 0
    ? (athleteSessions.reduce((s, a) => s + (a.effort || 0), 0) / athleteSessions.length).toFixed(1)
    : '—'

  const categoriaCount: Record<string, number> = {}
  athletes?.forEach(a => { categoriaCount[a.category] = (categoriaCount[a.category] || 0) + 1 })
  const categorias = Object.entries(categoriaCount).sort((a, b) => b[1] - a[1])

  const disciplineCount: Record<string, number> = {}
  records?.forEach(r => { disciplineCount[r.discipline] = (disciplineCount[r.discipline] || 0) + 1 })
  const disciplinas = Object.entries(disciplineCount).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em', margin: 0 }}>Estadísticas</h1>
          <p style={{ color: '#3A4A70', fontSize: '13px', marginTop: '6px' }}>WeAthletics · Temporada 2024–2025</p>
        </div>

        {/* KPIs principales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '14px' }}>
          {[
            { label: 'Deportistas', value: String(totalDeportistas), color: '#4BA3D9', sub: 'En el club' },
            { label: 'Competiciones', value: String(competitions?.length || 0), color: '#F59E0B', sub: `${competitions?.filter(c=>c.status==='upcoming').length||0} próximas` },
            { label: 'Podios', value: String(podios), color: '#EAB308', sub: `${oros} oros esta temporada` },
            { label: 'Ingresos', value: `€${(totalIngresos/100).toFixed(0)}`, color: '#10B981', sub: totalPendiente > 0 ? `€${(totalPendiente/100).toFixed(0)} pendiente` : 'Al día' },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '14px', padding: '18px 20px' }}>
              <div style={{ color: '#2A3550', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: s.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: '#3A4A70', fontSize: '11px', marginTop: '6px' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Segunda fila stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '20px' }}>
          {[
            { label: 'Sesiones entrenamiento', value: String(sessions?.length || 0), color: '#CDD0E0' },
            { label: 'Sesiones atletas', value: String(athleteSessions?.length || 0), color: '#CDD0E0' },
            { label: 'Marcas personales', value: String(records?.length || 0), color: '#CDD0E0' },
            { label: 'Esfuerzo medio', value: avgEsfuerzo + (avgEsfuerzo !== '—' ? '/10' : ''), color: '#4BA3D9' },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: s.color }}>{s.value}</div>
              <div style={{ color: '#2A3550', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>

          {/* Por categoría */}
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '20px' }}>
            <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: '0 0 16px' }}>Atletas por categoría</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {categorias.length > 0 ? categorias.map(([name, count]) => (
                <div key={name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ color: '#888', fontSize: '12px' }}>{name || 'Sin categoría'}</span>
                    <span style={{ color: '#4BA3D9', fontSize: '12px', fontWeight: '700' }}>{count}</span>
                  </div>
                  <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '2px', background: 'linear-gradient(90deg,#1E2A5E,#4BA3D9)', width: `${(count/totalDeportistas)*100}%` }} />
                  </div>
                </div>
              )) : <div style={{ color: '#2A3550', fontSize: '12px' }}>Sin datos</div>}
            </div>
          </div>

          {/* Pruebas más registradas */}
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '20px' }}>
            <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: '0 0 16px' }}>Pruebas con más marcas</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {disciplinas.length > 0 ? disciplinas.map(([name, count]) => (
                <div key={name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ color: '#888', fontSize: '12px' }}>{name}</span>
                    <span style={{ color: '#F59E0B', fontSize: '12px', fontWeight: '700' }}>{count} marca{count>1?'s':''}</span>
                  </div>
                  <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '2px', background: 'linear-gradient(90deg,#92400E,#F59E0B)', width: `${(count/(disciplinas[0]?.[1]||1))*100}%` }} />
                  </div>
                </div>
              )) : <div style={{ color: '#2A3550', fontSize: '12px' }}>Sin marcas registradas</div>}
            </div>
          </div>
        </div>

        {/* Comparativa atletas */}
        {athletes && athletes.length > 1 && (
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
              <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>Comparativa de atletas</p>
              <ExportCSV data={athletes.map(a => ({ Nombre: `${a.first_name} ${a.last_name}`, Categoria: a.category, Sesiones: athleteSessions?.filter(s=>s.athlete_id===a.id).length||0, Esfuerzo_medio: (() => { const s = athleteSessions?.filter(s=>s.athlete_id===a.id&&s.effort); return s?.length ? (s.reduce((sum,s)=>sum+s.effort,0)/s.length).toFixed(1) : '—' })() }))} filename="comparativa_atletas" label="Exportar" />
            </div>
            {athletes.map((a, i) => {
              const aSessions = athleteSessions?.filter(s => s.athlete_id === a.id) || []
              const aEffort = aSessions.filter(s => s.effort)
              const avgEff = aEffort.length ? (aEffort.reduce((sum,s)=>sum+s.effort,0)/aEffort.length).toFixed(1) : '—'
              const aResults = results?.filter(r => r.athlete_id === a.id) || []
              const aPodios = aResults.filter(r => r.position && r.position <= 3).length
              const maxSessions = Math.max(...(athletes.map(at => athleteSessions?.filter(s=>s.athlete_id===at.id).length||0)))
              const sessionCount = aSessions.length
              return (
                <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 80px 80px 80px', alignItems: 'center', gap: '16px', padding: '12px 20px', borderBottom: i < athletes.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: 'white', flexShrink: 0 }}>{a.first_name[0]}{a.last_name[0]}</div>
                    <span style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '500' }}>{a.first_name} {a.last_name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '4px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${maxSessions > 0 ? (sessionCount/maxSessions)*100 : 0}%`, background: 'linear-gradient(90deg,#1E2A5E,#4BA3D9)', borderRadius: '4px' }} />
                    </div>
                    <span style={{ color: '#3A4A70', fontSize: '11px', minWidth: '20px' }}>{sessionCount}</span>
                  </div>
                  <div style={{ textAlign: 'center' }}><span style={{ color: '#4BA3D9', fontSize: '13px', fontWeight: '700' }}>{avgEff}{avgEff !== '—' ? '/10' : ''}</span></div>
                  <div style={{ textAlign: 'center' }}><span style={{ color: '#EAB308', fontSize: '13px', fontWeight: '700' }}>{aPodios}</span></div>
                  <div style={{ textAlign: 'center' }}><a href={`/athletes/${a.id}`} style={{ color: '#4BA3D9', fontSize: '11px', textDecoration: 'none' }}>Ver →</a></div>
                </div>
              )
            })}
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 80px 80px 80px', gap: '16px', padding: '8px 20px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <div style={{ color: '#2A3550', fontSize: '10px', fontWeight: '700' }}>ATLETA</div>
              <div style={{ color: '#2A3550', fontSize: '10px', fontWeight: '700' }}>SESIONES</div>
              <div style={{ textAlign: 'center', color: '#2A3550', fontSize: '10px', fontWeight: '700' }}>ESFUERZO</div>
              <div style={{ textAlign: 'center', color: '#2A3550', fontSize: '10px', fontWeight: '700' }}>PODIOS</div>
              <div></div>
            </div>
          </div>
        )}

        {/* Resumen temporada */}
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '20px' }}>
          <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: '0 0 16px' }}>Resumen de la temporada</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
            {[
              { label: 'Ratio podios / resultados', value: totalResultados > 0 ? `${Math.round((podios/totalResultados)*100)}%` : '—' },
              { label: 'Estado de pagos', value: totalPendiente > 0 ? '⚠ Pendientes' : '✓ Al día' },
              { label: 'Media ingresos por atleta', value: totalDeportistas > 0 ? `€${((totalIngresos/100)/totalDeportistas).toFixed(0)}` : '—' },
              { label: 'Competiciones finalizadas', value: String(competitions?.filter(c=>c.status==='finished').length||0) },
              { label: 'Sesiones por atleta', value: totalDeportistas > 0 ? ((athleteSessions?.length||0)/totalDeportistas).toFixed(1) : '—' },
              { label: 'Resultados registrados', value: String(totalResultados) },
            ].map((item, i) => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.03)' : 'none', marginRight: i % 2 === 0 ? '32px' : '0' }}>
                <span style={{ color: '#3A4A70', fontSize: '12px' }}>{item.label}</span>
                <span style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '700' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}
