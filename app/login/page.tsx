'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleLogin() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage('Email o contraseña incorrectos')
    } else {
      setMessage('¡Entrando!')
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">A</span>
          </div>
          <h1 className="text-2xl font-medium text-white">Bienvenido</h1>
          <p className="text-[#555] text-sm mt-1">Entra en tu club</p>
        </div>
        <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <label className="text-[#666] text-xs uppercase tracking-widest block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors"
            />
          </div>
          <div>
            <label className="text-[#666] text-xs uppercase tracking-widest block mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors"
            />
          </div>
          {message && (
            <p className="text-sm text-center text-red-400">{message}</p>
          )}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
      </div>
    </main>
  )
}