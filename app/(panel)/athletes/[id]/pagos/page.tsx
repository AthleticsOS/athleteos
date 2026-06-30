import { supabase } from '@/app/lib/supabase'
import MarcarPagadoButton from '@/app/components/MarcarPagadoButton'
import ExportCSV from '@/app/components/ExportCSV'

type Props = { params: Promise<{ id: string }> }

export default async function AthletePayments({ params }: Props) {
  const { id } = await params
  const { data: athlete } = await supabase.from('athletes').select('id, first_name, last_name').eq('id', id).single()
  const { data: payments } = await supabase.from('payments').select('*').eq('athlete_id', id).order('due_date', { ascending: false })

  if (!athlete) return <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '32px' }}><p style={{ color: '#3A4A70' }}>No encontrado</p></main>

  const paid = payments?.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount_cents || 0), 0) || 0
  const pending = payments?.filter(p => p.status !== 'paid').reduce((s, p) => s + (p.amount_cents || 0), 0) || 0

  const exportData = payments?.map(p => ({
    Concepto: p.concept,
    Importe: `€${((p.amount_cents||0)/100).toFixed(2)}`,
    Estado: p.status === 'paid' ? 'Pagado' : 'Pendiente',
    Vencimiento: p.due_date || '',
  })) || []

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <a href={`/athletes/${id}`} style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← {athlete.first_name} {athlete.last_name}</a>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#F0F4FF', margin: '8px 0 4px' }}>Historial de pagos</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Total cuotas', value: String(payments?.length || 0), color: '#4BA3D9' },
            { label: 'Pagado', value: `€${(paid/100).toFixed(0)}`, color: '#10B981' },
            { label: 'Pendiente', value: `€${(pending/100).toFixed(0)}`, color: pending > 0 ? '#F59E0B' : '#3A4A70' },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '12px', padding: '14px 16px' }}>
              <div style={{ color: '#2A3550', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
            <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>Todos los pagos · {payments?.length || 0}</p>
            <ExportCSV data={exportData} filename={`pagos_${athlete.first_name}_${athlete.last_name}`} label="CSV" />
          </div>
          {payments && payments.length > 0 ? payments.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 18px', borderBottom: i < payments.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '500' }}>{p.concept}</div>
                {p.due_date && <div style={{ color: '#2A3550', fontSize: '11px', marginTop: '1px' }}>Vence: {new Date(p.due_date+'T00:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'})}</div>}
              </div>
              <div style={{ color: '#F0F4FF', fontSize: '14px', fontWeight: '700', fontFamily: 'monospace' }}>€{((p.amount_cents||0)/100).toFixed(0)}</div>
              <MarcarPagadoButton paymentId={p.id} />
            </div>
          )) : (
            <div style={{ padding: '32px', textAlign: 'center', color: '#2A3550', fontSize: '13px' }}>Sin pagos registrados</div>
          )}
        </div>
      </div>
    </main>
  )
}
