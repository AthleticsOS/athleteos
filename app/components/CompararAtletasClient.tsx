'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Athlete = { id: string, first_name: string, last_name: string, category: string | null, sport: string | null }
type Stats = { sessions: number, avgEffort: number, competitions: number, records: number, lastSession: string | null }

export default function CompararAtletasClient({ athletes }: { athletes: Athlete[] }) {
  const [idA, setIdA] = useState('')
  const [idB, setIdB] = useState('')
  const [statsA, setStatsA] = useState<Stats | null>(null)
  const [statsB, setStatsB] = useState<Stats | null>(null)
  const [recordsA, setRecordsA] = useState<any[]>([])
  const [recordsB, setRecordsB] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  async function fetchStats(id: string): Promise<{ stats: Stats, records: any[] }> {
    const [{ data: sessions }, { data: results }, { data: records }] = await Promise.all([
      supabase.from('athlete_sessions').select('effort, date').eq('athlete_id', id).order('date', { ascending: false }),
      supabase.from('competition_results').select('id').eq('athlete_id', id),
      supabase.from('personal_records').select('discipline, mark, date').eq('athlete_id', id).order('date', { ascending: false }),
    ])
    const avgEffort = sessions && sessions.length > 0
      ? sessions.reduce((s, x) => s + (x.effort || 0), 0) / sessions.length
      : 0
    return {
      stats: {
        sessions: sessions?.length || 0,
        avgEffort: Math.round(avgEffort * 10) / 10,
        competitions: results?.length || 0,
        records: records?.length || 0,
        lastSession: sessions?.[0]?.date || null,
      },
      records: records || [],
    }
  }

  async function handleComparar() {
    if (!idA || !idB) return
    setLoading(true)
    const [a, b] = await Promise.all([fetchStats(idA), fetchStats(idB)])
    setStatsA(a.stats); setRecordsA(a.records)
    setStatsB(b.stats); setRecordsB(b.records)
    setLoading(false)
  }

  const athA = athletes.find(a => a.id === idA)
  const athB = athletes.find(a => a.id === idB)

  const selectStyle = { width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', colorScheme: 'dark' } as React.CSSProperties

  function StatBar({ labelA, valA, valB, labelB, unit = '' }: { labelA: string, valA: number, valB: number, labelB: string, unit?: string }) {
    const max = Math.max(valA, valB, 1)
    const pctA = (valA / max) * 100
    const pctB = (valB / max) * 100
    const winnerA = valA >= valB
    return (
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ color: winnerA ? '#4BA3D9' : '#3A4A70', fontSize: '16px', fontWeight: '800' }}>{valA}{unit}</span>
          <span style={{ color: '#2A3550', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{labelA}</span>
          <span style={{ color: !winnerA ? '#F59E0B' : '#3A4A70', fontSize: '16px', fontWeight: '800' }}>{valB}{unit}</span>
        </div>
        <div style={{ position: 'relative', height: '6px', display: 'flex', gap: '2px' }}>
          <div style={{ flex: 1, backgroundColor: 'rgba(75,163,217,0.08)', borderRadius: '4px', overflow: 'hidden', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: `${pctA}%`, height: '100%', backgroundColor: winnerA ? '#4BA3D9' : '#1E2A5E', borderRadius: '4px', transition: 'width 500ms' }} />
          </div>
          <div style={{ flex: 1, backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${pctB}%`, height: '100%', backgroundColor: !winnerA ? '#F59E0B' : '#7C4A00', borderRadius: '4px', transition: 'width 500ms' }} />
          </div>
        </div>
      </div>
    )
  }

  // Disciplinas comunes para comparar marcas
  const allDisciplines = [...new Set([...recordsA.map(r => r.discipline), ...recordsB.map(r => r.discipline)])]

  return (
    <div>
      {/* Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'end', marginBottom: '24px' }}>
        <div>
          <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Atleta A</label>
          <select value={idA} onChange={e => setIdA(e.target.value)} style={selectStyle}>
            <option value="">Seleccionar...</option>
            {athletes.filter(a => a.id !== idB).map(a => <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>)}
          </select>
        </div>
        <div style={{ color: '#2A3550', fontSize: '18px', fontWeight: '800', paddingBottom: '10px' }}>vs</div>
        <div>
          <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Atleta B</label>
          <select value={idB} onChange={e => setIdB(e.target.value)} style={selectStyle}>
            <option value="">Seleccionar...</option>
            {athletes.filter(a => a.id !== idA).map(a => <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>)}
          </select>
        </div>
      </div>
      <button onClick={handleComparar} disabled={!idA || !idB || loading} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: idA && idB ? 'linear-gradient(135deg,#1E2A5E,#4BA3D9)' : 'rgba(75,163,217,0.1)', border: 'none', color: 'white', fontSize: '14px', fontWeight: '700', cursor: idA && idB ? 'pointer' : 'not-allowed', marginBottom: '24px' }}>
        {loading ? 'Cargando...' : 'Comparar'}
      </button>

      {statsA && statsB && athA && athB && (
        <div>
          {/* Cabeceras */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            {[{ ath: athA, color: '#4BA3D9' }, { ath: athB, color: '#F59E0B' }].map(({ ath, color }) => (
              <div key={ath.id} style={{ backgroundColor: '#0A0E1A', border: `1px solid ${color}30`, borderRadius: '14px', padding: '16px 18px', borderTop: `3px solid ${color}` }}>
                <div style={{ color: '#F0F4FF', fontSize: '16px', fontWeight: '800' }}>{ath.first_name} {ath.last_name}</div>
                <div style={{ color: '#3A4A70', fontSize: '12px', marginTop: '2px' }}>{ath.category} · {ath.sport}</div>
              </div>
            ))}
          </div>

          {/* Estadísticas comparadas */}
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', marginBottom: '18px' }}>Comparativa de estadísticas</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#4BA3D9', fontSize: '12px', fontWeight: '700' }}>{athA.first_name}</span>
              <span style={{ color: '#F59E0B', fontSize: '12px', fontWeight: '700' }}>{athB.first_name}</span>
            </div>
            <StatBar labelA="Sesiones" valA={statsA.sessions} valB={statsB.sessions} labelB="Sesiones" />
            <StatBar labelA="Competiciones" valA={statsA.competitions} valB={statsB.competitions} labelB="Competiciones" />
            <StatBar labelA="Marcas pers." valA={statsA.records} valB={statsB.records} labelB="Marcas pers." />
            <StatBar labelA="Esfuerzo medio" valA={statsA.avgEffort} valB={statsB.avgEffort} labelB="Esfuerzo medio" unit="/10" />
          </div>

          {/* Marcas por prueba */}
          {allDisciplines.length > 0 && (
            <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
                <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>Marcas personales por prueba</p>
              </div>
              {allDisciplines.map(disc => {
                const mA = recordsA.find(r => r.discipline === disc)?.mark
                const mB = recordsB.find(r => r.discipline === disc)?.mark
                return (
                  <div key={disc} style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ color: mA ? '#4BA3D9' : '#2A3550', fontSize: '14px', fontWeight: '700', fontFamily: 'monospace', textAlign: 'right' }}>{mA || '—'}</div>
                    <div style={{ color: '#3A4A70', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', minWidth: '80px' }}>{disc}</div>
                    <div style={{ color: mB ? '#F59E0B' : '#2A3550', fontSize: '14px', fontWeight: '700', fontFamily: 'monospace' }}>{mB || '—'}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
