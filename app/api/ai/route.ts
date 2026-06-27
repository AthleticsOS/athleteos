import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/app/lib/supabase'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(req: Request) {
  const { message, history } = await req.json()

  const { data: athletes } = await supabase.from('athletes').select('*')
  const { data: competitions } = await supabase.from('competitions').select('*')
  const { data: sessions } = await supabase.from('training_sessions').select('*')
  const { data: records } = await supabase.from('personal_records').select('*, athletes(first_name, last_name)')
  const { data: results } = await supabase.from('competition_results').select('*, athletes(first_name, last_name), competitions(name, date)')
  const { data: payments } = await supabase.from('payments').select('*, athletes(first_name, last_name)')
  const { data: groups } = await supabase.from('groups').select('*')

  const totalPaid = payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount_cents, 0) || 0
  const pendingPayments = payments?.filter(p => p.status === 'pending') || []
  const podios = results?.filter(r => r.position <= 3) || []

  const context = `
Eres el asistente IA de AthleteOS para el club deportivo WeAthletics.
Eres experto en atletismo, rendimiento deportivo, planificación de entrenamientos y gestión de clubes.
Conoces todos los datos del club en tiempo real y respondes siempre en español.

═══ CLUB ═══
Nombre: WeAthletics
País: España
Temporada: 2024-2025

═══ DEPORTISTAS (${athletes?.length || 0}) ═══
${athletes?.map(a => `• ${a.first_name} ${a.last_name} | ${a.sport} | ${a.category} | ${a.gender === 'male' ? 'M' : 'F'} | ${a.status}`).join('\n')}

═══ GRUPOS (${groups?.length || 0}) ═══
${groups?.map(g => `• ${g.name} | ${g.category} | ${g.season}`).join('\n') || 'Sin grupos'}

═══ MARCAS PERSONALES ═══
${records?.map(r => `• ${r.athletes?.first_name} ${r.athletes?.last_name}: ${r.discipline} → ${r.mark} (${r.competition}, ${r.date ? new Date(r.date).toLocaleDateString('es-ES') : ''})`).join('\n') || 'Sin marcas registradas'}

═══ COMPETICIONES (${competitions?.length || 0}) ═══
${competitions?.map(c => `• ${c.name} | ${c.location} | ${c.date} | ${c.level} | ${c.status}`).join('\n') || 'Sin competiciones'}

═══ RESULTADOS EN COMPETICIÓN ═══
${results?.map(r => `• ${r.athletes?.first_name} ${r.athletes?.last_name}: ${r.discipline} → ${r.mark} | Pos. ${r.position} | ${r.competitions?.name} (${r.competitions?.date ? new Date(r.competitions.date).toLocaleDateString('es-ES') : ''})`).join('\n') || 'Sin resultados'}

═══ PODIOS CONSEGUIDOS: ${podios.length} ═══
${podios.map(r => `• Pos. ${r.position} — ${r.athletes?.first_name} ${r.athletes?.last_name} en ${r.discipline} (${r.mark})`).join('\n') || 'Sin podios'}

═══ ENTRENAMIENTOS (${sessions?.length || 0}) ═══
${sessions?.map(s => `• ${s.title} | ${s.date} | ${s.type} | ${s.duration_min}min | ${s.location}`).join('\n') || 'Sin sesiones'}

═══ FINANZAS ═══
Total cobrado: €${(totalPaid / 100).toFixed(2)}
Pagos pendientes: ${pendingPayments.length}
${pendingPayments.map(p => `• ${p.athletes?.first_name} ${p.athletes?.last_name}: €${(p.amount_cents / 100).toFixed(2)} — ${p.concept}`).join('\n')}

═══ TU ROL ═══
Puedes ayudar con:
- Análisis de rendimiento deportivo y recomendaciones personalizadas
- Generación de planes de entrenamiento basados en los datos reales
- Redacción de avisos, convocatorias y comunicados del club
- Análisis de progresión de marcas y predicciones
- Consejos técnicos específicos por disciplina
- Resúmenes de temporada y estadísticas
- Gestión y administración del club

Sé directo, útil y conciso. Cuando generes planes de entrenamiento o avisos, hazlos listos para usar.
`

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: context,
    messages: [
      ...history.map((m: {role: string, content: string}) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: message }
    ]
  })

  const reply = response.content[0].type === 'text' ? response.content[0].text : ''

  return Response.json({ reply })
}