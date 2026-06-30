import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ProgressChart from '@/app/components/ProgressChart'
import StrengthChart from '@/app/components/StrengthChart'
import LogoutButton from '@/app/components/LogoutButton'
import PaceCalculator from '@/app/components/PaceCalculator'
import RegistrarEntrenamiento from '@/app/components/RegistrarEntrenamiento'
import ConfirmarConvocatoria from '@/app/components/ConfirmarConvocatoria'
import EditarDatosAtleta from '@/app/components/EditarDatosAtleta'
import EncuestaBienestar from '@/app/components/EncuestaBienestar'
import PushSubscribeButton from '@/app/components/PushSubscribeButton'
import AthletePortalTabs from '@/app/components/AthletePortalTabs'

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
  const { data: myConfirmations } = await supabase.from('convocatoria_confirmations').select('*').eq('athlete_id', athlete.id)
  const { data: myMessages } = await supabase.from('direct_messages').select('*').eq('athlete_id', athlete.id).order('created_at', { ascending: false }).limit(20)
  const { data: myWellness } = await supabase.from('wellness_surveys').select('*').eq('athlete_id', athlete.id).order('date', { ascending: false }).limit(7)
  const { data: myInjuries } = await supabase.from('injury_records').select('*').eq('athlete_id', athlete.id).is('end_date', null)
  const { data: todayWellness } = await supabase.from('wellness_surveys').select('id').eq('athlete_id', athlete.id).eq('date', today).maybeSingle()
  const { data: announcements } = await supabase.from('announcements').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false }).limit(5)

  const misConvocatorias = convocatorias?.filter(c => (c.athlete_ids || []).includes(athlete.id)) || []
  const pendingConvocatorias = misConvocatorias.filter(c => !myConfirmations?.find(cf => cf.convocatoria_id === c.id)).length
  const unreadMessages = myMessages?.filter(m => m.from_director && !m.read).length ?? 0
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

  // ── SECCIÓN: INICIO ──────────────────────────────────────────────
  const tabInicio = (
    <div style={{ padding: '16px', maxWidth: '640px', margin: '0 auto' }}>
      {/* Cabecera atleta */}
      <div style={{ background: 'linear-gradient(135deg,#0A0F1E,#0D1428)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '18px', padding: '20px', marginBottom: '14px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#4BA3D9,transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', border: '2px solid rgba(75,163,217,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', color: 'white', flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#4A5580', fontSize: '12px' }}>{greeting}</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.02em' }}>{athlete.first_name} {athlete.last_name}</div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
              {athlete.sport && <span style={{ color: '#3A4A70', fontSize: '11px' }}>{athlete.sport}</span>}
              {age && <span style={{ color: '#3A4A70', fontSize: '11px' }}>· {age} años</span>}
            </div>
          </div>
          <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)', flexShrink: 0 }}>● Activo</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginTop: '16px' }}>
          {[
            { label: 'Sesiones', value: String(sessions?.length || 0), color: '#4BA3D9' },
            { label: 'Competiciones', value: String(results?.length || 0), color: '#F59E0B' },
            { label: 'Marcas', value: String(records?.length || 0), color: '#10B981' },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '800', color: s.color }}>{s.value}</div>
              <div style={{ color: '#2A3550', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Lesión activa */}
      {myInjuries && myInjuries.length > 0 && (
        <div style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: '14px', padding: '14px 16px', marginBottom: '12px' }}>
          <div style={{ color: '#EF4444', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>🩹 Lesión activa</div>
          {myInjuries.map(inj => {
            const days = Math.floor((new Date().getTime() - new Date(inj.start_date+'T00:00:00').getTime()) / (1000*60*60*24))
            return <div key={inj.id} style={{ color: '#CDD0E0', fontSize: '13px' }}>{inj.type} · {inj.body_part} <span style={{ color: '#EF4444', fontSize: '11px' }}>({days}d de baja)</span></div>
          })}
        </div>
      )}

      {/* Convocatoria pendiente de confirmar */}
      {pendingConvocatorias > 0 && (
        <div style={{ backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.22)', borderRadius: '14px', padding: '14px 16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '22px' }}>📣</span>
          <div>
            <div style={{ color: '#F59E0B', fontSize: '13px', fontWeight: '700' }}>Tienes {pendingConvocatorias} convocatoria{pendingConvocatorias > 1 ? 's' : ''} sin confirmar</div>
            <div style={{ color: '#4A5580', fontSize: '12px' }}>Ve a la pestaña Competiciones para responder</div>
          </div>
        </div>
      )}

      {/* Avisos del club */}
      {announcements && announcements.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ color: '#3A4A70', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Avisos del club</div>
          {announcements.map(ann => {
            const colors: Record<string,string> = { info:'#4BA3D9', success:'#10B981', warning:'#F59E0B', urgent:'#EF4444' }
            const c = colors[ann.type] || '#4BA3D9'
            return (
              <div key={ann.id} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.07)', borderRadius: '12px', padding: '13px 16px', marginBottom: '8px', borderLeft: `3px solid ${c}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: c, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>{ann.type === 'urgent' ? 'Urgente' : ann.type === 'warning' ? 'Atención' : ann.type === 'success' ? 'Noticia' : 'Aviso'}{ann.pinned ? ' · 📌' : ''}</span>
                  <span style={{ color: '#2A3550', fontSize: '11px' }}>{new Date(ann.created_at).toLocaleDateString('es-ES',{day:'numeric',month:'short'})}</span>
                </div>
                <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', marginBottom: '2px' }}>{ann.title}</div>
                <div style={{ color: '#4A5580', fontSize: '12px', lineHeight: '1.5' }}>{ann.content}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Accesos rápidos */}
      <div style={{ color: '#3A4A70', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Accesos rápidos</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
        {[
          { href: `/athletes/${athlete.id}/sesion`, label: '+ Nueva sesión', icon: '🏃', color: '#4BA3D9', bg: 'rgba(75,163,217,0.07)', bdr: 'rgba(75,163,217,0.18)' },
          { href: `/athletes/${athlete.id}/marca`, label: '+ Añadir marca', icon: '🎯', color: '#10B981', bg: 'rgba(16,185,129,0.07)', bdr: 'rgba(16,185,129,0.18)' },
          { href: `/athletes/${athlete.id}/tiempos`, label: 'Ver mis tiempos', icon: '⏱', color: '#CDD0E0', bg: 'rgba(255,255,255,0.03)', bdr: 'rgba(255,255,255,0.07)' },
          { href: `/athletes/${athlete.id}/lesiones`, label: 'Mis lesiones', icon: '🩹', color: '#F59E0B', bg: 'rgba(245,158,11,0.07)', bdr: 'rgba(245,158,11,0.18)' },
        ].map(a => (
          <a key={a.href} href={a.href} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', backgroundColor: a.bg, color: a.color, border: `1px solid ${a.bdr}`, textDecoration: 'none' }}>
            <span style={{ fontSize: '16px' }}>{a.icon}</span>{a.label}
          </a>
        ))}
      </div>

      {/* Editar perfil */}
      <EditarDatosAtleta athlete={athlete} />
    </div>
  )

  // ── SECCIÓN: BIENESTAR ───────────────────────────────────────────
  const tabBienestar = (
    <div style={{ padding: '16px', maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ color: '#3A4A70', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Bienestar y salud</div>

      <EncuestaBienestar athleteId={athlete.id} todayDone={!!todayWellness} />

      {myWellness && myWellness.length > 0 && (
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '16px 18px', marginBottom: '14px' }}>
          <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>Mi semana</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[...myWellness].reverse().map(s => {
              const score = Math.round((s.sleep + s.energy + (10 - s.stress) + (10 - s.pain)) / 4)
              const color = score >= 7 ? '#10B981' : score >= 5 ? '#F59E0B' : '#EF4444'
              return (
                <div key={s.id} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ width: '100%', height: '36px', borderRadius: '8px', backgroundColor: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color, fontSize: '13px', fontWeight: '800' }}>{score}</span>
                  </div>
                  <div style={{ color: '#2A3550', fontSize: '9px', marginTop: '4px' }}>
                    {new Date(s.date+'T00:00:00').toLocaleDateString('es-ES',{weekday:'narrow'})}
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'center' }}>
            {[['🟢','Bien (7-10)','#10B981'],['🟡','Regular (5-6)','#F59E0B'],['🔴','Bajo (1-4)','#EF4444']].map(([dot, label, color]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '8px' }}>{dot}</span>
                <span style={{ color: color as string, fontSize: '10px' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {myInjuries && myInjuries.length > 0 && (
        <div style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: '14px', padding: '16px 18px' }}>
          <div style={{ color: '#EF4444', fontSize: '13px', fontWeight: '700', marginBottom: '10px' }}>🩹 Lesiones activas</div>
          {myInjuries.map(inj => {
            const days = Math.floor((new Date().getTime() - new Date(inj.start_date+'T00:00:00').getTime()) / (1000*60*60*24))
            return (
              <div key={inj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
                <div>
                  <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600' }}>{inj.type}</div>
                  <div style={{ color: '#4A5580', fontSize: '11px' }}>{inj.body_part} · {inj.severity}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#EF4444', fontSize: '18px', fontWeight: '800' }}>{days}</div>
                  <div style={{ color: '#3A4A70', fontSize: '10px' }}>días de baja</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  // ── SECCIÓN: ENTRENOS ────────────────────────────────────────────
  const tabEntrenos = (
    <div style={{ padding: '16px', maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ color: '#3A4A70', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Mis entrenamientos</div>

      <div style={{ marginBottom: '14px' }}>
        <RegistrarEntrenamiento athleteId={athlete.id} />
      </div>

      {lastPaceSession && records && (
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '18px', marginBottom: '14px' }}>
          <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', marginBottom: '3px' }}>Tu ritmo para la próxima sesión</div>
          <div style={{ color: '#3A4A70', fontSize: '11px', marginBottom: '14px' }}>{lastPaceSession.exercise}</div>
          <PaceCalculator records={records} distance={lastPaceSession.target_distance} percentage={lastPaceSession.target_percentage} />
        </div>
      )}

      {effortChartData.length >= 2 && (
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '18px', marginBottom: '14px' }}>
          <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', marginBottom: '14px' }}>Evolución de esfuerzo</div>
          <StrengthChart data={effortChartData} series={[{key:'esfuerzo',label:'Esfuerzo',color:'#4BA3D9'}]} unit="/10" />
        </div>
      )}

      {weightChartData.length >= 2 && (
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '18px', marginBottom: '14px' }}>
          <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', marginBottom: '14px' }}>Progresión de fuerza</div>
          <StrengthChart data={weightChartData} series={[{key:'sentadilla',label:'Sentadilla',color:'#4BA3D9'},{key:'hip_thrust',label:'Hip Thrust',color:'#F59E0B'},{key:'peso_muerto',label:'Peso Muerto',color:'#EF4444'},{key:'press_banca',label:'Banca',color:'#10B981'},{key:'cargada',label:'Cargada',color:'#A78BFA'}]} unit="kg" />
        </div>
      )}

      {sessions && sessions.length > 0 && (
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
            <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600' }}>Últimas sesiones</div>
          </div>
          {sessions.slice(0,10).map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 18px', borderBottom: i < Math.min(sessions.length,10)-1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
              <div style={{ width: '36px', textAlign: 'center', flexShrink: 0, backgroundColor: 'rgba(75,163,217,0.06)', borderRadius: '8px', padding: '5px' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#E0E0E0', lineHeight: 1 }}>{new Date(s.date+'T00:00:00').getDate()}</div>
                <div style={{ color: '#3A4A70', fontSize: '9px', textTransform: 'uppercase' }}>{new Date(s.date+'T00:00:00').toLocaleDateString('es-ES',{month:'short'})}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.exercise}</div>
                {s.duration && <div style={{ color: '#3A4A70', fontSize: '11px' }}>{s.duration} min</div>}
              </div>
              <div style={{ padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', backgroundColor: 'rgba(75,163,217,0.1)', color: '#4BA3D9', flexShrink: 0 }}>{s.effort}/10</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // ── SECCIÓN: COMPETICIONES ───────────────────────────────────────
  const tabCompeticiones = (
    <div style={{ padding: '16px', maxWidth: '640px', margin: '0 auto' }}>
      {misConvocatorias.length > 0 && (
        <>
          <div style={{ color: '#3A4A70', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Mis convocatorias</div>
          {misConvocatorias.map(c => (
            <div key={c.id} style={{ backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.18)', borderRadius: '14px', padding: '14px 16px', marginBottom: '10px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#4BA3D9,transparent)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ backgroundColor: 'rgba(75,163,217,0.1)', borderRadius: '10px', padding: '8px 10px', textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#4BA3D9', lineHeight: 1 }}>{new Date(c.date+'T00:00:00').getDate()}</div>
                  <div style={{ color: '#4BA3D9', fontSize: '9px', textTransform: 'uppercase', fontWeight: '600' }}>{new Date(c.date+'T00:00:00').toLocaleDateString('es-ES',{month:'short'})}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#CDD0E0', fontSize: '14px', fontWeight: '700' }}>{c.competition_name}</div>
                  {c.location && <div style={{ color: '#3A4A70', fontSize: '12px', marginTop: '2px' }}>📍 {c.location}</div>}
                  {c.description && <div style={{ color: '#4A5580', fontSize: '12px', marginTop: '4px' }}>{c.description}</div>}
                </div>
              </div>
              <div style={{ marginTop: '12px' }}>
                <ConfirmarConvocatoria convocatoriaId={c.id} athleteId={athlete.id} initial={myConfirmations?.find(cf => cf.convocatoria_id === c.id)?.status ?? null} />
              </div>
            </div>
          ))}
        </>
      )}

      {misConvocatorias.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#2A3550' }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>🏆</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#3A4A70' }}>No hay convocatorias próximas</div>
        </div>
      )}

      {records && records.length > 0 && (
        <>
          <div style={{ color: '#3A4A70', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '20px 0 10px' }}>Mis marcas personales</div>
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden', marginBottom: '14px' }}>
            {records.map((r, i) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 18px', borderBottom: i < records.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600' }}>{r.discipline}</div>
                  {r.competition && <div style={{ color: '#2A3550', fontSize: '11px' }}>{r.competition}</div>}
                </div>
                <div style={{ color: '#4BA3D9', fontSize: '15px', fontWeight: '800', fontFamily: 'monospace' }}>{r.mark}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {chartData.length >= 2 && (
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '18px', marginBottom: '14px' }}>
          <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', marginBottom: '14px' }}>Progresión en competición</div>
          <ProgressChart data={chartData} unit="s" lowerIsBetter={true} />
        </div>
      )}

      {results && results.length > 0 && (
        <>
          <div style={{ color: '#3A4A70', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '20px 0 10px' }}>Historial de resultados</div>
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
            {results.map((r, i) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 18px', borderBottom: i < results.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', backgroundColor: r.position===1 ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.04)', color: r.position===1 ? '#EAB308' : '#3A4A70' }}>{r.position || '—'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '500' }}>{r.competitions?.name}</div>
                  <div style={{ color: '#2A3550', fontSize: '11px', marginTop: '1px' }}>{r.discipline}</div>
                </div>
                <div style={{ color: '#4BA3D9', fontSize: '14px', fontWeight: '700', fontFamily: 'monospace' }}>{r.mark}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )

  // ── SECCIÓN: MENSAJES ────────────────────────────────────────────
  const tabMensajes = (
    <div style={{ padding: '16px', maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ color: '#3A4A70', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Chat con el club</div>
      <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
        {(!myMessages || myMessages.length === 0) && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#2A3550' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
            <div style={{ fontSize: '13px' }}>Sin mensajes todavía</div>
          </div>
        )}
        {[...(myMessages || [])].reverse().map((m, i) => (
          <div key={m.id} style={{ padding: '12px 16px', borderBottom: i < (myMessages?.length ?? 0)-1 ? '1px solid rgba(255,255,255,0.03)' : 'none', display: 'flex', flexDirection: m.from_director ? 'row' : 'row-reverse', gap: '10px', alignItems: 'flex-end' }}>
            {m.from_director && (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: 'white', flexShrink: 0 }}>WA</div>
            )}
            <div style={{ maxWidth: '75%' }}>
              <div style={{
                padding: '10px 14px', borderRadius: m.from_director ? '14px 14px 14px 4px' : '14px 14px 4px 14px',
                backgroundColor: m.from_director ? 'rgba(30,42,94,0.8)' : 'rgba(75,163,217,0.1)',
                border: `1px solid ${m.from_director ? 'rgba(75,163,217,0.2)' : 'rgba(75,163,217,0.15)'}`,
              }}>
                <div style={{ color: '#CDD0E0', fontSize: '13px', lineHeight: '1.5' }}>{m.content}</div>
              </div>
              <div style={{ color: '#2A3550', fontSize: '10px', marginTop: '3px', textAlign: m.from_director ? 'left' : 'right' }}>
                {new Date(m.created_at).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})} · {new Date(m.created_at).toLocaleDateString('es-ES',{day:'numeric',month:'short'})}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '12px', backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '14px', padding: '12px 14px' }}>
        <div style={{ color: '#3A4A70', fontSize: '12px', textAlign: 'center' }}>Para escribir al club, accede desde el navegador web</div>
      </div>
    </div>
  )

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', fontFamily: "-apple-system,'Inter',sans-serif" }}>
      {/* NAV */}
      <nav style={{ backgroundColor: '#070B18', borderBottom: '1px solid rgba(75,163,217,0.1)', padding: '0 16px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/escudo-wa.png?v=3" alt="WeAthletics" width={28} height={28} style={{ borderRadius: '50%' }} />
          <span style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '700' }}>WeAthletics</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PushSubscribeButton userId={user.id} />
          <LogoutButton />
        </div>
      </nav>

      <AthletePortalTabs
        tabs={{ inicio: tabInicio, bienestar: tabBienestar, entrenos: tabEntrenos, competiciones: tabCompeticiones, mensajes: tabMensajes }}
        unreadMessages={unreadMessages}
        pendingConvocatorias={pendingConvocatorias}
      />
    </main>
  )
}
