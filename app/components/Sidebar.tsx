'use client'

import { usePathname } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import Image from 'next/image'

const navSections = [
  {
    label: 'General',
    items: [
      { href: '/dashboard', icon: '⊞', label: 'Dashboard' },
      { href: '/calendar', icon: '📅', label: 'Calendario' },
      { href: '/stats', icon: '📈', label: 'Estadísticas' },
      { href: '/notifications', icon: '🔔', label: 'Notificaciones', badge: true },
    ]
  },
  {
    label: 'Club',
    items: [
      { href: '/athletes', icon: '👤', label: 'Deportistas' },
      { href: '/coach', icon: '👁', label: 'Vista entrenador' },
      { href: '/groups', icon: '👥', label: 'Grupos' },
      { href: '/training', icon: '🏃', label: 'Entrenamientos' },
      { href: '/training/plantillas', icon: '📋', label: 'Plantillas' },
      { href: '/asistencia', icon: '✅', label: 'Asistencia' },
      { href: '/competitions', icon: '🏆', label: 'Competiciones' },
      { href: '/convocatorias', icon: '📣', label: 'Convocatorias' },
      { href: '/ranking', icon: '📊', label: 'Ranking' },
    ]
  },
  {
    label: 'Administración',
    items: [
      { href: '/finances', icon: '💶', label: 'Finanzas' },
      { href: '/communication', icon: '📢', label: 'Comunicación' },
      { href: '/extraescolares', icon: '🏫', label: 'Extraescolares' },
    ]
  },
  {
    label: 'Inteligencia',
    items: [
      { href: '/ai', icon: '🧠', label: 'Asistente IA' },
    ]
  },
  {
    label: 'Sistema',
    items: [
      { href: '/settings/roles', icon: '🔑', label: 'Roles y accesos' },
    ]
  }
]

export default function Sidebar() {
  const pathname = usePathname()
  const [unread, setUnread] = useState(0)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('read', false)
      .then(({ count }) => setUnread(count || 0))
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0,
      height: '100vh', width: '220px',
      backgroundColor: '#070B18',
      borderRight: '1px solid rgba(75,163,217,0.1)',
      display: 'flex', flexDirection: 'column',
      zIndex: 50,
    }}>
      <div style={{
        padding: '20px 16px 16px',
        borderBottom: '1px solid rgba(75,163,217,0.08)',
      }}>
        <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px'}}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/escudo-wa.png?v=3" alt="WeAthletics" width={36} height={36} style={{borderRadius:'50%'}} />
          <div>
            <div style={{color:'#E8EAF0', fontSize:'12px', fontWeight:'700', letterSpacing:'0.02em'}}>WeAthletics</div>
            <div style={{color:'#4BA3D9', fontSize:'10px', marginTop:'1px', fontWeight:'500'}}>Club Deportivo</div>
          </div>
        </div>

        <button
          onClick={() => {
            const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true })
            document.dispatchEvent(event)
          }}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '7px 10px', borderRadius: '8px',
            background: 'rgba(75,163,217,0.06)',
            border: '1px solid rgba(75,163,217,0.12)',
            cursor: 'pointer', color: '#4A5580', fontSize: '12px',
          }}>
          <span style={{fontSize: '13px'}}>🔍</span>
          <span style={{flex: 1, textAlign: 'left'}}>Buscar...</span>
          <kbd style={{
            background: 'rgba(75,163,217,0.08)', border: '1px solid rgba(75,163,217,0.15)',
            borderRadius: '4px', padding: '1px 5px', fontSize: '10px', color: '#4A5580',
          }}>⌘K</kbd>
        </button>
      </div>

      <nav style={{flex: 1, padding: '8px', overflowY: 'auto'}}>
        {navSections.map((section) => (
          <div key={section.label} style={{marginBottom: '4px'}}>
            <div style={{
              color: '#1E2A5E',
              fontSize: '10px', fontWeight: '700',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              padding: '8px 8px 4px',
            }}>
              {section.label}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <a key={item.href} href={item.href} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '7px 8px', borderRadius: '7px',
                  marginBottom: '1px',
                  fontSize: '13px', textDecoration: 'none',
                  transition: 'all 120ms ease',
                  backgroundColor: isActive ? 'rgba(75,163,217,0.12)' : 'transparent',
                  color: isActive ? '#4BA3D9' : '#3A4A70',
                  fontWeight: isActive ? '600' : '400',
                  borderLeft: isActive ? '2px solid #4BA3D9' : '2px solid transparent',
                }}>
                  <span style={{fontSize: '14px', opacity: isActive ? 1 : 0.5}}>{item.icon}</span>
                  <span style={{flex: 1}}>{item.label}</span>
                  {item.badge && unread > 0 && (
                    <span style={{
                      backgroundColor: '#4BA3D9', color: 'white',
                      fontSize: '10px', fontWeight: '700',
                      padding: '1px 5px', borderRadius: '8px',
                    }}>
                      {unread}
                    </span>
                  )}
                </a>
              )
            })}
          </div>
        ))}
      </nav>

      <div style={{padding: '8px', borderTop: '1px solid rgba(75,163,217,0.08)'}}>
        <a href="/settings" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '7px 8px', borderRadius: '7px',
          fontSize: '13px', textDecoration: 'none',
          color: pathname === '/settings' ? '#4BA3D9' : '#3A4A70',
          backgroundColor: pathname === '/settings' ? 'rgba(75,163,217,0.12)' : 'transparent',
          marginBottom: '4px',
          borderLeft: pathname === '/settings' ? '2px solid #4BA3D9' : '2px solid transparent',
        }}>
          <span style={{fontSize: '14px', opacity: 0.5}}>⚙️</span>
          Configuración
        </a>

        <div style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 8px', marginBottom: '4px'}}>
          <div style={{
            width: '26px', height: '26px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #1E2A5E, #4BA3D9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: '700', color: 'white', flexShrink: 0,
          }}>
            AC
          </div>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{color: '#CDD0E0', fontSize: '12px', fontWeight: '500'}}>Aaron Cortés</div>
            <div style={{color: '#3A4A70', fontSize: '10px'}}>Director</div>
          </div>
        </div>

        <button onClick={handleLogout} style={{
          width: '100%', padding: '7px 8px', borderRadius: '7px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: '#3A4A70', fontSize: '12px', textAlign: 'left',
          transition: 'all 150ms', display: 'flex', alignItems: 'center', gap: '8px',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = '#FF4D4D'; e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#3A4A70'; e.currentTarget.style.backgroundColor = 'transparent' }}>
          <span>↪</span> Cerrar sesión
        </button>
      </div>
    </aside>
  )
}