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
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-white">Finanzas</h1>
            <p className="text-[#555] text-sm mt-1">Este mes · WeAthletics</p>
          </div>
          <a href="/finances/nuevo"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
            + Nuevo pago
          </a>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-5">
            <p className="text-[#444] text-xs uppercase tracking-widest mb-3">Total facturado</p>
            <p className="text-white text-2xl font-medium">€{(total / 100).toFixed(2)}</p>
          </div>
          <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-5">
            <p className="text-[#444] text-xs uppercase tracking-widest mb-3">Cobrado</p>
            <p className="text-green-400 text-2xl font-medium">€{(paid / 100).toFixed(2)}</p>
          </div>
          <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-5">
            <p className="text-[#444] text-xs uppercase tracking-widest mb-3">Pendiente</p>
            <p className="text-red-400 text-2xl font-medium">€{(pending / 100).toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-[#111] border border-[#1A1A1A] rounded-xl overflow-hidden">
          {payments && payments.length > 0 ? (
            payments.map((payment, index) => (
              <div key={payment.id}
                className={`flex items-center gap-4 px-6 py-4 ${
                  index < payments.length - 1 ? 'border-b border-[#161616]' : ''
                }`}>
                <div className="w-9 h-9 rounded-full bg-blue-600/15 text-blue-400 flex items-center justify-center text-xs font-medium flex-shrink-0">
                  {payment.athletes?.first_name?.[0]}{payment.athletes?.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium">
                    {payment.athletes?.first_name} {payment.athletes?.last_name}
                  </div>
                  <div className="text-[#555] text-xs mt-0.5">{payment.concept}</div>
                </div>
                <div className="text-white text-sm font-medium font-mono">
                  €{(payment.amount_cents / 100).toFixed(2)}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${
                  payment.status === 'paid' ? 'bg-green-500/10 text-green-500' :
                  payment.status === 'overdue' ? 'bg-red-500/10 text-red-400' :
                  'bg-amber-500/10 text-amber-400'
                }`}>
                  {payment.status === 'paid' ? 'Pagado' : payment.status === 'overdue' ? 'Vencido' : 'Pendiente'}
                </span>
              </div>
            ))
          ) : (
            <div className="px-6 py-16 text-center text-[#555]">
              No hay pagos registrados todavía
            </div>
          )}
        </div>
      </div>
    </main>
  )
}