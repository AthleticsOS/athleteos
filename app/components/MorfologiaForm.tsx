'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function MorfologiaForm({ athleteId }: { athleteId: string }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({ date: today, weight: '', height: '', fat_pct: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function save() {
    if (!form.weight && !form.height) return
    setSaving(true)
    await supabase.from('body_measurements').insert({
      athlete_id: athleteId,
      date: form.date,
      weight: form.weight ? parseFloat(form.weight) : null,
      height: form.height ? parseFloat(form.height) : null,
      fat_pct: form.fat_pct ? parseFloat(form.fat_pct) : null,
      notes: form.notes || null,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); window.location.reload() }, 1500)
  }

  const inp = (label: string, key: keyof typeof form, placeholder: string, type = 'text') => (
    <div>
      <label style={{ color: '#3A4A70', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>{label}</label>
      <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
        style={{ width: '100%', backgroundColor: '#060A16', border: '1px solid rgba(75,163,217,0.12)', borderRadius: '8px', color: '#CDD0E0', fontSize: '13px', padding: '9px 11px', outline: 'none', boxSizing: 'border-box' }} />
    </div>
  )

  return (
    <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', padding: '18px' }}>
      <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: '0 0 14px' }}>+ Nuevo registro</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {inp('Fecha', 'date', '', 'date')}
        {inp('Peso (kg)', 'weight', 'Ej: 72.5', 'number')}
        {inp('Altura (cm)', 'height', 'Ej: 178', 'number')}
        {inp('% Grasa corporal', 'fat_pct', 'Ej: 12.3', 'number')}
        {inp('Notas', 'notes', 'Observaciones…')}
        <button onClick={save} disabled={saving} style={{ padding: '10px', borderRadius: '9px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '13px', fontWeight: '700', border: 'none', cursor: 'pointer', opacity: saving ? 0.6 : 1, marginTop: '4px' }}>
          {saved ? '✅ Guardado' : saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}
