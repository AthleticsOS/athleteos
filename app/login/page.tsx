'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

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
    if (!email || !password) {
      setError('Introduce tu email y contraseña')
      return
    }
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o contraseña incorrectos')
    } else {
      const { data: athlete } = await supabase
        .from('athletes')
        .select('id')
        .eq('user_id', data.user.id)
        .single()

      if (athlete) {
        window.location.href = '/athlete-portal'
      } else {
        window.location.href = '/dashboard'
      }
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#080808] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div style={{width:'48px', height:'48px', background:'linear-gradient(135deg,#6366F1,#8B5CF6)', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', boxShadow:'0 0 20px rgba(99,102,241,0.4)'}}>
            <span style={{color:'white', fontSize:'20px', fontWeight:'800'}}>A</span>
          </div>
          <h1 style={{fontSize:'22px', fontWeight:'700', color:'#F0F0F0', letterSpacing:'-0.02em', margin:0}}>AthleteOS</h1>
          <p style={{color:'#333', fontSize:'13px', marginTop:'6px'}}>Accede a tu club deportivo</p>
        </div>

        <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'24px', display:'flex', flexDirection:'column', gap:'16px'}}>
          <div>
            <label style={{color:'#444', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:'8px'}}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="tu@email.com"
              style={{width:'100%', backgroundColor:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'11px 14px', color:'white', fontSize:'14px', outline:'none', boxSizing:'border-box'}}
            />
          </div>
          <div>
            <label style={{color:'#444', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:'8px'}}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              style={{width:'100%', backgroundColor:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'11px 14px', color:'white', fontSize:'14px', outline:'none', boxSizing:'border-box'}}
            />
          </div>

          {error && (
            <div style={{backgroundColor:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'8px', padding:'10px 14px', color:'#EF4444', fontSize:'13px'}}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              padding:'12px', borderRadius:'10px', fontSize:'14px', fontWeight:'700',
              background: loading ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg,#6366F1,#8B5CF6)',
              color:'white', border:'none', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 0 20px rgba(99,102,241,0.3)',
              marginTop:'4px',
            }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </div>

        <p style={{textAlign:'center', color:'#222', fontSize:'12px', marginTop:'20px'}}>
          AthleteOS · El sistema operativo de tu club deportivo
        </p>
      </div>
    </main>
  )
}