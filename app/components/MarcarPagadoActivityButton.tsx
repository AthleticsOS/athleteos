'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function MarcarPagadoActivityButton({ paymentId, current }: { paymentId: string, current: string }) {
  const [status, setStatus] = useState(current)
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  async function toggle() {
    setLoading(true)
    const next = status === 'paid' ? 'pending' : 'paid'
    await supabase.from('activity_payments').update({ status: next }).eq('id', paymentId)
    setStatus(next)
    setLoading(false)
  }

  const isPaid = status === 'paid'

  return (
    <button onClick={toggle} disabled={loading} style={{
      padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', cursor: 'pointer', border: 'none',
      backgroundColor: isPaid ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
      color: isPaid ? '#10B981' : '#F59E0B',
      outline: `1px solid ${isPaid ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
      transition: 'all 150ms',
    }}>
      {loading ? '...' : isPaid ? 'Pagado' : 'Pendiente'}
    </button>
  )
}
