'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Props = { params: Promise<{ id: string }> }

export default function NuevasPesas({ params }: Props) {
  const [athleteId, setAthleteId] = useState('')
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    sentadilla: '',
    hip_thrust: '',
    peso_muerto: '',
    press_banca: '',
    cargada: '',
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
    setLoading(true)
    const { error } = await supabase.from('athlete_weights').insert([{
      athlete_id: athleteId,
      date: form.date,
      sentadilla: form.sentadilla ? Number(form.sentadilla) : null,
      hip_thrust: form.hip_thrust ? Number(form.hip_thrust) : null,
      peso_muerto: form.peso_muerto ? Number(form.peso_muerto) : null,
      press_banca: form.press_banca ? Number(form.press_banca) : null,
      cargada: form.cargada ? Number(form.cargada) : null,
      notes: form.notes,
    }])
    if (error) setMessage('Error al guardar.')
    else window.location.href = `/athletes/${athleteId}`
    setLoading(false)
  }

  const fields = [
    { name: 'sentadilla', label: 'Sentadilla (kg)' },
    { name: 'hip_thrust', label: 'Hip Thrust (kg)' },
    { name: 'peso_muerto', label: 'Peso Muerto (kg)' },
    { name: 'press_banca', label: 'Press Banca (kg)' },
    { name: 'cargada', label: 'Cargada (kg)' },
  ]

  return (
    <main style={{minHeight:'100vh', backgroundColor:'#080808', padding:'32px 36px'}}>
      <div style={{maxWidth:'600px', margin:'0 auto'}}>
        <a href={`/athletes/${athleteId}`} style={{color:'#444', fontSize:'13px'}}>← Perfil</a>
        <h1 style={{fontSize:'22px', fontWeight:'700', color:'#F0F0F0', letterSpacing:'-0.02em', margin:'8px 0 28px'}}>
          Registro de pesas
        </h1>

        <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'24px', display:'flex', flexDirection:'column', gap:'18px'}}>

          <div>
            <label style={{color:'#444', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:'8px'}}>Fecha</label>
            <input name="date" type="date" value={form.date} onChange={handleChange}
              style={{width:'100%', backgroundColor:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'10px 14px', color:'white', fontSize:'14px', outline:'none'}} />
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px'}}>
            {fields.map(field => (
              <div key={field.name}>
                <label style={{color:'#444', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:'8px'}}>{field.label}</label>
                <input
                  name={field.name}
                  type="number"
                  value={(form as any)[field.name]}
                  onChange={handleChange}
                  placeholder="0"
                  style={{width:'100%', backgroundColor:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'10px 14px', color:'white', fontSize:'14px', fontFamily:'monospace', outline:'none'}} />
              </div>
            ))}
          </div>

          <div>
            <label style={{color:'#444', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:'8px'}}>Notas</label>
            <textarea name="notes" value={form.notes} onChange={handleChange}
              placeholder="Observaciones..."
              rows={2}
              style={{width:'100%', backgroundColor:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'10px 14px', color:'white', fontSize:'14px', resize:'none', outline:'none'}} />
          </div>

          {message && <p style={{color:'#EF4444', fontSize:'13px'}}>{message}</p>}

          <button onClick={handleSubmit} disabled={loading} style={{
            padding:'12px', borderRadius:'10px', fontSize:'14px', fontWeight:'700',
            background: loading ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            color:'white', border:'none', cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 0 20px rgba(99,102,241,0.3)',
          }}>
            {loading ? 'Guardando...' : 'Guardar pesas'}
          </button>
        </div>
      </div>
    </main>
  )
}