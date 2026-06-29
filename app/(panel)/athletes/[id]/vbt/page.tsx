'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useParams } from 'next/navigation'

// Perfiles velocidad-carga por ejercicio (velocidad media propulsiva típica)
// Basado en literatura científica de VBT
const VBT_PROFILES: Record<string, { name: string, zones: { vel: number, pct: number, label: string }[] }> = {
  sentadilla: {
    name: 'Sentadilla',
    zones: [
      { vel: 1.30, pct: 40, label: 'Muy ligero' },
      { vel: 1.00, pct: 55, label: 'Ligero' },
      { vel: 0.75, pct: 70, label: 'Moderado' },
      { vel: 0.55, pct: 80, label: 'Pesado' },
      { vel: 0.35, pct: 90, label: 'Muy pesado' },
      { vel: 0.20, pct: 100, label: 'Máximo' },
    ]
  },
  press_banca: {
    name: 'Press Banca',
    zones: [
      { vel: 1.15, pct: 40, label: 'Muy ligero' },
      { vel: 0.85, pct: 55, label: 'Ligero' },
      { vel: 0.65, pct: 70, label: 'Moderado' },
      { vel: 0.47, pct: 80, label: 'Pesado' },
      { vel: 0.30, pct: 90, label: 'Muy pesado' },
      { vel: 0.17, pct: 100, label: 'Máximo' },
    ]
  },
  peso_muerto: {
    name: 'Peso Muerto',
    zones: [
      { vel: 0.90, pct: 40, label: 'Muy ligero' },
      { vel: 0.70, pct: 55, label: 'Ligero' },
      { vel: 0.55, pct: 70, label: 'Moderado' },
      { vel: 0.40, pct: 80, label: 'Pesado' },
      { vel: 0.25, pct: 90, label: 'Muy pesado' },
      { vel: 0.15, pct: 100, label: 'Máximo' },
    ]
  },
  hip_thrust: {
    name: 'Hip Thrust',
    zones: [
      { vel: 1.10, pct: 40, label: 'Muy ligero' },
      { vel: 0.85, pct: 55, label: 'Ligero' },
      { vel: 0.65, pct: 70, label: 'Moderado' },
      { vel: 0.45, pct: 80, label: 'Pesado' },
      { vel: 0.28, pct: 90, label: 'Muy pesado' },
      { vel: 0.16, pct: 100, label: 'Máximo' },
    ]
  },
  cargada: {
    name: 'Cargada',
    zones: [
      { vel: 1.50, pct: 40, label: 'Muy ligero' },
      { vel: 1.20, pct: 55, label: 'Ligero' },
      { vel: 0.95, pct: 70, label: 'Moderado' },
      { vel: 0.75, pct: 80, label: 'Pesado' },
      { vel: 0.55, pct: 90, label: 'Muy pesado' },
      { vel: 0.35, pct: 100, label: 'Máximo' },
    ]
  },
}

function interpolarKg(profile: typeof VBT_PROFILES['sentadilla'], velocidad: number, rm: number): number {
  const zones = profile.zones
  if (velocidad >= zones[0].vel) return Math.round(rm * zones[0].pct / 100)
  if (velocidad <= zones[zones.length-1].vel) return Math.round(rm * zones[zones.length-1].pct / 100)

  for (let i = 0; i < zones.length - 1; i++) {
    if (velocidad <= zones[i].vel && velocidad >= zones[i+1].vel) {
      const t = (zones[i].vel - velocidad) / (zones[i].vel - zones[i+1].vel)
      const pct = zones[i].pct + t * (zones[i+1].pct - zones[i].pct)
      return Math.round(rm * pct / 100)
    }
  }
  return 0
}

function getZoneLabel(profile: typeof VBT_PROFILES['sentadilla'], velocidad: number): { label: string, color: string } {
  const zones = profile.zones
  for (let i = 0; i < zones.length - 1; i++) {
    if (velocidad >= zones[i+1].vel) {
      const labels = [
        { label: 'Muy ligero', color: '#10B981' },
        { label: 'Ligero', color: '#4BA3D9' },
        { label: 'Moderado', color: '#F59E0B' },
        { label: 'Pesado', color: '#F97316' },
        { label: 'Muy pesado', color: '#EF4444' },
        { label: 'Máximo', color: '#DC2626' },
      ]
      return labels[i]
    }
  }
  return { label: 'Máximo', color: '#DC2626' }
}

export default function VBT() {
  const params = useParams()
  const id = params.id as string
  const [ejercicio, setEjercicio] = useState('sentadilla')
  const [velocidad, setVelocidad] = useState('')
  const [rm, setRm] = useState('')
  const [historial, setHistorial] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    supabase.from('vbt_sessions').select('*').eq('athlete_id', id).order('date', { ascending: false }).limit(20)
      .then(({ data }) => { if (data) setHistorial(data) })
  }, [id])

  const profile = VBT_PROFILES[ejercicio]
  const vel = parseFloat(velocidad)
  const rmKg = parseFloat(rm)
  const kgResult = (!isNaN(vel) && !isNaN(rmKg) && vel > 0 && rmKg > 0) ? interpolarKg(profile, vel, rmKg) : null
  const zone = (!isNaN(vel) && vel > 0) ? getZoneLabel(profile, vel) : null
  const pctResult = kgResult && rmKg > 0 ? Math.round((kgResult / rmKg) * 100) : null

  async function handleGuardar() {
    if (!kgResult || !vel || !rmKg) return
    setSaving(true)
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('vbt_sessions').insert({
      athlete_id: id,
      date: today,
      exercise: ejercicio,
      velocity: vel,
      rm_kg: rmKg,
      target_kg: kgResult,
      percentage: pctResult,
    })
    const { data } = await supabase.from('vbt_sessions').select('*').eq('athlete_id', id).order('date', { ascending: false }).limit(20)
    if (data) setHistorial(data)
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        <div style={{ marginBottom: '24px' }}>
          <a href={`/athletes/${id}`} style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← Volver al perfil</a>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em', margin: '8px 0 4px' }}>VBT · Velocidad en pesas</h1>
          <p style={{ color: '#3A4A70', fontSize: '13px', margin: 0 }}>Buscador de kg según velocidad media propulsiva</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

          {/* Calculadora */}
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.12)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>Calculadora</div>

            <div>
              <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Ejercicio</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {Object.entries(VBT_PROFILES).map(([key, p]) => (
                  <button key={key} onClick={() => setEjercicio(key)} style={{ padding: '8px 10px', borderRadius: '8px', border: `1px solid ${ejercicio === key ? 'rgba(75,163,217,0.3)' : 'rgba(255,255,255,0.06)'}`, backgroundColor: ejercicio === key ? 'rgba(75,163,217,0.1)' : 'rgba(255,255,255,0.02)', color: ejercicio === key ? '#4BA3D9' : '#4A5580', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Velocidad media propulsiva (m/s)</label>
              <input type="number" step="0.01" value={velocidad} onChange={e => setVelocidad(e.target.value)} placeholder="Ej: 0.65" style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '16px', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>1RM del atleta (kg)</label>
              <input type="number" value={rm} onChange={e => setRm(e.target.value)} placeholder="Ej: 120" style={{ width: '100%', backgroundColor: 'rgba(75,163,217,0.05)', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '9px', padding: '10px 14px', color: '#E8EAF0', fontSize: '16px', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {/* Resultado */}
            {kgResult && zone ? (
              <div style={{ backgroundColor: 'rgba(75,163,217,0.06)', border: '1px solid rgba(75,163,217,0.2)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ color: '#3A4A70', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Kg recomendado</div>
                <div style={{ fontSize: '48px', fontWeight: '900', color: '#4BA3D9', letterSpacing: '-0.03em', lineHeight: 1 }}>{kgResult}</div>
                <div style={{ color: '#4BA3D9', fontSize: '14px', fontWeight: '600', marginTop: '4px' }}>kg · {pctResult}% del 1RM</div>
                <div style={{ display: 'inline-block', marginTop: '10px', padding: '4px 12px', borderRadius: '20px', backgroundColor: `${zone.color}15`, color: zone.color, border: `1px solid ${zone.color}30`, fontSize: '12px', fontWeight: '700' }}>
                  {zone.label}
                </div>
                <button onClick={handleGuardar} disabled={saving} style={{ display: 'block', width: '100%', marginTop: '12px', padding: '10px', borderRadius: '9px', background: saved ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', border: saved ? '1px solid rgba(16,185,129,0.3)' : 'none', color: saved ? '#10B981' : 'white', fontSize: '13px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar registro'}
                </button>
              </div>
            ) : (
              <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '24px', textAlign: 'center', color: '#2A3550', fontSize: '13px' }}>
                Introduce velocidad y 1RM para calcular
              </div>
            )}
          </div>

          {/* Tabla de zonas */}
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
              <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '700', margin: 0 }}>Zonas · {profile.name}</p>
              <p style={{ color: '#3A4A70', fontSize: '11px', margin: '4px 0 0' }}>Velocidad media propulsiva de referencia</p>
            </div>
            {profile.zones.map((zone, i) => {
              const zoneColors = ['#10B981','#4BA3D9','#F59E0B','#F97316','#EF4444','#DC2626']
              const c = zoneColors[i]
              const kgZone = !isNaN(rmKg) && rmKg > 0 ? Math.round(rmKg * zone.pct / 100) : null
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 18px', borderBottom: i < profile.zones.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none', backgroundColor: (!isNaN(vel) && vel > 0 && vel >= zone.vel && (i === profile.zones.length-1 || vel < profile.zones[i-1]?.vel || i === 0)) ? `${c}08` : 'transparent' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#CDD0E0', fontSize: '12px', fontWeight: '600' }}>{zone.label}</div>
                    <div style={{ color: '#3A4A70', fontSize: '11px' }}>{zone.pct}% del 1RM</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: c, fontSize: '12px', fontWeight: '700', fontFamily: 'monospace' }}>{zone.vel} m/s</div>
                    {kgZone && <div style={{ color: '#4A5580', fontSize: '11px', fontFamily: 'monospace' }}>{kgZone} kg</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Historial */}
        {historial.length > 0 && (
          <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
              <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '700', margin: 0 }}>Historial VBT</p>
            </div>
            {historial.map((h, i) => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '11px 18px', borderBottom: i < historial.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                <div style={{ color: '#3A4A70', fontSize: '11px', minWidth: '60px' }}>{new Date(h.date+'T00:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'})}</div>
                <div style={{ flex: 1 }}>
                  <span style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '500' }}>{VBT_PROFILES[h.exercise]?.name || h.exercise}</span>
                </div>
                <div style={{ color: '#4A5580', fontSize: '12px', fontFamily: 'monospace' }}>{h.velocity} m/s</div>
                <div style={{ color: '#4BA3D9', fontSize: '14px', fontWeight: '800', fontFamily: 'monospace' }}>{h.target_kg} kg</div>
                <div style={{ color: '#3A4A70', fontSize: '11px' }}>{h.percentage}%</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
