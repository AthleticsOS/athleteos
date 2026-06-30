import { supabase } from '@/app/lib/supabase'
import CompararAtletasClient from '@/app/components/CompararAtletasClient'

export default async function CompararAtletasPage() {
  const { data: athletes } = await supabase
    .from('athletes')
    .select('id, first_name, last_name, category, sport')
    .eq('status', 'active')
    .order('first_name')

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <a href="/athletes" style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← Deportistas</a>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', margin: '8px 0 4px' }}>Comparar atletas</h1>
          <p style={{ color: '#3A4A70', fontSize: '13px', margin: 0 }}>Elige dos atletas para comparar sus estadísticas</p>
        </div>
        <CompararAtletasClient athletes={athletes || []} />
      </div>
    </main>
  )
}
