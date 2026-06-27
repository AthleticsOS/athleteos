import { supabase } from '@/app/lib/supabase'

export default async function Finances() {
  const { data: payments } = await supabase
    .from('payments')
    .select('*, athletes(first_name, last_name)')
    .order('due_date', { ascending: false })

  const total = payments?.reduce((sum, p) => sum + (p.amount_cents || 0), 0) || 0
  const paid = payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount_cents || 0), 0) || 0
  const pending = payments?.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount_cents || 0), 0) || 0

  return (
    <main style={{minHeight:'100vh', backgroundColor:'#080808', padding:'32px 36px'}}>
      <div style={{maxWidth:'1000px', margin:'0 auto'}}>

        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'32px'}}>
          <div>
            <h1 style={{fontSize:'24px', fontWeight:'700', color:'#F0F0F0', letterSpacing:'-0.02em', margin:0}}>Finanzas</h1>
            <p style={{color:'#333', fontSize:'13px', marginTop:'6px'}}>Este mes · WeAthletics</p>
          </div>
          <a href="/finances/nuevo" style={{
            padding:'9px 16px', borderRadius:'9px',
            background:'linear-gradient(135deg, #6366F1, #8B5CF6)',
            color:'white', fontSize:'13px', fontWeight:'600',
            boxShadow:'0 0 20px rgba(99,102,241,0.3)',
          }}>
            + Nuevo pago
          </a>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'16px'}}>
          {[
            { label:'Total facturado', value:`€${(total/100).toFixed(2)}`, color:'#888' },
            { label:'Cobrado', value:`€${(paid/100).toFixed(2)}`, color:'#10B981' },
            { label:'Pendiente', value:`€${(pending/100).toFixed(2)}`, color: pending > 0 ? '#EF4444' : '#333' },
          ].map(stat => (
            <div key={stat.label} style={{
              backgroundColor:'#0E0E0E',
              border:'1px solid rgba(255,255,255,0.06)',
              borderRadius:'14px', padding:'20px',
            }}>
              <div style={{color:'#333', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'10px'}}>{stat.label}</div>
              <div style={{fontSize:'26px', fontWeight:'700', color:stat.color, letterSpacing:'-0.02em'}}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div style={{backgroundColor:'#0E0E0E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden'}}>
          <div style={{padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
            <p style={{color:'#888', fontSize:'13px', fontWeight:'500', margin:0}}>Historial de pagos</p>
          </div>
          {payments && payments.length > 0 ? (
            payments.map((payment, index) => (
              <div key={payment.id} style={{
                display:'flex', alignItems:'center', gap:'14px',
                padding:'14px 20px',
                borderBottom: index < payments.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
              }}>
                <div style={{
                  width:'36px', height:'36px', borderRadius:'50%', flexShrink:0,
                  background:'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25))',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'12px', fontWeight:'600', color:'#A5B4FC',
                }}>
                  {payment.athletes?.first_name?.[0]}{payment.athletes?.last_name?.[0]}
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{color:'#CCC', fontSize:'13px', fontWeight:'500'}}>
                    {payment.athletes?.first_name} {payment.athletes?.last_name}
                  </div>
                  <div style={{color:'#333', fontSize:'11px', marginTop:'2px'}}>{payment.concept}</div>
                </div>
                <div style={{color:'#E0E0E0', fontSize:'14px', fontWeight:'700', fontFamily:'monospace'}}>
                  €{(payment.amount_cents/100).toFixed(2)}
                </div>
                <span style={{
                  padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600', flexShrink:0,
                  backgroundColor: payment.status === 'paid' ? 'rgba(16,185,129,0.1)' : payment.status === 'overdue' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                  color: payment.status === 'paid' ? '#10B981' : payment.status === 'overdue' ? '#EF4444' : '#F59E0B',
                  border: `1px solid ${payment.status === 'paid' ? 'rgba(16,185,129,0.2)' : payment.status === 'overdue' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
                }}>
                  {payment.status === 'paid' ? '● Pagado' : payment.status === 'overdue' ? '● Vencido' : '● Pendiente'}
                </span>
              </div>
            ))
          ) : (
            <div style={{padding:'60px 20px', textAlign:'center', color:'#333', fontSize:'13px'}}>
              No hay pagos registrados todavía
            </div>
          )}
        </div>
      </div>
    </main>
  )
}