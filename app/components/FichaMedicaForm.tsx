'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Props = {
  athleteId: string
  initial: any | null
}

export default function FichaMedicaForm({ athleteId, initial }: Props) {
  const [form, setForm] = useState({
    blood_type: initial?.blood_type || '',
    allergies: initial?.allergies || '',
    medications: initial?.medications || '',
    conditions: initial?.conditions || '',
    emergency_name: initial?.emergency_name || '',
    emergency_phone: initial?.emergency_phone || '',
    emergency_relation: initial?.emergency_relation || '',
    notes: initial?.notes || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const field = (label: string, key: keyof typeof form, placeholder?: string, multiline?: boolean) => (
    <div>
      <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>{label}</label>
      {multiline ? (
        <textarea value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} rows={3}
          style={{ width: '100%', backgroundColor: '#060A16', border: '1px solid rgba(75,163,217,0.12)', borderRadius: '9px', color: '#CDD0E0', fontSize: '14px', padding: '10px 12px', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
      ) : (
        <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
          style={{ width: '100%', backgroundColor: '#060A16', border: '1px solid rgba(75,163,217,0.12)', borderRadius: '9px', color: '#CDD0E0', fontSize: '14px', padding: '10px 12px', outline: 'none', boxSizing: 'border-box' }} />
      )}
    </div>
  )

  async function save() {
    setSaving(true)
    await supabase.from('athlete_medical').upsert({ athlete_id: athleteId, ...form }, { onConflict: 'athlete_id' })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Datos médicos */}
      <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '20px' }}>
        <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '700', margin: '0 0 16px' }}>🩺 Datos médicos</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px' }}>Grupo sanguíneo</label>
            <select value={form.blood_type} onChange={e => setForm(p => ({ ...p, blood_type: e.target.value }))}
              style={{ width: '100%', backgroundColor: '#060A16', border: '1px solid rgba(75,163,217,0.12)', borderRadius: '9px', color: '#CDD0E0', fontSize: '14px', padding: '10px 12px', outline: 'none' }}>
              <option value="">Seleccionar</option>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}>
            <p style={{ color: '#2A3550', fontSize: '12px', margin: 0 }}>Información de uso exclusivo médico-deportivo.</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
          {field('Alergias conocidas', 'allergies', 'Ej: Polen, látex, ibuprofeno…', true)}
          {field('Medicación habitual', 'medications', 'Ej: Ventolín inhalador…', true)}
        </div>
        <div style={{ marginTop: '12px' }}>
          {field('Condiciones / patologías', 'conditions', 'Ej: Asma, escoliosis, diabetes…', true)}
        </div>
      </div>

      {/* Contacto emergencia */}
      <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '16px', padding: '20px' }}>
        <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '700', margin: '0 0 16px' }}>🚨 Contacto de emergencia</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          {field('Nombre', 'emergency_name', 'Nombre completo')}
          {field('Teléfono', 'emergency_phone', '+34 600 000 000')}
          {field('Parentesco', 'emergency_relation', 'Ej: Padre, madre, pareja…')}
        </div>
      </div>

      {/* Notas */}
      <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '20px' }}>
        <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '700', margin: '0 0 16px' }}>📋 Notas adicionales</p>
        {field('Notas médicas', 'notes', 'Cualquier información relevante...', true)}
      </div>

      <button onClick={save} disabled={saving} style={{ padding: '12px 24px', borderRadius: '11px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '14px', fontWeight: '700', border: 'none', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
        {saved ? '✅ Guardado' : saving ? 'Guardando…' : 'Guardar ficha médica'}
      </button>
    </div>
  )
}
