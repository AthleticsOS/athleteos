'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'

export default function NuevoDeportista() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    birth_date: '',
    gender: 'male',
    sport: 'Atletismo',
    category: 'Absoluto',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    if (!form.first_name || !form.last_name) {
      setMessage('El nombre y apellido son obligatorios')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('athletes').insert([form])
    if (error) {
      setMessage('Error al guardar. Inténtalo de nuevo.')
    } else {
      window.location.href = '/athletes'
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-lg mx-auto">
        <a href="/athletes" className="text-[#555] text-sm hover:text-white transition-colors">← Deportistas</a>
        <h1 className="text-3xl font-medium text-white mt-2 mb-8">Nuevo deportista</h1>

        <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-6 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Nombre</label>
              <input name="first_name" value={form.first_name} onChange={handleChange}
                placeholder="Aaron"
                className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
            </div>
            <div>
              <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Apellido</label>
              <input name="last_name" value={form.last_name} onChange={handleChange}
                placeholder="Cortés"
                className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Email</label>
            <input name="email" value={form.email} onChange={handleChange}
              placeholder="deportista@email.com"
              className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
          </div>
          <div>
            <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Teléfono</label>
            <input name="phone" value={form.phone} onChange={handleChange}
              placeholder="600 000 000"
              className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Fecha de nacimiento</label>
              <input name="birth_date" type="date" value={form.birth_date} onChange={handleChange}
                className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
            </div>
            <div>
              <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Género</label>
              <select name="gender" value={form.gender} onChange={handleChange}
                className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors">
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Deporte</label>
              <select name="sport" value={form.sport} onChange={handleChange}
                className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors">
                <option>Atletismo</option>
                <option>Fútbol</option>
                <option>Natación</option>
                <option>Baloncesto</option>
                <option>Tenis</option>
                <option>Ciclismo</option>
              </select>
            </div>
            <div>
              <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Categoría</label>
              <select name="category" value={form.category} onChange={handleChange}
                className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors">
                <option>Absoluto</option>
                <option>Sub-23</option>
                <option>Juvenil</option>
                <option>Cadete</option>
                <option>Infantil</option>
                <option>Benjamín</option>
              </select>
            </div>
          </div>

          {message && <p className="text-red-400 text-sm">{message}</p>}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg text-sm transition-colors disabled:opacity-50">
            {loading ? 'Guardando...' : 'Guardar deportista'}
          </button>
        </div>
      </div>
    </main>
  )
}