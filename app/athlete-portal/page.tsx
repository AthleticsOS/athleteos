import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ProgressChart from '@/app/components/ProgressChart'
import StrengthChart from '@/app/components/StrengthChart'
import LogoutButton from '@/app/components/LogoutButton'
import PaceCalculator from '@/app/components/PaceCalculator'
import RegistrarEntrenamiento from '@/app/components/RegistrarEntrenamiento'

export default async function AthletePortal() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: athlete } = await supabase.from('athletes').select('*').eq('user_id', user.id).single()
  if (!athlete) redirect('/dashboard')

  const { data: records } = await supabase.from('personal_records').select('*').eq('athlete_id', athlete.id).order('date', { ascending: false })
  const { data: sessions } = await supabase.from('athlete_sessions').select('*').eq('athlete_id', athlete.id).order('date', { ascending: false })
  const { data: weights } = await supabase.from('athlete_weights').select('*').eq('athlete_id', athlete.id).order('date', { ascending: true })
  const { data: results } = await supabase.from('competition_results').select('*, competitions(name, date, location)').eq('athlete_id', athlete.id).order('created_at', { ascending: false })
  const today = new Date().toISOString().split('T')[0]
  const { data: convocatorias } = await supabase.from('convocatorias').select('*').gte('date', today).order('date', { ascending: true })
  const { data: announcements } = await supabase.from('announcements').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false }).limit(5)

  const misConvocatorias = convocatorias?.filter(c => (c.athlete_ids || []).includes(athlete.id)) || []
  const lastPaceSession = sessions?.find(s => s.target_distance && s.target_percentage)
  const initials = athlete.first_name[0] + athlete.last_name[0]
  const age = athlete.birth_date ? Math.floor((new Date().getTime() - new Date(athlete.birth_date).getTime()) / (365.25*24*60*60*1000)) : null

  const chartData: {fecha:string,marca:number,competicion:string}[] = []
  results?.forEach(r => {
    if (!r.mark || !r.competitions?.date) return
    const n = parseFloat(r.mark.replace(/[^0-9.]/g,''))
    if (!isNaN(n)) chartData.push({ fecha: new Date(r.competitions.date).toLocaleDateString('es-ES',{day:'numeric',month:'short'}), marca: n, competicion: r.competitions.name })
  })

  const weightChartData = weights?.map(w => ({
    fecha: new Date(w.date+'T00:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'}),
    sentadilla: w.sentadilla, hip_thrust: w.hip_thrust, peso_muerto: w.peso_muerto, press_banca: w.press_banca, cargada: w.cargada,
  })) || []

  const effortChartData = [...(sessions || [])].reverse().map(s => ({
    fecha: new Date(s.date+'T00:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'}),
    esfuerzo: s.effort,
  }))

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', fontFamily: "-apple-system,'Inter',sans-serif" }}>

      {/* NAV */}
      <nav style={{ backgroundColor: '#070B18', borderBottom: '1px solid rgba(75,163,217,0.1)', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/escudo-wa.png?v=3" alt="WeAthletics" width={30} height={30} style={{ borderRadius: '50%' }} />
          <span style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '700' }}>WeAthletics</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: 'white' }}>{initials}</div>
          <span style={{ color: '#4A5580', fontSize: '13px' }}>{athlete.first_name}</span>
          <LogoutButton />
        </div>
      </nav>

      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '28px 24px' }}>

        {/* CABECERA ATLETA */}
        <div style={{ background: 'linear-gradient(135deg,#0A0F1E 0%,#0D1428 60%,#091020 100%)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '20px', padding: '24px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#4BA3D9,transparent)' }} />
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(75,163,217,0.06) 0%,transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', border: '2px solid rgba(75,163,217,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '800', color: 'white', flexShrink: 0 }}>{initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#4A5580', fontSize: '12px', marginBottom: '2px' }}>{greeting}</div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.02em', margin: 0 }}>{athlete.first_name} {athlete.last_name}</h1>
              <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                {athlete.sport && <span style={{ color: '#3A4A70', fontSize: '12px' }}>{athlete.sport}</span>}
                {athlete.category && <span style={{ color: '#3A4A70', fontSize: '12px' }}>· {athlete.category}</span>}
                {age && <span style={{ color: '#3A4A70', fontSize: '12px' }}>· {age} años</span>}
              </div>
            </div>
            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>● Activo</span>
          </div>

          {/* Stats rápidos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginTop: '20px' }}>
            {[
              { label: 'Sesiones', value: String(sessions?.length || 0), color: '#4BA3D9' },
              { label: 'Competiciones', value: String(results?.length || 0), color: '#F59E0B' },
              { label: 'Marcas', value: String(records?.length || 0), color: '#10B981' },
            ].map(s => (
              <div key={s.label} style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: '800', color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
                <div style={{ color: '#2A3550', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '3px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CONVOCATORIAS */}
        {misConvocatorias.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: '#3A4A70', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Tus convocatorias</div>
            {misConvocatorias.map(c => (
              <div key={c.id} style={{ backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.2)', borderRadius: '12px', padding: '14px 16px', marginBottom: '8px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#4BA3D9,transparent)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ backgroundColor: 'rgba(75,163,217,0.1)', borderRadius: '8px', padding: '8px 12px', textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#4BA3D9', lineHeight: 1 }}>{new Date(c.date+'T00:00:00').getDate()}</div>
                    <div style={{ color: '#4BA3D9', fontSize: '9px', textTransform: 'uppercase', fontWeight: '600' }}>{new Date(c.date+'T00:00:00').toLocaleDateString('es-ES',{month:'short'})}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#CDD0E0', fontSize: '14px', fontWeight: '700' }}>{c.competition_name}</div>
                    {c.location && <div style={{ color: '#3A4A70', fontSize: '12px', marginTop: '2px' }}>📍 {c.location}</div>}
                    {c.description && <div style={{ color: '#4A5580', fontSize: '12px', marginTop: '4px' }}>{c.description}</div>}
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', backgroundColor: 'rgba(75,163,217,0.1)', color: '#4BA3D9', border: '1px solid rgba(75,163,217,0.2)', flexShrink: 0 }}>Convocado</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AVISOS */}
        {announcements && announcements.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: '#3A4A70', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Avisos del club</div>
            {announcements.map(ann => {
              const colors: Record<string,string> = { info:'#4BA3D9', success:'#10B981', warning:'#F59E0B', urgent:'#EF4444' }
              const c = colors[ann.type] || '#4BA3D9'
              return (
                <div key={ann.id} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.08)', borderRadius: '12px', padding: '14px 16px', marginBottom: '8px', borderLeft: `3px solid ${c}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{ color: c, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{ann.type === 'urgent' ? 'Urgente' : ann.type === 'warning' ? 'Atención' : ann.type === 'success' ? 'Noticia' : 'Aviso'}{ann.pinned ? ' · 📌' : ''}</span>
                    <span style={{ color: '#2A3550', fontSize: '11px' }}>{new Date(ann.created_at).toLocaleDateString('es-ES',{day:'numeric',month:'short'})}</span>
                  </div>
                  <div style={{ color: '#CDD0E0', fontSize: '14px', fontWeight: '600', marginBottom: '3px' }}>{ann.title}</div>
                  <div style={{ color: '#4A5580', fontSize: '12px', lineHeight: '1.5' }}>{ann.content}</div>
                </div>
              )
            })}
          </div>
        )}

        {/* REGISTRAR ENTRENAMIENTO */}
        <div style={{ marginBottom: '16px' }}>
          <RegistrarEntrenamiento athleteId={athlete.id} />
        </div>

        {/* ACCESOS RÁPIDOS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '20px' }}>
          {[
            { href: `/athletes/${athlete.id}/sesion`, label: '+ Nueva sesión', color: '#4BA3D9', bg: 'rgba(75,163,217,0.08)', bdr: 'rgba(75,163,217,0.2)' },
            { href: `/athletes/${athlete.id}/marca`, label: '+ Añadir marca', color: '#10B981', bg: 'rgba(16,185,129,0.08)', bdr: 'rgba(16,185,129,0.2)' },
            { href: `/athletes/${athlete.id}/tiempos`, label: 'Ver tiempos', color: '#CDD0E0', bg: 'rgba(255,255,255,0.03)', bdr: 'rgba(255,255,255,0.08)' },
          ].map(a => (
            <a key={a.href} href={a.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', borderRadius: '11px', fontSize: '13px', fontWeight: '600', backgroundColor: a.bg, color: a.color, border: `1px solid ${a.bdr}`, textDecoration: 'none' }}>
              {a.label}
            </a>
          ))}
        </div>

        {/* CALCULADORA DE RITMO */}
        {lastPaceSession && records && (
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Tu ritmo para la próxima sesión</div>
            <div style={{ color: '#3A4A70', fontSize: '11px', marginBottom: '14px' }}>{lastPaceSession.exercise}</div>
            <PaceCalculator records={records} distance={lastPaceSession.target_distance} percentage={lastPaceSession.target_percentage} />
          </div>
        )}

        {/* GRÁFICAS */}
        {effortChartData.length >= 2 && (
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '20px', marginBottom: '12px' }}>
            <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: '0 0 14px' }}>Mi evolución de esfuerzo</p>
            <StrengthChart data={effortChartData} series={[{key:'esfuerzo',label:'Esfuerzo',color:'#4BA3D9'}]} unit="/10" />
          </div>
        )}

        {chartData.length >= 2 && (
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '20px', marginBottom: '12px' }}>
            <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: '0 0 14px' }}>Mi progresión en competición</p>
            <ProgressChart data={chartData} unit="s" lowerIsBetter={true} />
          </div>
        )}

        {weightChartData.length >= 2 && (
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '20px', marginBottom: '12px' }}>
            <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: '0 0 14px' }}>Mi progresión de fuerza</p>
            <StrengthChart data={weightChartData} series={[{key:'sentadilla',label:'Sentadilla',color:'#4BA3D9'},{key:'hip_thrust',label:'Hip Thrust',color:'#F59E0B'},{key:'peso_muerto',label:'Peso Muerto',color:'#EF4444'},{key:'press_banca',label:'Banca',color:'#10B981'},{key:'cargada',label:'Cargada',color:'#A78BFA'}]} unit="kg" />
          </div>
        )}

        {/* MARCAS Y SESIONES */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          {records && records.length > 0 && (
            <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
                <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>Mis marcas</p>
              </div>
              {records.map((r, i) => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 18px', borderBottom: i<records.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '500' }}>{r.discipline}</div>
                    {r.competition && <div style={{ color: '#2A3550', fontSize: '11px' }}>{r.competition}</div>}
                  </div>
                  <div style={{ color: '#4BA3D9', fontSize: '14px', fontWeight: '800', fontFamily: 'monospace' }}>{r.mark}</div>
                </div>
              ))}
            </div>
          )}

          {sessions && sessions.length > 0 && (
            <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
                <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>Últimas sesiones</p>
              </div>
              {sessions.slice(0,5).map((s, i) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px', borderBottom: i<Math.min(sessions.length,5)-1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                  <div style={{ width: '32px', textAlign: 'center', flexShrink: 0, backgroundColor: 'rgba(75,163,217,0.06)', borderRadius: '6px', padding: '4px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#E0E0E0', lineHeight: 1 }}>{new Date(s.date+'T00:00:00').getDate()}</div>
                    <div style={{ color: '#3A4A70', fontSize: '8px', textTransform: 'uppercase' }}>{new Date(s.date+'T00:00:00').toLocaleDateString('es-ES',{month:'short'})}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#CDD0E0', fontSize: '12px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.exercise}</div>
                  </div>
                  <div style={{ padding: '2px 6px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', backgroundColor: 'rgba(75,163,217,0.1)', color: '#4BA3D9', flexShrink: 0 }}>{s.effort}/10</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COMPETICIONES */}
        {results && results.length > 0 && (
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
              <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>Mis competiciones</p>
            </div>
            {results.map((r, i) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 18px', borderBottom: i<results.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800', backgroundColor: r.position===1 ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.04)', color: r.position===1 ? '#EAB308' : '#3A4A70' }}>{r.position || '—'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '500' }}>{r.competitions?.name}</div>
                  <div style={{ color: '#2A3550', fontSize: '11px', marginTop: '1px' }}>{r.discipline}</div>
                </div>
                <div style={{ color: '#4BA3D9', fontSize: '14px', fontWeight: '700', fontFamily: 'monospace' }}>{r.mark}</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
