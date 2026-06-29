'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function CerrarTemporadaButton({ currentSeason }: { currentSeason: string }) {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  function getNextSeason(season: string): string {
    const parts = season.split('-')
    if (parts.length === 2) {
      const y1 = parseInt(parts[0]) + 1
      const y2 = parseInt(parts[1]) + 1
      return `${y1}-${y2}`
    }
    return season
  }

  async function handleClose() {
    setLoading(true)
    const nextSeason = getNextSeason(currentSeason)
    await supabase.from('clubs').update({ season: nextSeason }).neq('id', '00000000-0000-0000-0000-000000000000')
    setDone(true)
    setLoading(false)
    setTimeout(() => window.location.reload(), 1500)
  }

  if (done) return (
    <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', fontSize: '13px' }}>
      ✓ Temporada cerrada. Iniciando {getNextSeason(currentSeason)}...
    </div>
  )

  if (!confirm) return (
    <button onClick={() => setConfirm(true)} style={{ padding: '7px 14px', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
      Cerrar temporada {currentSeason}
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <p style={{ color: '#F59E0B', fontSize: '12px', margin: 0 }}>
        ⚠ Esto cambiará la temporada activa a <strong>{getNextSeason(currentSeason)}</strong>. Los datos históricos de {currentSeason} se conservan.
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => setConfirm(false)} style={{ padding: '7px 14px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#888', fontSize: '12px', cursor: 'pointer' }}>Cancelar</button>
        <button onClick={handleClose} disabled={loading} style={{ padding: '7px 14px', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
          {loading ? 'Cerrando...' : 'Confirmar cierre'}
        </button>
      </div>
    </div>
  )
}
