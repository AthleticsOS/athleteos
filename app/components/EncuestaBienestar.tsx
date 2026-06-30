'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function EncuestaBienestar({ athleteId, todayDone }: { athleteId: string, todayDone: boolean }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ sleep: 7, energy: 7, stress: 3, pain: 1, notes: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(todayDone)

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  async function handleSave() {
    setLoading(true)
    await supabase.from('wellness_surveys').upsert({
      athlete_id: athleteId,
      date: new Date().toISOString().split('T')[0],
      sleep: form.sleep, energy: form.energy, stress: form.stress, pain: form.pain,
      notes: form.notes || null,
    }, { onConflict: 'athlete_id,date' })
    setDone(true); setLoading(false); setOpen(false)
  }

  if (done && !open) return (
    <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
      <span style={{ fontSize: '18px' }}>✅</span>
      <div>
        <div style={{ color: '#10B981', fontSize: '13px', fontWeight: '600' }}>Bienestar registrado hoy</div>
        <div style={{ color: '#3A4A70', fontSize: '11px' }}>Vuelve mañana para completar la encuesta</div>
      </div>
    </div>
  )

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'rgba(75,163,217,0.06)', border: '1px solid rgba(75,163,217,0.15)', color: '#4BA3D9', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
      💙 Encuesta de bienestar de hoy
    </button>
  )

  function Slider({ label, field, value, min, max, lowLabel, highLabel, color }: { label: string, field: string, value: number, min: number, max: number, lowLabel: string, highLabel: string, color: string }) {
    return (
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600' }}>{label}</span>
          <span style={{ color, fontSize: '16px', fontWeight: '800' }}>{value}/{max}</span>
        </div>
        <input type="range" min={min} max={max} value={value} onChange={e => setForm(f => ({ ...f, [field]: Number(e.target.value) }))}
          style={{ width: '100%', accentColor: color }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
          <span style={{ color: '#2A3550', fontSize: '10px' }}>{lowLabel}</span>
          <span style={{ color: '#2A3550', fontSize: '10px' }}>{highLabel}</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '16px', padding: '20px', marginBottom: '12px' }}>
      <div style={{ color: '#CDD0E0', fontSize: '14px', fontWeight: '700', marginBottom: '18px' }}>💙 Encuesta de bienestar</div>
      <Slider label="Calidad del sueño" field="sleep" value={form.sleep} min={1} max={10} lowLabel="Muy malo" highLabel="Excelente" color="#4BA3D9" />
      <Slider label="Nivel de energía" field="energy" value={form.energy} min={1} max={10} lowLabel="Sin energía" highLabel="Lleno de energía" color="#10B981" />
      <Slider label="Nivel de estrés" field="stress" value={form.stress} min={1} max={10} lowLabel="Relajado" highLabel="Muy estresado" color="#F59E0B" />
      <Slider label="Dolor o molestias" field="pain" value={form.pain} min={1} max={10} lowLabel="Sin dolor" highLabel="Mucho dolor" color="#EF4444" />
      <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} placeholder="Notas adicionales (opcional)..." rows={2} style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.12)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '13px', outline: 'none', boxSizing: 'border-box', resize: 'none', marginBottom: '14px' }} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => setOpen(false)} style={{ flex: 1, padding: '10px', borderRadius: '9px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#888', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
        <button onClick={handleSave} disabled={loading} style={{ flex: 2, padding: '10px', borderRadius: '9px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', border: 'none', color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
          {loading ? 'Guardando...' : 'Enviar encuesta'}
        </button>
      </div>
    </div>
  )
}
