import { supabase } from '@/app/lib/supabase'
import MarcarPagadoButton from '@/app/components/MarcarPagadoButton'

export default async function Finances() {
  const { data: payments } = await supabase
    .from('payments')
    .select('*, athletes(id, first_name, last_name)')
    .order('due_date', { ascending: false })

  const { data: athletes } = await supabase
    .from('athletes')
    .select('id, first_name, last_name')
    .order('first_name')

  const total = payments?.reduce((sum, p) => sum + (p.amount_cents || 0), 0) || 0
  const paid = payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount_cents || 0), 0) || 0
  const pending = payments?.filter(p => p.status !== 'paid').reduce((sum, p) => sum + (p.amount_cents || 0), 0) || 0
  const overdueCount = payments?.filter(p => p.status === 'overdue').length || 0

  // Agrupar pagos por atleta
  const byAthlete: Record<string, typeof payments> = {}
  athletes?.forEach(a => { byAthlete[a.id] = [] })
  payments?.forEach(p => {
    if (p.athlete_id && byAthlete[p.athlete_id]) byAthlete[p.athlete_id]!.push(p)
  })

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#06080F', padding: '28px 32px' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#F0F4FF', letterSpacing: '-0.03em', margin: 0 }}>Finanzas</h1>
            <p style={{ color: '#3A4A70', fontSize: '13px', marginTop: '6px' }}>Gestión de cuotas y pagos · WeAthletics</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a href="/finances/cuotas" style={{ padding: '9px 18px', borderRadius: '9px', backgroundColor: 'rgba(75,163,217,0.08)', border: '1px solid rgba(75,163,217,0.2)', color: '#4BA3D9', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>
              Cuotas del club
            </a>
            <a href="/finances/nuevo" style={{ padding: '9px 18px', borderRadius: '9px', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', color: 'white', fontSize: '13px', fontWeight: '600', textDecoration: 'none', boxShadow: '0 4px 16px rgba(75,163,217,0.2)' }}>
              + Nuevo pago
            </a>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Total facturado', value: `€${(total / 100).toFixed(0)}`, color: '#4BA3D9' },
            { label: 'Cobrado', value: `€${(paid / 100).toFixed(0)}`, color: '#10B981' },
            { label: 'Pendiente', value: `€${(pending / 100).toFixed(0)}`, color: pending > 0 ? '#F59E0B' : '#3A4A70' },
            { label: 'Pagos vencidos', value: String(overdueCount), color: overdueCount > 0 ? '#EF4444' : '#3A4A70' },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '14px', padding: '18px 20px' }}>
              <div style={{ color: '#2A3550', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: s.color, letterSpacing: '-0.03em' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Estado por atleta */}
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(75,163,217,0.06)', backgroundColor: 'rgba(75,163,217,0.03)' }}>
            <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>Estado de cuotas por atleta</p>
          </div>
          {athletes?.map((athlete, i) => {
            const athletePayments = byAthlete[athlete.id] || []
            const athletePaid = athletePayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount_cents, 0)
            const athletePending = athletePayments.filter(p => p.status !== 'paid').reduce((s, p) => s + p.amount_cents, 0)
            const hasOverdue = athletePayments.some(p => p.status === 'overdue')
            const allPaid = athletePayments.length > 0 && athletePayments.every(p => p.status === 'paid')
            const noPay = athletePayments.length === 0

            return (
              <div key={athlete.id} style={{ borderBottom: i < (athletes.length - 1) ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                    {athlete.first_name[0]}{athlete.last_name[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600' }}>{athlete.first_name} {athlete.last_name}</div>
                    <div style={{ color: '#2A3550', fontSize: '11px', marginTop: '2px' }}>
                      {noPay ? 'Sin pagos registrados' : `${athletePayments.length} pago${athletePayments.length !== 1 ? 's' : ''} · €${(athletePaid / 100).toFixed(0)} cobrado`}
                    </div>
                  </div>
                  {athletePending > 0 && (
                    <div style={{ color: hasOverdue ? '#EF4444' : '#F59E0B', fontSize: '13px', fontWeight: '700' }}>
                      €{(athletePending / 100).toFixed(0)} pendiente
                    </div>
                  )}
                  <span style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', flexShrink: 0,
                    backgroundColor: noPay ? 'rgba(255,255,255,0.04)' : allPaid ? 'rgba(16,185,129,0.1)' : hasOverdue ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                    color: noPay ? '#3A4A70' : allPaid ? '#10B981' : hasOverdue ? '#EF4444' : '#F59E0B',
                    border: `1px solid ${noPay ? 'rgba(255,255,255,0.06)' : allPaid ? 'rgba(16,185,129,0.2)' : hasOverdue ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
                  }}>
                    {noPay ? 'Sin pagos' : allPaid ? '● Al día' : hasOverdue ? '● Vencido' : '● Pendiente'}
                  </span>
                </div>

                {/* Detalle de pagos del atleta */}
                {athletePayments.length > 0 && (
                  <div style={{ paddingLeft: '70px', paddingRight: '20px', paddingBottom: '12px' }}>
                    {athletePayments.map(p => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '7px 12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '4px' }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ color: '#888', fontSize: '12px' }}>{p.concept}</span>
                          {p.due_date && <span style={{ color: '#2A3550', fontSize: '11px', marginLeft: '8px' }}>· vence {new Date(p.due_date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>}
                        </div>
                        <span style={{ color: '#CDD0E0', fontSize: '12px', fontWeight: '700', fontFamily: 'monospace' }}>€{(p.amount_cents / 100).toFixed(0)}</span>
                        {p.status !== 'paid' ? (
                          <MarcarPagadoButton paymentId={p.id} />
                        ) : (
                          <span style={{ color: '#10B981', fontSize: '11px', fontWeight: '600' }}>✓ Pagado</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Historial completo */}
        <div style={{ backgroundColor: '#0A0E1A', border: '1px solid rgba(75,163,217,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(75,163,217,0.06)' }}>
            <p style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '600', margin: 0 }}>Historial de pagos</p>
          </div>
          {payments && payments.length > 0 ? payments.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 20px', borderBottom: i < payments.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#1E2A5E,#4BA3D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                {p.athletes?.first_name?.[0]}{p.athletes?.last_name?.[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#CDD0E0', fontSize: '13px', fontWeight: '500' }}>{p.athletes?.first_name} {p.athletes?.last_name}</div>
                <div style={{ color: '#2A3550', fontSize: '11px', marginTop: '1px' }}>{p.concept}</div>
              </div>
              <div style={{ color: '#F0F4FF', fontSize: '14px', fontWeight: '700', fontFamily: 'monospace' }}>€{(p.amount_cents / 100).toFixed(0)}</div>
              <span style={{
                padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', flexShrink: 0,
                backgroundColor: p.status === 'paid' ? 'rgba(16,185,129,0.1)' : p.status === 'overdue' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                color: p.status === 'paid' ? '#10B981' : p.status === 'overdue' ? '#EF4444' : '#F59E0B',
                border: `1px solid ${p.status === 'paid' ? 'rgba(16,185,129,0.2)' : p.status === 'overdue' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
              }}>
                {p.status === 'paid' ? '● Pagado' : p.status === 'overdue' ? '● Vencido' : '● Pendiente'}
              </span>
            </div>
          )) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#2A3550', fontSize: '13px' }}>No hay pagos registrados todavía</div>
          )}
        </div>

      </div>
    </main>
  )
}
