'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Props = { params: Promise<{ id: string }> }

export default function NuevoTest({ params }: Props) {
  const [athleteId, setAthleteId] = useState('')
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weight_kg: '', fat_pct: '', muscle_kg: '',
    jump_horizontal: '', cmj_arms: '',
    sprint_20m: '', sprint_30m: '', sprint_40m: '',
    sprint_60m: '', sprint_100m: '', sprint_150m: '', sprint_200m: '',
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
    const toNum = (v: string) => v ? Number(v.replace(',', '.')) : null
    const { error } = await supabase.from('athlete_tests').insert([{
      athlete_id: athleteId, date: form.date,
      weight_kg: toNum(form.weight_kg), fat_pct: toNum(form.fat_pct), muscle_kg: toNum(form.muscle_kg),
      jump_horizontal: toNum(form.jump_horizontal), cmj_arms: toNum(form.cmj_arms),
      sprint_20m: toNum(form.sprint_20m), sprint_30m: toNum(form.sprint_30m),
      sprint_40m: toNum(form.sprint_40m), sprint_60m: toNum(form.sprint_60m),
      sprint_100m: toNum(form.sprint_100m), sprint_150m: toNum(form.sprint_150m),
      sprint_200m: toNum(form.sprint_200m), notes: form.notes,
    }])
    if (error) setMessage('Error al guardar.')
    else window.location.href = `/athletes/${athleteId}`
    setLoading(false)
  }

  const sections = [
    {
      title: 'Composición corporal',
      fields: [
        { name: 'weight_kg', label: 'Peso (kg)' },
        { name: 'fat_pct', label: 'Grasa (%)' },
        { name: 'muscle_kg', label: 'Músculo (kg)' },
      ]
    },
    {
      title: 'Saltos',
      fields: [
        { name: 'jump_horizontal', label: 'Salto horizontal (m)' },
        { name: 'cmj_arms', label: 'CMJ con brazos (cm)' },
      ]
    },
    {
      title: 'Sprints (segundos)',
      fields: [
        { name: 'sprint_20m', label: '20m' },
        { name: 'sprint_30m', label: '30m' },
        { name: 'sprint_40m', label: '40m' },
        { name: 'sprint_60m', label: '60m' },
        { name: 'sprint_100m', label: '100m' },
        { name: 'sprint_150m', label: '150m' },
        { name: 'sprint_200m', label: '200m' },
      ]
    },
  ]

  return (
    <main style={{minHeight:'100vh', backgroundColor:'#080808', padding:'32px 36px'}}>
      <div style={{maxWidth:'700px', margin:'0 auto'}}>
        <a href={`/athletes/${athleteId}`} style={{color:'#444', fontSize:'13px'}}>← Perfil</a>
        <h1 style={{fontSize:'22px', fontWeight:'700', color:'#F0F0F0', letterSpacing:'-0.02em', margin:'8px 0 28px'}}>
          Test físico
        </h1>

        <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
          <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'20px'}}>
            <label style={{color:'#444', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:'8px'}}>Fecha</label>
            <input name="date" type="date" value={form.date} onChange={handleChange}
              style={{width:'200px', backgroundColor:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'10px 14px', color:'white', fontSize:'14px', outline:'none'}} />
          </div>

          {sections.map(section => (
            <div key={section.title} style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'20px'}}>
              <p style={{color:'#888', fontSize:'13px', fontWeight:'600', margin:'0 0 14px'}}>{section.title}</p>
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:'12px'}}>
                {section.fields.map(field => (
                  <div key={field.name}>
                    <label style={{color:'#444', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:'6px'}}>{field.label}</label>
                    <input
                      name={field.name}
                      value={(form as any)[field.name]}
                      onChange={handleChange}
                      placeholder="—"
                      style={{width:'100%', backgroundColor:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'9px', padding:'9px 12px', color:'white', fontSize:'14px', fontFamily:'monospace', outline:'none'}} />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'20px'}}>
            <label style={{color:'#444', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:'8px'}}>Notas</label>
            <textarea name="notes" value={form.notes} onChange={handleChange}
              placeholder="Observaciones del test..."
              rows={2}
              style={{width:'100%', backgroundColor:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'10px 14px', color:'white', fontSize:'14px', resize:'none', outline:'none'}} />
          </div>

          {message && <p style={{color:'#EF4444', fontSize:'13px'}}>{message}</p>}

          <button onClick={handleSubmit} disabled={loading} style={{
            padding:'13px', borderRadius:'10px', fontSize:'14px', fontWeight:'700',
            background: loading ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            color:'white', border:'none', cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 0 20px rgba(99,102,241,0.3)',
          }}>
            {loading ? 'Guardando...' : 'Guardar test'}
          </button>
        </div>
      </div>
    </main>
  )
}