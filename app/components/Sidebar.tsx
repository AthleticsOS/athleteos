'use client'

import { usePathname } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const navItems = [
  { href: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { href: '/athletes', icon: '👥', label: 'Deportistas' },
  { href: '/competitions', icon: '🏆', label: 'Competiciones' },
  { href: '/training', icon: '🏃', label: 'Entrenamientos' },
  { href: '/finances', icon: '💶', label: 'Finanzas' },
  { href: '/communication', icon: '📢', label: 'Comunicación' },
  { href: '/ranking', icon: '📊', label: 'Ranking' },
  { href: '/calendar', icon: '📅', label: 'Calendario' },
  { href: '/ai', icon: '🧠', label: 'Asistente IA' },
]

export default function Sidebar() {
  const pathname = usePathname()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <aside style={{position:'fixed', left:0, top:0, height:'100vh', width:'224px', backgroundColor:'#0D0D0D', borderRight:'1px solid #1A1A1A', display:'flex', flexDirection:'column', zIndex:50}}>
      <div style={{padding:'20px', borderBottom:'1px solid #1A1A1A'}}>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <div style={{width:'32px', height:'32px', backgroundColor:'#2563EB', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <span style={{color:'white', fontSize:'14px', fontWeight:'bold'}}>A</span>
          </div>
          <div>
            <div style={{color:'white', fontSize:'13px', fontWeight:'500'}}>AthleteOS</div>
            <div style={{color:'#444', fontSize:'11px'}}>WeAthletics</div>
          </div>
        </div>
      </div>
      <nav style={{flex:1, padding:'12px', overflowY:'auto'}}>
        <div style={{display:'flex', flexDirection:'column', gap:'2px'}}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <a key={item.href} href={item.href} style={{
                display:'flex', alignItems:'center', gap:'10px',
                padding:'9px 12px', borderRadius:'8px', fontSize:'13px',
                textDecoration:'none', transition:'all 150ms',
                backgroundColor: isActive ? 'rgba(37,99,235,0.15)' : 'transparent',
                color: isActive ? '#60A5FA' : '#555',
                fontWeight: isActive ? '500' : '400',
              }}>
                <span style={{fontSize:'15px'}}>{item.icon}</span>
                {item.label}
              </a>
            )
          })}
        </div>
      </nav>
      <div style={{padding:'12px', borderTop:'1px solid #1A1A1A'}}>
        <div style={{display:'flex', alignItems:'center', gap:'10px', padding:'8px 12px', marginBottom:'4px'}}>
          <div style={{width:'28px', height:'28px', borderRadius:'50%', backgroundColor:'rgba(37,99,235,0.2)', color:'#60A5FA', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'600'}}>
            AC
          </div>
          <div>
            <div style={{color:'white', fontSize:'12px', fontWeight:'500'}}>Aaron Cortés</div>
            <div style={{color:'#444', fontSize:'11px'}}>Director</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          width:'100%', padding:'8px 12px', borderRadius:'8px',
          background:'transparent', border:'none', cursor:'pointer',
          color:'#444', fontSize:'12px', textAlign:'left',
          transition:'all 150ms',
        }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FF4D4D')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#444')}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}