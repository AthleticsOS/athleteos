'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function SeasonSelector({ current, seasons }: { current: string, seasons: string[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(season: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('season', season)
    router.push(`?${params.toString()}`)
  }

  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      <span style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '600', marginRight: '4px' }}>TEMPORADA</span>
      {seasons.map(s => (
        <button key={s} onClick={() => handleChange(s)} style={{
          padding: '4px 10px', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: 'none',
          backgroundColor: current === s ? '#4BA3D9' : 'rgba(75,163,217,0.08)',
          color: current === s ? 'white' : '#4BA3D9',
        }}>
          {s}
        </button>
      ))}
    </div>
  )
}
