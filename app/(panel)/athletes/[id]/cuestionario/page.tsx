'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Props = { params: Promise<{ id: string }> }

export default function Cuestionario({ params }: Props) {
  const [athleteId, setAthleteId] = useState('')
  const [athleteName, setAthleteName] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    profile: 'rendimiento',
    profile_coach: '',
    prueba_1: '', marca_actual_1: '', objetivo_1: '',
    prueba_2: '', marca_actual_2: '', objetivo_2: '',
    prueba_3: '', marca_actual_3: '', objetivo_3: '',
    objetivo_principal: '',
    objetivo_tecnico: '',
    objetivo_fisico: '',
    objetivo_psicologico: '',
    marca_objetivo_1: '', marca_objetivo_2: '', marca_objetivo_3: '',
    dias_entrenamiento: 5,
    horas_sueno: 8,
    cuida_alimentacion: 'Lo intento',
    nivel_exigencia: 'Alto',
    reunion_individual: false,
    notes: '',
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    params.then(async ({ id }) => {
      setAthleteId(id)
      const { data: athlete } = await supabase.from('athletes').select('first_name, last_name').eq('id', id).single()
      if (athlete) setAthleteName(`${athlete.first_name} ${athlete.last_name}`)
      const { data: existing } = await supabase.from('athlete_questionnaire').select('*').eq('athlete_id', id).single()
      if (existing) setForm(existing)
    })
  }, [params])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    setLoading(true)
    const { data: existing } = await supabase.from('athlete_questionnaire').select('id').eq('athlete_id', athleteId).single()
    if (existing) {
      await supabase.from('athlete_questionnaire').update({ ...form, updated_at: new Date().toISOString() }).eq('athlete_id', athleteId)
    } else {
      await supabase.from('athlete_questionnaire').insert([{ ...form, athlete_id: athleteId }])
    }
    setSaved(true)
    setLoading(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const sectionStyle = { backgroundColor: '#0E0E0E', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', marginBottom: '12px' }
  const labelStyle = { color: '#444', fontSize: '11px', fontWeight: '600' as const, textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'block' as const, marginBottom: '8px' }
  const inputStyle = { width: '100%', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 14px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }
  const selectStyle = { ...inputStyle }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#080808', padding: '32px 36px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        <div style={{ marginBottom: '28px' }}>
          <a href={`/athletes/${athleteId}`} style={{ color: '#444', fontSize: '13px' }}>← Perfil</a>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#F0F0F0', letterSpacing: '-0.02em', margin: '6px 0 4px' }}>
            Cuestionario inicial
          </h1>
          <p style={{ color: '#333', fontSize: '13px', margin: 0 }}>{athleteName}</p>
        </div>

        {/* Perfil */}
        <div style={sectionStyle}>
          <p style={{ color: '#888', fontSize: '14px', fontWeight: '600', margin: '0 0 16px' }}>Perfil del atleta</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Perfil según atleta</label>
              <select name="profile" value={form.profile} onChange={handleChange} style={selectStyle}>
                <option value="recreativo">Perfil 1 — Recreativo / Social</option>
                <option value="competidor">Perfil 2 — Competidor en desarrollo</option>
                <option value="rendimiento">Perfil 3 — Rendimiento / Alto compromiso</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Perfil según entrenador</label>
              <select name="profile_coach" value={form.profile_coach} onChange={handleChange} style={selectStyle}>
                <option value="">Sin asignar</option>
                <option value="recreativo">Perfil 1 — Recreativo / Social</option>
                <option value="competidor">Perfil 2 — Competidor en desarrollo</option>
                <option value="rendimiento">Perfil 3 — Rendimiento / Alto compromiso</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pruebas y objetivos */}
        <div style={sectionStyle}>
          <p style={{ color: '#888', fontSize: '14px', fontWeight: '600', margin: '0 0 16px' }}>Pruebas y marcas</p>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={labelStyle}>Prueba {n}</label>
                <input name={`prueba_${n}`} value={(form as any)[`prueba_${n}`]} onChange={handleChange} placeholder="100m lisos" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Marca actual</label>
                <input name={`marca_actual_${n}`} value={(form as any)[`marca_actual_${n}`]} onChange={handleChange} placeholder="11.20s" style={{ ...inputStyle, fontFamily: 'monospace' }} />
              </div>
              <div>
                <label style={labelStyle}>Objetivo</label>
                <input name={`objetivo_${n}`} value={(form as any)[`objetivo_${n}`]} onChange={handleChange} placeholder="10.90s" style={{ ...inputStyle, fontFamily: 'monospace' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Objetivos */}
        <div style={sectionStyle}>
          <p style={{ color: '#888', fontSize: '14px', fontWeight: '600', margin: '0 0 16px' }}>Objetivos de la temporada</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Objetivo principal</label>
              <textarea name="objetivo_principal" value={form.objetivo_principal} onChange={handleChange}
                placeholder="Ej: Ir a mi Campeonato de España y luchar por llegar a la final..."
                rows={2} style={{ ...inputStyle, resize: 'none' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Objetivo técnico</label>
                <textarea name="objetivo_tecnico" value={form.objetivo_tecnico} onChange={handleChange}
                  placeholder="Mejorar la salida..." rows={3} style={{ ...inputStyle, resize: 'none' }} />
              </div>
              <div>
                <label style={labelStyle}>Objetivo físico</label>
                <textarea name="objetivo_fisico" value={form.objetivo_fisico} onChange={handleChange}
                  placeholder="Fortalecer isquiotibiales..." rows={3} style={{ ...inputStyle, resize: 'none' }} />
              </div>
              <div>
                <label style={labelStyle}>Objetivo psicológico</label>
                <textarea name="objetivo_psicologico" value={form.objetivo_psicologico} onChange={handleChange}
                  placeholder="No ponerme tan nerviosa..." rows={3} style={{ ...inputStyle, resize: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {[1, 2, 3].map(n => (
                <div key={n}>
                  <label style={labelStyle}>Marca objetivo {n}</label>
                  <input name={`marca_objetivo_${n}`} value={(form as any)[`marca_objetivo_${n}`]} onChange={handleChange}
                    placeholder="10.90s" style={{ ...inputStyle, fontFamily: 'monospace' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Compromiso */}
        <div style={sectionStyle}>
          <p style={{ color: '#888', fontSize: '14px', fontWeight: '600', margin: '0 0 16px' }}>Compromiso</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>¿Cuántos días estás dispuesto a entrenar?</label>
              <input name="dias_entrenamiento" type="number" min="1" max="7" value={form.dias_entrenamiento} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Horas medias de sueño</label>
              <input name="horas_sueno" type="number" step="0.5" value={form.horas_sueno} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>¿Cuidas la alimentación?</label>
              <select name="cuida_alimentacion" value={form.cuida_alimentacion} onChange={handleChange} style={selectStyle}>
                <option>Sí, bastante</option>
                <option>Lo intento</option>
                <option>No demasiado</option>
                <option>No</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>¿Qué nivel de exigencia quieres?</label>
              <select name="nivel_exigencia" value={form.nivel_exigencia} onChange={handleChange} style={selectStyle}>
                <option>Máximo</option>
                <option>Alto</option>
                <option>Medio</option>
                <option>Normal</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" id="reunion" checked={form.reunion_individual}
              onChange={e => setForm({ ...form, reunion_individual: e.target.checked })}
              style={{ width: '16px', height: '16px', accentColor: '#6366F1' }} />
            <label htmlFor="reunion" style={{ color: '#888', fontSize: '13px' }}>
              Quiero tener una reunión individual con el entrenador
            </label>
          </div>
        </div>

        {/* Notas */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Notas adicionales</label>
          <textarea name="notes" value={form.notes} onChange={handleChange}
            placeholder="Cualquier cosa que quieras que sepa el entrenador..."
            rows={3} style={{ ...inputStyle, resize: 'none' }} />
        </div>

        {saved && (
          <div style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '12px', color: '#10B981', fontSize: '13px' }}>
            ✓ Cuestionario guardado correctamente
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: '100%', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: '700',
          background: loading ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg,#6366F1,#8B5CF6)',
          color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: loading ? 'none' : '0 0 20px rgba(99,102,241,0.3)',
        }}>
          {loading ? 'Guardando...' : 'Guardar cuestionario'}
        </button>

      </div>
    </main>
  )
}