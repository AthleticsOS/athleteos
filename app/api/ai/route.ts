import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '../../lib/supabase'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(req: Request) {
  const { message, history } = await req.json()

  const { data: athletes } = await supabase.from('athletes').select('*')
  const { data: competitions } = await supabase.from('competitions').select('*')
  const { data: sessions } = await supabase.from('training_sessions').select('*')
  const { data: records } = await supabase.from('personal_records').select('*')

  const context = `
Eres el asistente IA de AthleteOS para el club deportivo WeAthletics.
Conoces todos los datos del club en tiempo real.

DEPORTISTAS (${athletes?.length || 0}):
${athletes?.map(a => `- ${a.first_name} ${a.last_name} | ${a.sport} | ${a.category}`).join('\n')}

COMPETICIONES (${competitions?.length || 0}):
${competitions?.map(c => `- ${c.name} | ${c.location} | ${c.date} | ${c.status}`).join('\n')}

SESIONES DE ENTRENAMIENTO (${sessions?.length || 0}):
${sessions?.map(s => `- ${s.title} | ${s.date} | ${s.type} | ${s.duration_min}min`).join('\n')}

MARCAS PERSONALES:
${records?.map(r => `- Disciplina: ${r.discipline} | Marca: ${r.mark} | Competición: ${r.competition}`).join('\n')}

Responde siempre en español. Sé conciso y útil. Cuando generes entrenamientos o avisos, hazlos listos para usar directamente.
  `

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: context,
    messages: [
      ...history.map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ]
  })

  const reply = response.content[0].type === 'text' ? response.content[0].text : ''

  return Response.json({ reply })
}