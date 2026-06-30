import { supabase } from '@/app/lib/supabase'

export default async function AlertasInactividad() {
  const diasUmbral = 7
  const umbral = new Date(Date.now() - diasUmbral*24*60*60*1000).toISOString().split('T')[0]

  const { data: athletes } = await supabase.from('athletes').select('id, first_name, last_name').eq('status','active')
  const { data: recientes } = await supabase.from('athlete_sessions').select('athlete_id, date').gte('date', umbral)

  const conActividad = new Set(recientes?.map(s => s.athlete_id) || [])
  const inactivos = athletes?.filter(a => !conActividad.has(a.id)) || []

  if (inactivos.length === 0) return null

  return (
    <div style={{ backgroundColor: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '14px', padding: '16px 18px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '15px' }}>⚠️</span>
        <span style={{ color: '#F59E0B', fontSize: '13px', fontWeight: '700' }}>
          {inactivos.length} atleta{inactivos.length > 1 ? 's' : ''} sin sesión en los últimos {diasUmbral} días
        </span>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {inactivos.map(a => (
          <a key={a.id} href={`/athletes/${a.id}`} style={{ padding: '4px 10px', borderRadius: '20px', backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B', fontSize: '12px', fontWeight: '600', textDecoration: 'none' }}>
            {a.first_name} {a.last_name}
          </a>
        ))}
      </div>
    </div>
  )
}
