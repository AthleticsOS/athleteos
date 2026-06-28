'use client'

import { usePathname } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'

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
      { href: '/competitions', icon: '🏆', label: 'Competiciones' },
      { href: '/ranking', icon: '📊', label: 'Ranking' },
    ]
  },
  {
    label: 'Administración',
    items: [
      { href: '/finances', icon: '💶', label: 'Finanzas' },
      { href: '/communication', icon: '📢', label: 'Comunicación' },
    ]
  },
  {
    label: 'Inteligencia',
    items: [
      { href: '/ai', icon: '🧠', label: 'Asistente IA' },
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
      backgroundColor: '#0C0C0C',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column',
      zIndex: 50,
    }}>
      <div style={{padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <div style={{
            width: '30px', height: '30px',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(99,102,241,0.4)',
          }}>
            <span style={{color: 'white', fontSize: '13px', fontWeight: '700'}}>A</span>
          </div>
          <div>
            <div style={{color: '#F0F0F0', fontSize: '13px', fontWeight: '600', letterSpacing: '-0.01em'}}>AthleteOS</div>
            <div style={{color: '#444', fontSize: '11px', marginTop: '1px'}}>WeAthletics</div>
          </div>
        </div>

        <button
          onClick={() => {
            const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true })
            document.dispatchEvent(event)
          }}
          style={{
            width: '100%', marginTop: '10px',
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '7px 10px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer', color: '#555', fontSize: '12px',
          }}>
          <span style={{fontSize: '13px'}}>🔍</span>
          <span style={{flex: 1, textAlign: 'left'}}>Buscar...</span>
          <kbd style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '4px', padding: '1px 5px', fontSize: '10px', color: '#444',
          }}>⌘K</kbd>
        </button>
      </div>

      <nav style={{flex: 1, padding: '8px', overflowY: 'auto'}}>
        {navSections.map((section) => (
          <div key={section.label} style={{marginBottom: '4px'}}>
            <div style={{
              color: '#2A2A2A', fontSize: '10px', fontWeight: '600',
              textTransform: 'uppercase', letterSpacing: '0.08em',
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
                  backgroundColor: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: isActive ? '#A5B4FC' : '#4A4A4A',
                  fontWeight: isActive ? '500' : '400',
                  borderLeft: isActive ? '2px solid #6366F1' : '2px solid transparent',
                }}>
                  <span style={{fontSize: '14px', opacity: isActive ? 1 : 0.6}}>{item.icon}</span>
                  <span style={{flex: 1}}>{item.label}</span>
                  {item.badge && unread > 0 && (
                    <span style={{
                      backgroundColor: '#EF4444', color: 'white',
                      fontSize: '10px', fontWeight: '700',
                      padding: '1px 5px', borderRadius: '8px',
                      minWidth: '16px', textAlign: 'center',
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

      <div style={{padding: '8px', borderTop: '1px solid rgba(255,255,255,0.05)'}}>
        <a href="/settings" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '7px 8px', borderRadius: '7px',
          fontSize: '13px', textDecoration: 'none',
          color: pathname === '/settings' ? '#A5B4FC' : '#4A4A4A',
          backgroundColor: pathname === '/settings' ? 'rgba(99,102,241,0.15)' : 'transparent',
          marginBottom: '4px',
          borderLeft: pathname === '/settings' ? '2px solid #6366F1' : '2px solid transparent',
        }}>
          <span style={{fontSize: '14px', opacity: 0.6}}>⚙️</span>
          Configuración
        </a>

        <div style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 8px', marginBottom: '4px'}}>
          <div style={{
            width: '26px', height: '26px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: '700', color: 'white', flexShrink: 0,
          }}>
            AC
          </div>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{color: '#CCC', fontSize: '12px', fontWeight: '500'}}>Aaron Cortés</div>
            <div style={{color: '#444', fontSize: '10px'}}>Director</div>
          </div>
        </div>

        <button onClick={handleLogout} style={{
          width: '100%', padding: '7px 8px', borderRadius: '7px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: '#333', fontSize: '12px', textAlign: 'left',
          transition: 'all 150ms', display: 'flex', alignItems: 'center', gap: '8px',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#333'; e.currentTarget.style.backgroundColor = 'transparent' }}>
          <span>↪</span> Cerrar sesión
        </button>
      </div>
    </aside>
  )
}