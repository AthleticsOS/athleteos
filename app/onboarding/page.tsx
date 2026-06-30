'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const steps = [
  { title: 'Bienvenido a WeAthletics', subtitle: 'Tu plataforma de gestión deportiva', icon: '👋' },
  { title: 'Tu perfil está listo', subtitle: 'Hemos creado tu ficha de atleta', icon: '✅' },
  { title: 'Registra tus entrenamientos', subtitle: 'Cada sesión cuenta para tu evolución', icon: '🏃' },
  { title: 'Sigue tus marcas', subtitle: 'Añade tus tiempos y competiciones', icon: '🏆' },
  { title: 'Listo para empezar', subtitle: 'Tu portal está configurado', icon: '🚀' },
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [athleteName, setAthleteName] = useState('')

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('athletes').select('first_name').eq('user_id', user.id).single().then(({ data }) => {
          if (data) setAthleteName(data.first_name)
        })
      }
    })
  }, [])

  const current = steps[step]

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "-apple-system,'Inter',sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '48px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/escudo-wa.png?v=3" alt="WeAthletics" width={36} height={36} style={{ borderRadius: '50%' }} />
          <span style={{ color: '#CDD0E0', fontSize: '14px', fontWeight: '700' }}>WeAthletics</span>
        </div>

        {/* Indicadores de paso */}
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '32px' }}>
          {steps.map((_, i) => (
            <div key={i} style={{ height: '4px', borderRadius: '4px', transition: 'all 300ms', backgroundColor: i <= step ? '#4BA3D9' : 'rgba(75,163,217,0.12)', width: i === step ? '24px' : '8px' }} />
          ))}
        </div>

        {/* Tarjeta principal */}
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.15)', borderRadius: '24px', padding: '40px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#4BA3D9,transparent)' }} />
          <div style={{ fontSize: '56px', marginBottom: '20px', lineHeight: 1 }}>{current.icon}</div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#F0F4FF', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            {step === 0 && athleteName ? `¡Hola, ${athleteName}!` : current.title}
          </h1>
          <p style={{ color: '#3A4A70', fontSize: '14px', margin: '0 0 32px', lineHeight: '1.6' }}>{current.subtitle}</p>

          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px', textAlign: 'left' }}>
              {[
                { label: 'Registra cada entrenamiento', desc: 'Lleva el control de tus sesiones' },
                { label: 'Ve tus convocatorias', desc: 'El entrenador te avisará directamente' },
                { label: 'Sigue tu evolución', desc: 'Gráficas de progreso en tiempo real' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '12px 14px', borderRadius: '10px', backgroundColor: 'rgba(75,163,217,0.04)', border: '1px solid rgba(75,163,217,0.08)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4BA3D9', flexShrink: 0 }} />
                  <div>
                    <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600' }}>{item.label}</div>
                    <div style={{ color: '#2A3550', fontSize: '11px' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step < steps.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', border: 'none', color: 'white', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
              Continuar
            </button>
          ) : (
            <a href="/athlete-portal" style={{ display: 'block', width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '15px', fontWeight: '700', textDecoration: 'none', textAlign: 'center' }}>
              Ir a mi portal →
            </a>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="/athlete-portal" style={{ color: '#2A3550', fontSize: '12px', textDecoration: 'none' }}>Saltar introducción</a>
        </div>
      </div>
    </main>
  )
}
