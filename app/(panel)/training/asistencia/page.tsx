import { supabase } from '@/app/lib/supabase'
import AsistenciaEntrenamientoForm from '@/app/components/AsistenciaEntrenamientoForm'

export default async function AsistenciaEntrenamientoPage() {
  const { data: athletes } = await supabase.from('athletes').select('id, first_name, last_name, category, photo_url').eq('status', 'active').order('first_name')
  const { data: sessions } = await supabase.from('training_sessions').select('id, title, date, type').order('date', { ascending: false }).limit(10)

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <a href="/training" style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← Entrenamientos</a>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#F0F4FF', margin: '8px 0 4px' }}>Asistencia al entrenamiento</h1>
          <p style={{ color: '#3A4A70', fontSize: '13px', margin: 0 }}>Marca quién ha venido a cada sesión del club</p>
        </div>
        <AsistenciaEntrenamientoForm athletes={athletes || []} sessions={sessions || []} />
      </div>
    </main>
  )
}
