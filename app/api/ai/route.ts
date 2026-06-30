import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/app/lib/supabase'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function buildSystemPrompt(role: string, data: {
  athletes: any[], competitions: any[], records: any[], results: any[],
  payments: any[], sessions: any[], wellness: any[], injuries: any[]
}) {
  const { athletes, competitions, records, results, payments, sessions, wellness, injuries } = data

  const totalPaid = payments?.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount_cents, 0) || 0
  const pendingPayments = payments?.filter(p => p.status !== 'paid') || []
  const podios = results?.filter(r => r.position <= 3) || []
  const activeInjuries = injuries?.filter(i => !i.end_date) || []

  const clubData = `
═══ CLUB ═══
Nombre: WeAthletics · Madrid · Temporada 2024-2025
Deportistas activos: ${athletes?.length || 0}

═══ DEPORTISTAS ═══
${athletes?.map(a => `• ${a.first_name} ${a.last_name} | ${a.sport} | ${a.category} | ${a.status}`).join('\n') || 'Sin datos'}

═══ MARCAS PERSONALES ═══
${records?.map(r => `• ${r.athletes?.first_name} ${r.athletes?.last_name}: ${r.discipline} → ${r.mark} (${r.date ? new Date(r.date).toLocaleDateString('es-ES') : ''})`).join('\n') || 'Sin marcas'}

═══ COMPETICIONES (${competitions?.length || 0}) ═══
${competitions?.slice(0, 20).map(c => `• ${c.name} | ${c.location} | ${c.date} | ${c.status}`).join('\n') || 'Sin competiciones'}

═══ RESULTADOS RECIENTES ═══
${results?.slice(0, 20).map(r => `• ${r.athletes?.first_name} ${r.athletes?.last_name}: ${r.discipline} ${r.mark} — Pos.${r.position} en ${r.competitions?.name}`).join('\n') || 'Sin resultados'}

═══ PODIOS: ${podios.length} ═══
${podios.slice(0, 10).map(r => `• Pos.${r.position} ${r.athletes?.first_name} ${r.athletes?.last_name} en ${r.discipline} (${r.mark})`).join('\n') || 'Sin podios'}

═══ LESIONES ACTIVAS: ${activeInjuries.length} ═══
${activeInjuries.map((i: any) => `• ${i.athletes?.first_name} ${i.athletes?.last_name}: ${i.type} (${i.body_part}) desde ${i.start_date}`).join('\n') || 'Sin lesiones activas'}
`

  const directorSystem = `Eres el asistente IA de AthleteOS, experto en gestión de clubes de atletismo.
Tienes acceso completo a todos los datos de WeAthletics y respondes al DIRECTOR del club.

Formato de respuesta:
- Usa **negrita** para destacar nombres, marcas y datos clave
- Usa listas con "•" para enumerar elementos
- Usa secciones con "## Título" cuando la respuesta tenga varias partes
- Sé directo y ejecutivo: el director quiere resúmenes y decisiones, no explicaciones largas
- Incluye siempre datos reales del club cuando sean relevantes
- Para planes de entrenamiento, usa formato tabla: Ejercicio | Series | Repeticiones | Descanso
- Responde SIEMPRE en español

Puedes ayudar con: análisis de rendimiento, gestión financiera, planificación de temporada, redacción de comunicados, evaluación de atletas, toma de decisiones del club.

${clubData}

═══ FINANZAS ═══
Total cobrado: €${(totalPaid / 100).toFixed(2)}
Pagos pendientes: ${pendingPayments.length}
${pendingPayments.slice(0, 10).map((p: any) => `• ${p.athletes?.first_name} ${p.athletes?.last_name}: €${(p.amount_cents / 100).toFixed(2)} — ${p.concept}`).join('\n')}`

  const coachSystem = `Eres el asistente IA de AthleteOS, experto en atletismo y planificación del entrenamiento.
Estás hablando con el ENTRENADOR de WeAthletics.

Formato de respuesta:
- Usa **negrita** para destacar ejercicios, tiempos y datos técnicos clave
- Usa listas "•" para series, ejercicios y rutinas
- Para planes de entrenamiento usa este formato:
  ## Sesión: [nombre]
  **Calentamiento:** ...
  **Parte principal:**
  • Ejercicio 1 — X series × Y rep / Z descanso
  • Ejercicio 2 — ...
  **Vuelta a la calma:** ...
- Sé técnico y específico: el entrenador quiere metodología y detalles del ejercicio
- Incluye cargas, intensidades, RPE cuando sea relevante
- Responde SIEMPRE en español

Puedes ayudar con: diseño de sesiones, periodización, análisis de marcas, feedback técnico, tests físicos, prevención de lesiones, planificación semanal.

${clubData}

═══ SESIONES RECIENTES (${sessions?.length || 0}) ═══
${sessions?.slice(0, 15).map((s: any) => `• ${s.athletes?.first_name || ''} ${s.athletes?.last_name || ''}: ${s.exercise} | Esfuerzo ${s.effort}/10 | ${s.date}`).join('\n') || 'Sin sesiones'}`

  const athleteSystem = `Eres el asistente personal de AthleteOS para deportistas de WeAthletics.
Hablas directamente con un ATLETA del club. Eres cercano, motivador y empático.

Formato de respuesta:
- Usa **negrita** para destacar consejos clave y datos importantes
- Usa listas "•" para pasos y recomendaciones
- Sé cercano y motivador: habla de tú, usa lenguaje deportivo natural
- Para ejercicios usa: Ejercicio — X×Y (descanso Zs)
- Responde SIEMPRE en español
- Si preguntan sobre nutrición, recuperación o lesiones, sé prudente y recomienda consultar con el staff

Puedes ayudar con: técnica de carrera, nutrición deportiva, recuperación, motivación, preparación mental, calentamiento, análisis de su rendimiento.

Datos generales del club para contexto:
${clubData}

═══ BIENESTAR RECIENTE ═══
${wellness?.slice(0, 10).map((w: any) => `• ${w.date}: Sueño ${w.sleep}/10, Energía ${w.energy}/10, Estrés ${w.stress}/10`).join('\n') || 'Sin datos de bienestar'}`

  return role === 'coach' ? coachSystem : role === 'athlete' ? athleteSystem : directorSystem
}

export async function POST(req: Request) {
  const { message, history, role = 'director' } = await req.json()

  const [
    { data: athletes },
    { data: competitions },
    { data: records },
    { data: results },
    { data: payments },
    { data: sessions },
    { data: wellness },
    { data: injuries },
  ] = await Promise.all([
    supabase.from('athletes').select('id, first_name, last_name, sport, category, status').eq('status', 'active'),
    supabase.from('competitions').select('name, location, date, status').order('date', { ascending: false }).limit(30),
    supabase.from('personal_records').select('discipline, mark, date, athletes(first_name, last_name)').order('date', { ascending: false }).limit(40),
    supabase.from('competition_results').select('discipline, mark, position, athletes(first_name, last_name), competitions(name, date)').order('created_at', { ascending: false }).limit(30),
    supabase.from('payments').select('amount_cents, status, concept, athletes(first_name, last_name)'),
    supabase.from('athlete_sessions').select('exercise, effort, date, athletes(first_name, last_name)').order('date', { ascending: false }).limit(20),
    supabase.from('wellness_surveys').select('date, sleep, energy, stress, pain').order('date', { ascending: false }).limit(20),
    supabase.from('injury_records').select('type, body_part, start_date, end_date, athletes(first_name, last_name)').is('end_date', null),
  ])

  const systemPrompt = buildSystemPrompt(role, { athletes: athletes || [], competitions: competitions || [], records: records || [], results: results || [], payments: payments || [], sessions: sessions || [], wellness: wellness || [], injuries: injuries || [] })

  const stream = anthropic.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    system: systemPrompt,
    messages: [
      ...history.map((m: { role: string; content: string }) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: message }
    ]
  })

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(chunk.delta.text))
        }
      }
      controller.close()
    }
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' }
  })
}
