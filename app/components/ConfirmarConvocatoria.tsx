'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function ConfirmarConvocatoria({ convocatoriaId, athleteId, initial }: { convocatoriaId: string, athleteId: string, initial: string | null }) {
  const [status, setStatus] = useState<string | null>(initial)
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  async function respond(val: 'confirmed' | 'declined') {
    setLoading(true)
    await supabase.from('convocatoria_confirmations').upsert({
      convocatoria_id: convocatoriaId,
      athlete_id: athleteId,
      status: val,
    }, { onConflict: 'convocatoria_id,athlete_id' })
    setStatus(val)
    setLoading(false)
  }

  if (status === 'confirmed') return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      <span style={{ color: '#10B981', fontSize: '12px', fontWeight: '600' }}>✓ Confirmado</span>
      <button onClick={() => respond('declined')} style={{ color: '#3A4A70', fontSize: '11px', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Declinar</button>
    </div>
  )

  if (status === 'declined') return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      <span style={{ color: '#EF4444', fontSize: '12px', fontWeight: '600' }}>✗ Declinado</span>
      <button onClick={() => respond('confirmed')} style={{ color: '#3A4A70', fontSize: '11px', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Confirmar</button>
    </div>
  )

  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      <button onClick={() => respond('confirmed')} disabled={loading} style={{ padding: '5px 12px', borderRadius: '8px', backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
        Confirmar
      </button>
      <button onClick={() => respond('declined')} disabled={loading} style={{ padding: '5px 12px', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#EF4444', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
        Declinar
      </button>
    </div>
  )
}
