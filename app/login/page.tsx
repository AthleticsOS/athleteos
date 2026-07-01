'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Image from 'next/image'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleLogin() {
    if (!email || !password) { setError('Introduce tu email y contraseña'); return }
    setLoading(true); setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o contraseña incorrectos')
    } else {
      const { data: athlete } = await supabase.from('athletes').select('id').eq('user_id', data.user.id).single()
      if (athlete) { window.location.href = '/athlete-portal'; return }
      const { data: coachRole } = await supabase.from('club_roles').select('role').eq('user_id', data.user.id).single()
      if (coachRole?.role === 'coach') { window.location.href = '/coach-panel'; return }
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#06080F',
      display: 'flex',
      fontFamily: "-apple-system,'Inter',sans-serif",
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(20px, 5vw, 40px)',
      }}>
        <div style={{width: '100%', maxWidth: '380px'}}>
          <div style={{textAlign: 'center', marginBottom: '40px'}}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/escudo-wa.png?v=3"
              alt="WeAthletics"
              width={90}
              height={90}
              style={{margin: '0 auto 20px', display: 'block'}}
            />
            <div style={{fontFamily:'Airstrike, -apple-system, sans-serif', fontSize:'32px', fontWeight:'900', letterSpacing:'0.02em', margin:'0 auto 10px', textAlign:'center'}}>
              <span style={{color:'#4BA3D9'}}>WE</span><span style={{color:'white'}}>ATHLETICS</span>
            </div>
            <p style={{color: '#3A4A70', fontSize: '13px', marginTop: '12px'}}>
              Plataforma de gestión del club
            </p>
          </div>

          <div style={{
            backgroundColor: '#0A0E1A',
            border: '1px solid rgba(75,163,217,0.12)',
            borderRadius: '16px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <div>
              <label style={{color: '#4A5580', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px'}}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="tu@weathletics.com"
                style={{width: '100%', backgroundColor: 'rgba(75,163,217,0.04)', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
              />
            </div>
            <div>
              <label style={{color: '#4A5580', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px'}}>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                style={{width: '100%', backgroundColor: 'rgba(75,163,217,0.04)', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#E8EAF0', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
              />
            </div>

            {error && (
              <div style={{backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 14px', color: '#EF4444', fontSize: '13px'}}>
                {error}
              </div>
            )}

            <button onClick={handleLogin} disabled={loading} style={{
              padding: '13px', borderRadius: '10px', fontSize: '14px', fontWeight: '700',
              background: loading ? 'rgba(30,42,94,0.5)' : 'linear-gradient(135deg, #1E2A5E, #4BA3D9)',
              color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 0 24px rgba(75,163,217,0.25)',
              marginTop: '4px', letterSpacing: '0.02em',
            }}>
              {loading ? 'Entrando...' : 'Acceder'}
            </button>
          </div>

          <p style={{textAlign: 'center', color: '#3A4A70', fontSize: '12px', marginTop: '20px'}}>
            ¿Eres nuevo? <a href="/register" style={{color:'#4BA3D9', textDecoration:'none', fontWeight:'600'}}>Solicitar acceso al club →</a>
          </p>
          <p style={{textAlign: 'center', color: '#1E2A5E', fontSize: '11px', marginTop: '8px'}}>
            WeAthletics · Club Deportivo · Madrid
          </p>
        </div>
      </div>

      <div style={{
        width: '420px',
        background: 'linear-gradient(160deg, #0D1428 0%, #1E2A5E 50%, #0A1530 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(75,163,217,0.08) 0%, transparent 70%)', pointerEvents: 'none'}} />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/escudo-wa.png?v=3"
          alt="WeAthletics"
          width={180}
          height={180}
          style={{marginBottom: '28px', position: 'relative', zIndex: 1}}
        />

        <div style={{position: 'relative', zIndex: 1, textAlign: 'center'}}>
          <div style={{fontFamily:'Airstrike, -apple-system, sans-serif', fontSize:'38px', fontWeight:'900', letterSpacing:'0.02em', marginBottom:'14px'}}>
            <span style={{color:'#4BA3D9'}}>WE</span><span style={{color:'white'}}>ATHLETICS</span>
          </div>
          <p style={{color: 'rgba(75,163,217,0.7)', fontSize: '13px', lineHeight: '1.7', maxWidth: '280px'}}>
            La plataforma de gestión deportiva del Club Deportivo WeAthletics
          </p>

          <div style={{display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '32px'}}>
            {[
              {value: '2', label: 'Atletas'},
              {value: '1', label: 'Temporada'},
              {value: 'MAD', label: 'España'},
            ].map(stat => (
              <div key={stat.label} style={{textAlign: 'center'}}>
                <div style={{fontSize: '24px', fontWeight: '800', color: '#4BA3D9', letterSpacing: '-0.02em'}}>{stat.value}</div>
                <div style={{fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px'}}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}