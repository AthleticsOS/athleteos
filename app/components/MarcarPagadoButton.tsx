'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function MarcarPagadoButton({ paymentId }: { paymentId: string }) {
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleClick() {
    setLoading(true)
    await supabase.from('payments').update({ status: 'paid' }).eq('id', paymentId)
    setDone(true)
    setLoading(false)
    window.location.reload()
  }

  if (done) return <span style={{ color: '#10B981', fontSize: '11px', fontWeight: '600' }}>✓ Pagado</span>

  return (
    <button onClick={handleClick} disabled={loading} style={{
      padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
      backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
      color: '#10B981', cursor: loading ? 'not-allowed' : 'pointer',
    }}>
      {loading ? '...' : 'Marcar pagado'}
    </button>
  )
}
