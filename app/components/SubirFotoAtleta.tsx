'use client'

import { useState, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function SubirFotoAtleta({ athleteId, currentUrl }: { athleteId: string, currentUrl: string | null }) {
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `athletes/${athleteId}/photo.${ext}`
    await supabase.storage.from('athlete-photos').upload(path, file, { upsert: true })
    const { data } = supabase.storage.from('athlete-photos').getPublicUrl(path)
    const url = data.publicUrl + '?v=' + Date.now()
    await supabase.from('athletes').update({ photo_url: data.publicUrl }).eq('id', athleteId)
    setPreview(url)
    setUploading(false)
  }

  return (
    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => inputRef.current?.click()}>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Foto" style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(75,163,217,0.4)' }} />
      ) : (
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', border: '2px solid rgba(75,163,217,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: 'white' }}>
          {athleteId.slice(0,1).toUpperCase()}
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#4BA3D9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', border: '2px solid #06080F' }}>
        {uploading ? '⏳' : '📷'}
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  )
}
