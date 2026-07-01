import { supabase } from '@/app/lib/supabase'
import SesionGrupalForm from '@/app/components/SesionGrupalForm'

export default async function SesionGrupalPage() {
  const { data: athletes } = await supabase
    .from('athletes')
    .select('id, first_name, last_name, category, sport')
    .eq('status', 'active')
    .order('first_name')

  return (
    <main className="sg-main" style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <style>{`
        @media (max-width: 768px) {
          .sg-main { padding: 16px !important; }
        }
      `}</style>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <a href="/training" style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← Entrenamientos</a>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#F0F4FF', margin: '8px 0 4px' }}>Sesión grupal</h1>
          <p style={{ color: '#3A4A70', fontSize: '13px', margin: 0 }}>Registra una sesión para varios atletas a la vez</p>
        </div>
        <SesionGrupalForm athletes={athletes || []} />
      </div>
    </main>
  )
}
