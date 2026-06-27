import { supabase } from '../lib/supabase'

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
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <a href="/dashboard" className="text-[#555] text-sm hover:text-white transition-colors">← Dashboard</a>
            <h1 className="text-3xl font-medium text-white mt-2">Finanzas</h1>
            <p className="text-[#555] text-sm">WeAthletics · Este mes</p>
          </div>
          <a href="/finances/nuevo" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + Nuevo pago
          </a>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-5">
            <p className="text-[#555] text-xs uppercase tracking-widest mb-3">Total facturado</p>
            <p className="text-white text-3xl font-medium">€{(total / 100).toFixed(2)}</p>
          </div>
          <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-5">
            <p className="text-[#555] text-xs uppercase tracking-widest mb-3">Cobrado</p>
            <p className="text-green-400 text-3xl font-medium">€{(paid / 100).toFixed(2)}</p>
          </div>
          <div className="bg-[#111] border border-[#1A1A1A] rounded-xl p-5">
            <p className="text-[#555] text-xs uppercase tracking-widest mb-3">Pendiente</p>
            <p className="text-red-400 text-3xl font-medium">€{(pending / 100).toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-[#111] border border-[#1A1A1A] rounded-xl overflow-hidden">
          <div className="grid grid-cols-4 px-6 py-3 border-b border-[#1A1A1A]">
            <span className="text-[#444] text-xs uppercase tracking-widest">Deportista</span>
            <span className="text-[#444] text-xs uppercase tracking-widest">Concepto</span>
            <span className="text-[#444] text-xs uppercase tracking-widest">Importe</span>
            <span className="text-[#444] text-xs uppercase tracking-widest">Estado</span>
          </div>
          {payments && payments.length > 0 ? (
            payments.map((payment) => (
              <div key={payment.id} className="grid grid-cols-4 px-6 py-4 border-b border-[#1A1A1A] hover:bg-[#141414] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-medium">
                    {payment.athletes?.first_name?.[0]}{payment.athletes?.last_name?.[0]}
                  </div>
                  <span className="text-white text-sm">{payment.athletes?.first_name} {payment.athletes?.last_name}</span>
                </div>
                <span className="text-[#888] text-sm self-center">{payment.concept}</span>
                <span className="text-white text-sm font-medium self-center font-mono">
                  €{(payment.amount_cents / 100).toFixed(2)}
                </span>
                <span className="self-center">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    payment.status === 'paid'
                      ? 'bg-green-500/10 text-green-400'
                      : payment.status === 'overdue'
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {payment.status === 'paid' ? 'Pagado' : payment.status === 'overdue' ? 'Vencido' : 'Pendiente'}
                  </span>
                </span>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center text-[#555]">
              No hay pagos registrados todavía
            </div>
          )}
        </div>
      </div>
    </main>
  )
}