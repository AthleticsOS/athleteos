'use client'

import { useState } from 'react'

type Tab = 'inicio' | 'bienestar' | 'entrenos' | 'competiciones' | 'mensajes'

interface Props {
  tabs: {
    inicio: React.ReactNode
    bienestar: React.ReactNode
    entrenos: React.ReactNode
    competiciones: React.ReactNode
    mensajes: React.ReactNode
  }
  unreadMessages: number
  pendingConvocatorias: number
}

export default function AthletePortalTabs({ tabs, unreadMessages, pendingConvocatorias }: Props) {
  const [active, setActive] = useState<Tab>('inicio')

  const nav: { id: Tab; label: string; icon: string }[] = [
    { id: 'inicio', label: 'Inicio', icon: '⊞' },
    { id: 'bienestar', label: 'Bienestar', icon: '💙' },
    { id: 'entrenos', label: 'Entrenos', icon: '🏃' },
    { id: 'competiciones', label: 'Competiciones', icon: '🏆' },
    { id: 'mensajes', label: 'Mensajes', icon: '💬' },
  ]

  return (
    <>
      {/* Contenido */}
      <div style={{ paddingBottom: '76px' }}>
        {tabs[active]}
      </div>

      {/* Barra inferior */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        backgroundColor: '#070B18',
        borderTop: '1px solid rgba(75,163,217,0.1)',
        display: 'flex',
        backdropFilter: 'blur(16px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {nav.map(item => {
          const isActive = active === item.id
          const badge = item.id === 'mensajes' ? unreadMessages : item.id === 'competiciones' ? pendingConvocatorias : 0
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              style={{
                flex: 1, padding: '10px 4px 8px', border: 'none', background: 'none',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                position: 'relative',
              }}
            >
              <span style={{ fontSize: '20px', lineHeight: 1 }}>{item.icon}</span>
              <span style={{
                fontSize: '10px', fontWeight: isActive ? '700' : '500',
                color: isActive ? '#4BA3D9' : '#3A4A70',
                transition: 'color 150ms',
              }}>
                {item.label}
              </span>
              {isActive && (
                <div style={{
                  position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                  width: '20px', height: '2px', borderRadius: '1px', backgroundColor: '#4BA3D9',
                }} />
              )}
              {badge > 0 && (
                <div style={{
                  position: 'absolute', top: '6px', right: 'calc(50% - 14px)',
                  backgroundColor: '#EF4444', color: 'white', fontSize: '9px', fontWeight: '800',
                  borderRadius: '10px', minWidth: '16px', height: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
                }}>
                  {badge}
                </div>
              )}
            </button>
          )
        })}
      </nav>
    </>
  )
}
