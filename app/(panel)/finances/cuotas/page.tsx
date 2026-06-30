import { supabase } from '@/app/lib/supabase'
import GenerarCuotaClubButton from '@/app/components/GenerarCuotaClubButton'
import MarcarPagadoButton from '@/app/components/MarcarPagadoButton'

export default async function CuotasPage() {
  const { data: athletes } = await supabase
    .from('athletes')
    .select('id, first_name, last_name, email, category')
    .eq('status', 'active')
    .order('first_name')

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .order('due_date', { ascending: false })

  const byAthlete: Record<string, typeof payments> = {}
  athletes?.forEach(a => { byAthlete[a.id] = [] })
  payments?.forEach(p => {
    if (p.athlete_id && byAthlete[p.athlete_id]) byAthlete[p.athlete_id]!.push(p)
  })

  const totalPending = payments?.filter(p => p.status !== 'paid').reduce((s,p) => s + (p.amount_cents||0), 0) || 0
  const totalPaid = payments?.filter(p => p.status === 'paid').reduce((s,p) => s + (p.amount_cents||0), 0) || 0
  const athletesPending = athletes?.filter(a => (byAthlete[a.id]||[]).some(p => p.status !== 'paid')).length || 0

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <a href="/finances" style={{ color: '#3A4A70', fontSize: '13px', textDecoration: 'none' }}>← Finanzas</a>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em', margin: '8px 0 4px' }}>Cuotas del club</h1>
            <p style={{ color: '#3A4A70', fontSize: '13px', margin: 0 }}>Gestión de cuotas de socios · WeAthletics</p>
          </div>
          <GenerarCuotaClubButton athletes={athletes || []} />
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Atletas activos', value: String(athletes?.length || 0), color: '#4BA3D9' },
            { label: 'Con pagos pendientes', value: String(athletesPending), color: athletesPending > 0 ? '#F59E0B' : '#3A4A70' },
            { label: 'Recaudado', value: `€${(totalPaid/100).toFixed(0)}`, color: '#10B981' },
            { label: 'Por cobrar', value: `€${(totalPending/100).toFixed(0)}`, color: totalPending > 0 ? '#EF4444' : '#3A4A70' },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '14px', padding: '16px 18px' }}>
              <div style={{ color: '#2A3550', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: s.color, letterSpacing: '-0.03em' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Lista por atleta */}
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(75,163,217,0.06)', backgroundColor: 'rgba(75,163,217,0.03)' }}>
            <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>Estado por atleta</p>
          </div>
          {athletes?.map((athlete, i) => {
            const athletePayments = byAthlete[athlete.id] || []
            const pending = athletePayments.filter(p => p.status !== 'paid')
            const paid = athletePayments.filter(p => p.status === 'paid')
            return (
              <div key={athlete.id} style={{ borderBottom: i < (athletes.length-1) ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                    {athlete.first_name[0]}{athlete.last_name[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600' }}>{athlete.first_name} {athlete.last_name}</div>
                    <div style={{ color: '#2A3550', fontSize: '11px' }}>{athlete.category || 'Sin categoría'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                      backgroundColor: pending.length > 0 ? 'rgba(245,158,11,0.1)' : paid.length > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)',
                      color: pending.length > 0 ? '#F59E0B' : paid.length > 0 ? '#10B981' : '#3A4A70',
                      border: `1px solid ${pending.length > 0 ? 'rgba(245,158,11,0.2)' : paid.length > 0 ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    }}>
                      {pending.length > 0 ? `${pending.length} pendiente${pending.length>1?'s':''}` : paid.length > 0 ? 'Al día' : 'Sin cuotas'}
                    </span>
                  </div>
                </div>
                {pending.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 20px 8px 66px', backgroundColor: 'rgba(245,158,11,0.03)', borderTop: '1px solid rgba(255,255,255,0.02)' }}>
                    <div style={{ flex: 1, color: '#4A5580', fontSize: '12px' }}>{p.concept}</div>
                    <div style={{ color: '#F0F4FF', fontSize: '13px', fontWeight: '700', fontFamily: 'monospace' }}>€{((p.amount_cents||0)/100).toFixed(0)}</div>
                    {p.due_date && <div style={{ color: '#3A4A70', fontSize: '11px' }}>Vence: {new Date(p.due_date+'T00:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'})}</div>}
                    <MarcarPagadoButton paymentId={p.id} />
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
