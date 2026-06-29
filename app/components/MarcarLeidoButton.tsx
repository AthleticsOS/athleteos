'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function MarcarLeidoButton({ notifId }: { notifId: string }) {
  const [done, setDone] = useState(false)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleClick() {
    await supabase.from('notifications').update({ read: true }).eq('id', notifId)
    setDone(true)
    window.location.reload()
  }

  if (done) return null
  return (
    <button onClick={handleClick} style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '600', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#3A4A70', cursor: 'pointer' }}>
      Leído
    </button>
  )
}
