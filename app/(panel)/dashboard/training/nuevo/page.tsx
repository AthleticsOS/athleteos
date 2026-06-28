'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function NuevaSesion() {
  const [form, setForm] = useState({
    title: '',
    date: '',
    time: '',
    duration_min: 90,
    type: 'Técnica',
    location: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    if (!form.title || !form.date) {
      setMessage('El título y la fecha son obligatorios')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('training_sessions').insert([form])
    if (error) {
      setMessage('Error al guardar. Inténtalo de nuevo.')
    } else {
      window.location.href = '/training'
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-lg mx-auto">
        <a href="/training" className="text-[#555] text-sm hover:text-white transition-colors">← Entrenamientos</a>
        <h1 className="text-3xl font-medium text-white mt-2 mb-8">Nueva sesión</h1>

        <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-6 flex flex-col gap-5">
          <div>
            <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Título</label>
            <input name="title" value={form.title} onChange={handleChange}
              placeholder="Técnica de salidas y aceleración"
              className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Fecha</label>
              <input name="date" type="date" value={form.date} onChange={handleChange}
                className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
            </div>
            <div>
              <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Hora</label>
              <input name="time" type="time" value={form.time} onChange={handleChange}
                className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Duración (min)</label>
              <input name="duration_min" type="number" value={form.duration_min} onChange={handleChange}
                className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
            </div>
            <div>
              <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Tipo</label>
              <select name="type" value={form.type} onChange={handleChange}
                className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors">
                <option>Técnica</option>
                <option>Velocidad</option>
                <option>Resistencia</option>
                <option>Fuerza</option>
                <option>Recuperación</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Lugar</label>
            <input name="location" value={form.location} onChange={handleChange}
              placeholder="Pista principal"
              className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
          </div>
          <div>
            <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Descripción</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              placeholder="Calentamiento 20min, series 60m x6, vuelta a la calma..."
              rows={3}
              className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors resize-none" />
          </div>

          {message && <p className="text-red-400 text-sm">{message}</p>}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg text-sm transition-colors disabled:opacity-50">
            {loading ? 'Guardando...' : 'Guardar sesión'}
          </button>
        </div>
      </div>
    </main>
  )
}