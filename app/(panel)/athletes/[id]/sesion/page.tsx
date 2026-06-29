'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Props = { params: Promise<{ id: string }> }

export default function NuevaSesion({ params }: Props) {
  const [athleteId, setAthleteId] = useState('')
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    exercise: '',
    times: '',
    average: '',
    effort: 7,
    notes: '',
    target_distance: '',
    target_percentage: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useState(() => { params.then(({ id }) => setAthleteId(id)) })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    if (!form.exercise || !form.date) {
      setMessage('El ejercicio y la fecha son obligatorios')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('athlete_sessions').insert([{
      ...form,
      athlete_id: athleteId,
      effort: Number(form.effort),
      target_distance: form.target_distance ? Number(form.target_distance) : null,
      target_percentage: form.target_percentage ? Number(form.target_percentage) : null,
    }])
    if (error) setMessage('Error al guardar.')
    else window.location.href = `/athletes/${athleteId}`
    setLoading(false)
  }

  return (
    <main style={{minHeight:'100vh', backgroundColor:'#06080F', padding:'32px 36px'}}>
      <div style={{maxWidth:'600px', margin:'0 auto'}}>
        <a href={`/athletes/${athleteId}`} style={{color:'#3A4A70', fontSize:'13px'}}>← Perfil</a>
        <h1 style={{fontSize:'22px', fontWeight:'700', color:'#F0F4FF', letterSpacing:'-0.02em', margin:'8px 0 28px'}}>
          Nueva sesión de entrenamiento
        </h1>

        <div style={{backgroundColor:'#0A0E1A', border:'1px solid rgba(75,163,217,0.12)', borderRadius:'16px', padding:'24px', display:'flex', flexDirection:'column', gap:'18px'}}>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px'}}>
            <div>
              <label style={{color:'#3A4A70', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:'8px'}}>Fecha</label>
              <input name="date" type="date" value={form.date} onChange={handleChange}
                style={{width:'100%', backgroundColor:'rgba(75,163,217,0.05)', border:'1px solid rgba(75,163,217,0.15)', borderRadius:'10px', padding:'10px 14px', color:'#E8EAF0', fontSize:'14px', outline:'none'}} />
            </div>
            <div>
              <label style={{color:'#3A4A70', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:'8px'}}>
                Nivel de esfuerzo: <span style={{color:'#4BA3D9'}}>{form.effort}/10</span>
              </label>
              <input name="effort" type="range" min="1" max="10" value={form.effort}
                onChange={e => setForm({...form, effort: Number(e.target.value)})}
                style={{width:'100%', accentColor:'#4BA3D9'}} />
            </div>
          </div>

          <div>
            <label style={{color:'#3A4A70', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:'8px'}}>Ejercicio / Series</label>
            <input name="exercise" value={form.exercise} onChange={handleChange}
              placeholder="Ej: 6*150 Fartlek (80%) / 5*40 (85-90%) / Cuestas de arena *6"
              style={{width:'100%', backgroundColor:'rgba(75,163,217,0.05)', border:'1px solid rgba(75,163,217,0.15)', borderRadius:'10px', padding:'10px 14px', color:'#E8EAF0', fontSize:'14px', outline:'none'}} />
          </div>

          <div>
            <label style={{color:'#3A4A70', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:'8px'}}>Tiempos de cada serie</label>
            <input name="times" value={form.times} onChange={handleChange}
              placeholder="Ej: 24/23/23/22/21/22"
              style={{width:'100%', backgroundColor:'rgba(75,163,217,0.05)', border:'1px solid rgba(75,163,217,0.15)', borderRadius:'10px', padding:'10px 14px', color:'#E8EAF0', fontSize:'14px', fontFamily:'monospace', outline:'none'}} />
            <p style={{color:'#2A3550', fontSize:'11px', marginTop:'5px'}}>Separa los tiempos con / igual que en el Excel</p>
          </div>

          <div>
            <label style={{color:'#3A4A70', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:'8px'}}>Media</label>
            <input name="average" value={form.average} onChange={handleChange}
              placeholder="Ej: 22,5"
              style={{width:'100%', backgroundColor:'rgba(75,163,217,0.05)', border:'1px solid rgba(75,163,217,0.15)', borderRadius:'10px', padding:'10px 14px', color:'#E8EAF0', fontSize:'14px', fontFamily:'monospace', outline:'none'}} />
          </div>

          <div>
            <label style={{color:'#3A4A70', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:'8px'}}>Notas</label>
            <textarea name="notes" value={form.notes} onChange={handleChange}
              placeholder="Observaciones, sensaciones, condiciones..."
              rows={3}
              style={{width:'100%', backgroundColor:'rgba(75,163,217,0.05)', border:'1px solid rgba(75,163,217,0.15)', borderRadius:'10px', padding:'10px 14px', color:'#E8EAF0', fontSize:'14px', resize:'none', outline:'none'}} />
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px'}}>
            <div>
              <label style={{color:'#3A4A70', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:'8px'}}>Distancia objetivo (m)</label>
              <input name="target_distance" value={form.target_distance} onChange={handleChange}
                placeholder="Ej: 200"
                style={{width:'100%', backgroundColor:'rgba(75,163,217,0.05)', border:'1px solid rgba(75,163,217,0.15)', borderRadius:'10px', padding:'10px 14px', color:'#E8EAF0', fontSize:'14px', fontFamily:'monospace', outline:'none'}} />
              <p style={{color:'#2A3550', fontSize:'11px', marginTop:'4px'}}>20, 30, 60, 100, 150, 200...</p>
            </div>
            <div>
              <label style={{color:'#3A4A70', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:'8px'}}>Porcentaje (%)</label>
              <input name="target_percentage" value={form.target_percentage} onChange={handleChange}
                placeholder="Ej: 85"
                style={{width:'100%', backgroundColor:'rgba(75,163,217,0.05)', border:'1px solid rgba(75,163,217,0.15)', borderRadius:'10px', padding:'10px 14px', color:'#E8EAF0', fontSize:'14px', fontFamily:'monospace', outline:'none'}} />
              <p style={{color:'#2A3550', fontSize:'11px', marginTop:'4px'}}>80%, 85%, 90%, 95%...</p>
            </div>
          </div>

          {message && <p style={{color:'#EF4444', fontSize:'13px'}}>{message}</p>}

          <button onClick={handleSubmit} disabled={loading} style={{
            padding:'12px', borderRadius:'10px', fontSize:'14px', fontWeight:'700',
            background: loading ? 'rgba(75,163,217,0.3)' : 'linear-gradient(135deg,#1E2A5E,#4BA3D9)',
            color:'#E8EAF0', border:'none', cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 0 20px rgba(75,163,217,0.3)',
          }}>
            {loading ? 'Guardando...' : 'Guardar sesión'}
          </button>
        </div>
      </div>
    </main>
  )
}