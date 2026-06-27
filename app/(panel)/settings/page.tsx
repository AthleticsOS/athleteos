'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function Settings() {
  const [form, setForm] = useState({
    name: '',
    legal_name: '',
    primary_color: '#0066FF',
    country: 'ES',
    slug: '',
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [saved, setSaved] = useState(false)
  const [clubId, setClubId] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    supabase.from('clubs').select('*').single().then(({ data }) => {
      if (data) {
        setClubId(data.id)
        setForm({
          name: data.name || '',
          legal_name: data.legal_name || '',
          primary_color: data.primary_color || '#0066FF',
          country: data.country || 'ES',
          slug: data.slug || '',
        })
      }
      setFetching(false)
    })
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    setLoading(true)
    setSaved(false)
    const { error } = await supabase.from('clubs').update(form).eq('id', clubId)
    if (!error) setSaved(true)
    setLoading(false)
  }

  if (fetching) return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <p className="text-[#444]">Cargando...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-white">Configuración</h1>
          <p className="text-[#555] text-sm mt-1">Datos y configuración de WeAthletics</p>
        </div>

        <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl overflow-hidden mb-4">
          <div className="px-6 py-4 border-b border-[#1A1A1A]">
            <p className="text-white text-sm font-medium">Información del club</p>
          </div>
          <div className="p-6 flex flex-col gap-5">
            <div>
              <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Nombre del club</label>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="WeAthletics"
                className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
            </div>
            <div>
              <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Razón social</label>
              <input name="legal_name" value={form.legal_name} onChange={handleChange}
                placeholder="WeAthletics S.L."
                className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
            </div>
            <div>
              <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Slug (URL)</label>
              <input name="slug" value={form.slug} onChange={handleChange}
                placeholder="weathleticsclub"
                className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors" />
              <p className="text-[#333] text-xs mt-1">Solo letras minúsculas y guiones. Sin espacios.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">País</label>
                <select name="country" value={form.country} onChange={handleChange}
                  className="w-full bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors">
                  <option value="ES">España</option>
                  <option value="PT">Portugal</option>
                  <option value="FR">Francia</option>
                  <option value="DE">Alemania</option>
                  <option value="IT">Italia</option>
                  <option value="GB">Reino Unido</option>
                </select>
              </div>
              <div>
                <label className="text-[#555] text-xs uppercase tracking-widest block mb-2">Color principal</label>
                <div className="flex gap-3 items-center">
                  <input type="color" name="primary_color" value={form.primary_color} onChange={handleChange}
                    className="w-12 h-12 rounded-lg border border-[#222] bg-[#0A0A0A] cursor-pointer" />
                  <input name="primary_color" value={form.primary_color} onChange={handleChange}
                    placeholder="#0066FF"
                    className="flex-1 bg-[#0A0A0A] border border-[#222] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-600 transition-colors font-mono" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#111] border border-[#1A1A1A] rounded-2xl overflow-hidden mb-4">
          <div className="px-6 py-4 border-b border-[#1A1A1A]">
            <p className="text-white text-sm font-medium">Vista previa</p>
          </div>
          <div className="p-6">
            <div style={{display:'flex', alignItems:'center', gap:'12px', padding:'16px', background:'#0A0A0A', borderRadius:'12px', border:'1px solid #1A1A1A'}}>
              <div style={{width:'40px', height:'40px', borderRadius:'10px', backgroundColor: form.primary_color, display:'flex', alignItems:'center', justifyContent:'center'}}>
                <span style={{color:'white', fontWeight:'bold', fontSize:'16px'}}>{form.name?.[0] || 'A'}</span>
              </div>
              <div>
                <div style={{color:'white', fontWeight:'500', fontSize:'14px'}}>{form.name || 'Nombre del club'}</div>
                <div style={{color:'#444', fontSize:'12px'}}>{form.slug || 'slug-del-club'}.athleteos.com</div>
              </div>
            </div>
          </div>
        </div>

        {saved && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm mb-4">
            ✓ Cambios guardados correctamente
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl text-sm transition-colors disabled:opacity-50">
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </main>
  )
}