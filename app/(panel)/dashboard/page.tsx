import { supabase } from '@/app/lib/supabase'
import RevenueChart from '@/app/components/RevenueChart'

export default async function Dashboard() {
  const { data: athletes } = await supabase.from('athletes').select('*')
  const { data: competitions } = await supabase.from('competitions').select('*')
  const { data: sessions } = await supabase.from('training_sessions').select('*')
  const { data: payments } = await supabase.from('payments').select('*')

  const upcoming = competitions?.filter(c => c.status === 'upcoming').length || 0
  const pending = payments?.filter(p => p.status === 'pending').length || 0
  const totalPaid = payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount_cents, 0) || 0

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <main className="min-h-screen p-8" style={{backgroundColor:'#080808'}}>
      <div style={{maxWidth:'1100px', margin:'0 auto'}}>

        <div className="mb-10">
          <h1 style={{fontSize:'28px', fontWeight:'700', color:'#F0F0F0', letterSpacing:'-0.03em', margin:0}}>
            {greeting}, Aaron
          </h1>
          <p style={{color:'#333', fontSize:'14px', marginTop:'6px'}}>
            Temporada 2024–2025 · WeAthletics
          </p>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'16px'}}>
          {[
            { label: 'Deportistas', value: String(athletes?.length || 0), sub: 'Activos en el club', color: '#4BA3D9', glow: true },
            { label: 'Competiciones', value: String(competitions?.length || 0), sub: `${upcoming} próximas`, color: '#F59E0B', glow: false },
            { label: 'Ingresos', value: `€${(totalPaid/100).toFixed(0)}`, sub: pending > 0 ? `${pending} pendientes` : 'Todo al día', color: pending > 0 ? '#EF4444' : '#10B981', glow: false },
            { label: 'Sesiones', value: String(sessions?.length || 0), sub: 'Esta temporada', color: '#4BA3D9', glow: false },
          ].map((stat) => (
            <div key={stat.label} style={{
              backgroundColor:'#0E0E0E',
              border:`1px solid ${stat.glow ? 'rgba(75,163,217,0.25)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius:'14px', padding:'20px', position:'relative', overflow:'hidden',
            }}>
              {stat.glow && <div style={{position:'absolute',top:0,left:0,right:0,height:'1px',background:'linear-gradient(90deg,transparent,rgba(75,163,217,0.5),transparent)'}}/>}
              <div style={{color:'#444',fontSize:'11px',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'12px'}}>
                {stat.label}
              </div>
              <div style={{fontSize:'32px',fontWeight:'700',color:'#F0F0F0',letterSpacing:'-0.03em',lineHeight:1}}>
                {stat.value}
              </div>
              <div style={{fontSize:'12px',color:stat.color,marginTop:'8px',fontWeight:'500'}}>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:'12px',marginBottom:'16px'}}>
          <div style={{backgroundColor:'#0E0E0E',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'14px',padding:'20px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
              <div style={{color:'#888',fontSize:'13px',fontWeight:'500'}}>Ingresos 2025</div>
              <span style={{color:'#333',fontSize:'11px'}}>últimos 6 meses</span>
            </div>
            <RevenueChart />
          </div>

          <div style={{backgroundColor:'#0E0E0E',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'14px',padding:'20px'}}>
            <div style={{color:'#888',fontSize:'13px',fontWeight:'500',marginBottom:'14px'}}>Accesos rápidos</div>
            <div style={{display:'flex',flexDirection:'column',gap:'2px'}}>
              {[
                { href:'/athletes/nuevo', label:'+ Nuevo deportista' },
                { href:'/competitions/nueva', label:'+ Nueva competición' },
                { href:'/training/nuevo', label:'+ Nueva sesión' },
                { href:'/finances/nuevo', label:'+ Nuevo pago' },
                { href:'/calendar', label:'📅 Ver calendario' },
                { href:'/ai', label:'🧠 Asistente IA' },
              ].map(item => (
                <a key={item.href} href={item.href}
                  className="hover:bg-white/5 hover:text-[#CCC] transition-colors"
                  style={{display:'flex',alignItems:'center',padding:'8px 10px',borderRadius:'8px',color:'#555',fontSize:'13px'}}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div style={{backgroundColor:'#0E0E0E',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'14px',overflow:'hidden'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 20px',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
            <div style={{color:'#888',fontSize:'13px',fontWeight:'500'}}>Deportistas del club</div>
            <a href="/athletes" style={{color:'#4BA3D9',fontSize:'12px'}}>Ver todos →</a>
          </div>
          {athletes?.map((athlete, index) => (
            <a href={`/athletes/${athlete.id}`} key={athlete.id}
              className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors"
              style={{borderBottom: index < (athletes.length-1) ? '1px solid rgba(255,255,255,0.03)' : 'none'}}>
              <div style={{
                width:'32px',height:'32px',borderRadius:'50%',
                background:'linear-gradient(135deg,rgba(30,42,94,0.5),rgba(75,163,217,0.25))',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:'12px',fontWeight:'600',color:'#4BA3D9',flexShrink:0,
              }}>
                {athlete.first_name[0]}{athlete.last_name[0]}
              </div>
              <div style={{flex:1}}>
                <div style={{color:'#CCC',fontSize:'13px',fontWeight:'500'}}>{athlete.first_name} {athlete.last_name}</div>
                <div style={{color:'#444',fontSize:'11px',marginTop:'1px'}}>{athlete.email || 'Sin email'}</div>
              </div>
              <div style={{color:'#333',fontSize:'12px'}}>{athlete.sport} · {athlete.category}</div>
            </a>
          ))}
        </div>

      </div>
    </main>
  )
}