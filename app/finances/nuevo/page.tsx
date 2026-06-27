'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function NuevoPago() {
  const [athletes, setAthletes] = useState<any[]>([])
  const [form, setForm] = useState({
    athlete_id: '',
    concept: 'Cuota mensual',
    amount_cents: 8000,
    status: 'pending',
    due_date: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase.from('athletes').select('id, first_name, last_name').then(({ data }) => {
      if (data) setAthletes(data)
    })
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    if (!form.athlete_id || !form.due_date) {
      setMessage('El deportista y la fecha son obligatorios')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('payments').insert([{
      ...form,
      amount_cents: Number(form.amount_cents)
    }])
    if (error) {
      setMessage('Error al guardar. Inténtalo de nuevo.')
    } else {
      window.location.href = '/finances'
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-lg mx-auto">
        <a href="/finances" className="text-[#555] text-sm hover:text-white transition-colors">← Finanzas</a>
        <h1 className="text-3xl font-medium text-white mt-2 mb-8">Nuevo pago</h1>

        <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-6 flex flex-col gap-5">
          <div>
            <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Deportista</label>
            <select name="athlete_id" value={form.athlete_id} onChange={handleChange}
              className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors">
              <option value="">Seleccionar deportista</option>
              {athletes.map(a => (
                <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Concepto</label>
            <input name="concept" value={form.concept} onChange={handleChange}
              placeholder="Cuota mensual junio"
              className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Importe (céntimos)</label>
              <input name="amount_cents" type="number" value={form.amount_cents} onChange={handleChange}
                className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
              <p className="text-[#444] text-xs mt-1">8000 = €80.00</p>
            </div>
            <div>
              <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Estado</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors">
                <option value="pending">Pendiente</option>
                <option value="paid">Pagado</option>
                <option value="overdue">Vencido</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Fecha de vencimiento</label>
            <input name="due_date" type="date" value={form.due_date} onChange={handleChange}
              className="w-full bg-[#0A0A0A] border border-[#222] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
          </div>

          {message && <p className="text-red-400 text-sm">{message}</p>}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg text-sm transition-colors disabled:opacity-50">
            {loading ? 'Guardando...' : 'Guardar pago'}
          </button>
        </div>
      </div>
    </main>
  )
}