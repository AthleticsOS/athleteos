import { supabase } from '@/app/lib/supabase'
import FichaMedicaForm from '@/app/components/FichaMedicaForm'

type Props = { params: Promise<{ id: string }> }

export default async function FichaMedicaPage({ params }: Props) {
  const { id } = await params
  const { data: athlete } = await supabase.from('athletes').select('*').eq('id', id).single()
  const { data: medica } = await supabase.from('athlete_medical').select('*').eq('athlete_id', id).single()

  if (!athlete) return <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '32px' }}><p style={{ color: '#3A4A70' }}>No encontrado</p></main>

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <a href={`/athletes/${id}`} style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← {athlete.first_name} {athlete.last_name}</a>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#F0F4FF', margin: '8px 0 4px' }}>Ficha médica</h1>
          <p style={{ color: '#3A4A70', fontSize: '13px', margin: 0 }}>Información médica confidencial del deportista</p>
        </div>
        <FichaMedicaForm athleteId={id} initial={medica || null} />
      </div>
    </main>
  )
}
