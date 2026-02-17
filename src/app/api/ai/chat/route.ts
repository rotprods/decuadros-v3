// ═══ AI CHATBOT API ═══
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

// POST /api/ai/chat — AI chatbot with menu context
export async function POST(req: NextRequest) {
    const session = await auth()
    const body = await req.json()
    const { message } = body

    if (!message) return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 })

    // Fetch menu for context (RAG-lite)
    const menuItems = await db.menuItem.findMany({
        where: { active: true },
        include: { category: true },
    })

    const menuContext = menuItems.map(i =>
        `- ${i.name} (${i.category.name}): ${i.price}€ — ${i.description} [${i.allergens}]`
    ).join('\n')

    // If OpenAI key available, use it
    if (process.env.OPENAI_API_KEY) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: `Eres el asistente virtual de De Cuadros, un restaurante fusión en Alguazas, Murcia.
Tu personalidad: amable, conocedor de gastronomía, algo humorístico.
Horario: Jue-Dom 13:00-16:00 y 20:00-23:30.
Dirección: Calle Mayor 15, Alguazas, Murcia.
Reservas: 968 XX XX XX

CARTA ACTUAL:
${menuContext}

Reglas:
- Responde siempre en español
- Recomienda platos basándote en las preferencias del usuario
- Si preguntan por alérgenos, sé preciso
- Si no sabes algo, di que preguntarás al chef
- Sé conciso (max 150 palabras)`
                        },
                        { role: 'user', content: message }
                    ],
                    max_tokens: 300,
                    temperature: 0.7,
                }),
            })

            const data = await response.json()
            const reply = data.choices?.[0]?.message?.content || 'Hmm, no entendí eso. ¿Puedes reformularlo?'
            return NextResponse.json({ reply, source: 'ai' })
        } catch {
            // Fallback to local responses
        }
    }

    // Fallback: Smart local responses (no API key needed)
    const lowerMsg = message.toLowerCase()
    let reply = ''

    if (lowerMsg.includes('carta') || lowerMsg.includes('menú') || lowerMsg.includes('menu')) {
        const categories = [...new Set(menuItems.map(i => i.category.name))]
        reply = `🍽️ ¡Tenemos una carta increíble! Categorías: ${categories.join(', ')}. ` +
            `Te recomiendo: **${menuItems[0]?.name}** (${menuItems[0]?.price}€) — ${menuItems[0]?.description}`
    } else if (lowerMsg.includes('reserva') || lowerMsg.includes('mesa')) {
        reply = '📞 Para reservar, llama al 968 XX XX XX o escribe por WhatsApp. Horario: Jue-Dom 13:00-16:00 y 20:00-23:30.'
    } else if (lowerMsg.includes('horario') || lowerMsg.includes('abierto')) {
        reply = '🕐 Abrimos de Jueves a Domingo:\n• Almuerzo: 13:00 - 16:00\n• Cena: 20:00 - 23:30'
    } else if (lowerMsg.includes('alergi') || lowerMsg.includes('celiac') || lowerMsg.includes('intoler')) {
        reply = '⚕️ Todos nuestros platos tienen los alérgenos detallados en la carta. ¿Tienes alguna alergia específica? Te recomiendo platos seguros.'
    } else if (lowerMsg.includes('recomendar') || lowerMsg.includes('recomend') || lowerMsg.includes('mejor')) {
        const tops = menuItems.filter(i => i.badge?.includes('TOP') || i.badge?.includes('CHEF'))
        reply = `⭐ Mis recomendaciones del chef:\n${tops.map(t => `• **${t.name}** — ${t.price}€`).join('\n')}`
    } else if (lowerMsg.includes('precio') || lowerMsg.includes('caro') || lowerMsg.includes('barato')) {
        const sorted = [...menuItems].sort((a, b) => a.price - b.price)
        reply = `💰 Rango: ${sorted[0]?.price}€ – ${sorted[sorted.length - 1]?.price}€. El más accesible: **${sorted[0]?.name}** (${sorted[0]?.price}€)`
    } else if (lowerMsg.includes('hola') || lowerMsg.includes('buenas') || lowerMsg.includes('hey')) {
        reply = '¡Hola! 👋 Soy el asistente virtual de De Cuadros. ¿En qué puedo ayudarte? Puedo recomendarte platos, darte info sobre horarios, o ayudarte con tu pedido.'
    } else {
        reply = '🤔 No estoy seguro de entender. Puedo ayudarte con:\n• 📋 Ver la carta\n• ⭐ Recomendaciones\n• 📞 Reservas\n• 🕐 Horarios\n• ⚕️ Alérgenos\n\n¿Qué necesitas?'
    }

    return NextResponse.json({ reply, source: 'local' })
}
