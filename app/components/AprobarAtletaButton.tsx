'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function AprobarAtletaButton({ athleteId }: { athleteId: string }) {
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleApprove() {
    setLoading(true)
    await supabase.from('athletes').update({ status: 'active' }).eq('id', athleteId)
    setDone(true)
    setLoading(false)
    window.location.reload()
  }

  if (done) return <span style={{ color: '#10B981', fontSize: '12px', fontWeight: '600' }}>✓ Aprobado</span>

  return (
    <button onClick={handleApprove} disabled={loading} style={{ padding: '6px 14px', borderRadius: '8px', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
      {loading ? '...' : 'Aprobar'}
    </button>
  )
}
