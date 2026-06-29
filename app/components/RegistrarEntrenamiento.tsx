'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function RegistrarEntrenamiento({ athleteId }: { athleteId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [exercise, setExercise] = useState('')
  const [series, setSeries] = useState('')
  const [times, setTimes] = useState('')
  const [effort, setEffort] = useState('7')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSubmit() {
    if (!exercise) return
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('athlete_sessions').insert({
      athlete_id: athleteId,
      date: today,
      exercise,
      series: series ? parseInt(series) : null,
      times,
      effort: parseInt(effort),
    })
    setLoading(false)
    setDone(true)
    setOpen(false)
  }

  if (done) return (
    <div style={{ backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '14px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
      <div style={{ fontSize: '28px' }}>✅</div>
      <div>
        <div style={{ color: '#10B981', fontSize: '15px', fontWeight: '700' }}>Entrenamiento registrado</div>
        <div style={{ color: '#3A5A4A', fontSize: '12px', marginTop: '2px' }}>Tu entrenador puede ver tu actividad de hoy</div>
      </div>
    </div>
  )

  return (
    <div>
      {!open ? (
        <button onClick={() => setOpen(true)} style={{
          width: '100%', padding: '16px 20px', borderRadius: '14px',
          background: 'linear-gradient(135deg, #1E2A5E, #4BA3D9)',
          border: 'none', cursor: 'pointer', color: 'white',
          fontSize: '15px', fontWeight: '700', letterSpacing: '0.01em',
          boxShadow: '0 4px 24px rgba(75,163,217,0.2)',
        }}>
          + Registrar entrenamiento de hoy
        </button>
      ) : (
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.2)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ color: '#CDD0E0', fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>Registrar entrenamiento de hoy</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Ejercicio / Descripción *</label>
              <input value={exercise} onChange={e => setExercise(e.target.value)} placeholder="Ej: 6×200m, Técnica de carrera..." style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Series</label>
                <input value={series} onChange={e => setSeries(e.target.value)} type="number" placeholder="6" style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Tiempos</label>
                <input value={times} onChange={e => setTimes(e.target.value)} placeholder="25.1, 25.3, 25.0..." style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div>
              <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Esfuerzo percibido: <span style={{ color: '#4BA3D9' }}>{effort}/10</span></label>
              <input type="range" min="1" max="10" value={effort} onChange={e => setEffort(e.target.value)} style={{ width: '100%', accentColor: '#4BA3D9' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2A3550', fontSize: '10px', marginTop: '4px' }}>
                <span>Suave</span><span>Moderado</span><span>Máximo</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button onClick={() => setOpen(false)} style={{ flex: 1, padding: '11px', borderRadius: '9px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#888', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSubmit} disabled={loading || !exercise} style={{ flex: 2, padding: '11px', borderRadius: '9px', background: loading || !exercise ? 'rgba(75,163,217,0.2)' : 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', border: 'none', color: 'white', fontSize: '13px', fontWeight: '700', cursor: loading || !exercise ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Guardando...' : 'Guardar entrenamiento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
