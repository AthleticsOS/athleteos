'use client'

import { createBrowserClient } from '@supabase/ssr'

export default function LogoutButton() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <button onClick={handleLogout} style={{
      padding:'6px 14px', borderRadius:'8px',
      background:'transparent', border:'1px solid rgba(255,255,255,0.08)',
      cursor:'pointer', color:'#444', fontSize:'12px', fontWeight:'500',
      transition:'all 150ms',
    }}
      onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
      onMouseLeave={e => { e.currentTarget.style.color = '#444'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}>
      Cerrar sesión
    </button>
  )
}