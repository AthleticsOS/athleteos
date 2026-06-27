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
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o contraseña incorrectos')
    } else {
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <span className="text-white text-xl font-bold">A</span>
          </div>
          <h1 className="text-2xl font-medium text-white tracking-tight">AthleteOS</h1>
          <p className="text-[#444] text-sm mt-2">Accede a tu club deportivo</p>
        </div>

        <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="tu@email.com"
              className="w-full bg-[#0A0A0A] border border-[#222] hover:border-[#333] focus:border-blue-600 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors placeholder-[#333]"
            />
          </div>
          <div>
            <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              className="w-full bg-[#0A0A0A] border border-[#222] hover:border-[#333] focus:border-blue-600 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors placeholder-[#333]"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-medium py-3 rounded-xl text-sm transition-all disabled:opacity-50 mt-1">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </div>

        <p className="text-center text-[#333] text-xs mt-6">
          AthleteOS · El sistema operativo de tu club deportivo
        </p>
      </div>
    </main>
  )
}