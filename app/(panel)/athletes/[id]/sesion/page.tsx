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
    }])
    if (error) setMessage('Error al guardar.')
    else window.location.href = `/athletes/${athleteId}`
    setLoading(false)
  }

  return (
    <main style={{minHeight:'100vh', backgroundColor:'#080808', padding:'32px 36px'}}>
      <div style={{maxWidth:'600px', margin:'0 auto'}}>
        <a href={`/athletes/${athleteId}`} style={{color:'#444', fontSize:'13px'}}>← Perfil</a>
        <h1 style={{fontSize:'22px', fontWeight:'700', color:'#F0F0F0', letterSpacing:'-0.02em', margin:'8px 0 28px'}}>
          Nueva sesión de entrenamiento
        </h1>

        <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'24px', display:'flex', flexDirection:'column', gap:'18px'}}>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px'}}>
            <div>
              <label style={{color:'#444', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:'8px'}}>Fecha</label>
              <input name="date" type="date" value={form.date} onChange={handleChange}
                style={{width:'100%', backgroundColor:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'10px 14px', color:'white', fontSize:'14px', outline:'none'}} />
            </div>
            <div>
              <label style={{color:'#444', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:'8px'}}>
                Nivel de esfuerzo: <span style={{color:'#6366F1'}}>{form.effort}/10</span>
              </label>
              <input name="effort" type="range" min="1" max="10" value={form.effort}
                onChange={e => setForm({...form, effort: Number(e.target.value)})}
                style={{width:'100%', accentColor:'#6366F1'}} />
            </div>
          </div>

          <div>
            <label style={{color:'#444', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:'8px'}}>Ejercicio / Series</label>
            <input name="exercise" value={form.exercise} onChange={handleChange}
              placeholder="Ej: 6*150 Fartlek (80%) / 5*40 (85-90%) / Cuestas de arena *6"
              style={{width:'100%', backgroundColor:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'10px 14px', color:'white', fontSize:'14px', outline:'none'}} />
          </div>

          <div>
            <label style={{color:'#444', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:'8px'}}>Tiempos de cada serie</label>
            <input name="times" value={form.times} onChange={handleChange}
              placeholder="Ej: 24/23/23/22/21/22"
              style={{width:'100%', backgroundColor:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'10px 14px', color:'white', fontSize:'14px', fontFamily:'monospace', outline:'none'}} />
            <p style={{color:'#2A2A2A', fontSize:'11px', marginTop:'5px'}}>Separa los tiempos con / igual que en el Excel</p>
          </div>

          <div>
            <label style={{color:'#444', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:'8px'}}>Media</label>
            <input name="average" value={form.average} onChange={handleChange}
              placeholder="Ej: 22,5"
              style={{width:'100%', backgroundColor:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'10px 14px', color:'white', fontSize:'14px', fontFamily:'monospace', outline:'none'}} />
          </div>

          <div>
            <label style={{color:'#444', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:'8px'}}>Notas</label>
            <textarea name="notes" value={form.notes} onChange={handleChange}
              placeholder="Observaciones, sensaciones, condiciones..."
              rows={3}
              style={{width:'100%', backgroundColor:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'10px 14px', color:'white', fontSize:'14px', resize:'none', outline:'none'}} />
          </div>

          {message && <p style={{color:'#EF4444', fontSize:'13px'}}>{message}</p>}

          <button onClick={handleSubmit} disabled={loading} style={{
            padding:'12px', borderRadius:'10px', fontSize:'14px', fontWeight:'700',
            background: loading ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            color:'white', border:'none', cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 0 20px rgba(99,102,241,0.3)',
          }}>
            {loading ? 'Guardando...' : 'Guardar sesión'}
          </button>
        </div>
      </div>
    </main>
  )
}