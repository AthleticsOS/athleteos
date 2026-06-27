'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function NuevaCompeticion() {
  const [form, setForm] = useState({
    name: '',
    location: '',
    date: '',
    level: 'Regional',
    sport: 'Atletismo',
    status: 'upcoming'
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    if (!form.name || !form.date) {
      setMessage('El nombre y la fecha son obligatorios')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('competitions').insert([form])
    if (error) {
      setMessage('Error al guardar. Inténtalo de nuevo.')
    } else {
      window.location.href = '/competitions'
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-lg mx-auto">
        <a href="/competitions" className="text-[#555] text-sm hover:text-white transition-colors">← Competiciones</a>
        <h1 className="text-3xl font-medium text-white mt-2 mb-8">Nueva competición</h1>

        <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-6 flex flex-col gap-5">
          <div>
            <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Nombre</label>
            <input name="name" value={form.name} onChange={handleChange}
              placeholder="Campeonato Regional de Atletismo"
              className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
          </div>
          <div>
            <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Lugar</label>
            <input name="location" value={form.location} onChange={handleChange}
              placeholder="Sevilla"
              className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
          </div>
          <div>
            <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Fecha</label>
            <input name="date" type="date" value={form.date} onChange={handleChange}
              className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Nivel</label>
              <select name="level" value={form.level} onChange={handleChange}
                className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors">
                <option>Local</option>
                <option>Regional</option>
                <option>Nacional</option>
                <option>Internacional</option>
              </select>
            </div>
            <div>
              <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Estado</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors">
                <option value="upcoming">Próxima</option>
                <option value="finished">Finalizada</option>
              </select>
            </div>
          </div>

          {message && <p className="text-red-400 text-sm">{message}</p>}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg text-sm transition-colors disabled:opacity-50">
            {loading ? 'Guardando...' : 'Guardar competición'}
          </button>
        </div>
      </div>
    </main>
  )
}