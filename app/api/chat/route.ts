import Anthropic from '@anthropic-ai/sdk'
import { MODELO } from '@/lib/modelo'

export const maxDuration = 60

// Precio de claude-sonnet-5, en dolares por millon de tokens. Igual que analizador/costo.py.
const ENTRADA = 2.0
const SALIDA = 10.0

const SYSTEM = `Sos Caronte, el copiloto que acompaña a alguien a publicar su app.

La app la hizo escribiéndole a una IA (Lovable, Bolt, v0, Claude Code, Cursor). La persona
que te escribe NO es programadora: no sabe qué es RLS, ni una variable de entorno, ni un DNS.

Te paso el análisis completo de SU app: los problemas que encontramos y el plan que le armamos.
Contestá sobre esa app, con los nombres reales de sus tablas, sus archivos y sus pantallas.
Nunca contestes en general si podés contestar sobre lo suyo.

Cómo escribís:
- Español rioplatense, de vos. Cortito. Dos o tres párrafos como mucho.
- Si una palabra necesita explicación, no la uses. En vez de "las políticas RLS protegen los
  datos", decí "hoy cualquiera que abra tu app puede bajarse la lista con los teléfonos de
  tus clientas".
- Si te pide instrucciones, dáselas numeradas y con los clics exactos que tiene que hacer.
- No la retes ni la hagas sentir tonta: la app la escribió una IA, no es culpa suya.
  El tono es "dale, yo te cruzo".
- Nada de markdown con asteriscos ni almohadillas. Texto derecho.
- Si te pregunta algo que no está en el análisis, decí que eso no lo miraste, en vez de inventar.`

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      'Todavía no está cargada la clave de la API de Claude. En local va en ' +
      'caronte-web/.env.local; en Vercel, en Settings y despues Environment Variables.',
      { status: 503 },
    )
  }

  const { mensajes, analisis } = await req.json()

  const cliente = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const contexto = JSON.stringify(
    { app: analisis?.app, problemas: analisis?.problemas, plan: analisis?.plan },
    null,
    1,
  )

  const stream = new ReadableStream({
    async start(controlar) {
      const codificar = new TextEncoder()
      try {
        const respuesta = cliente.messages.stream({
          model: MODELO,
          max_tokens: 1200,
          system: [
            { type: 'text', text: SYSTEM },
            { type: 'text', text: `Este es el análisis de la app de la persona:\n${contexto}` },
          ],
          messages: mensajes,
        })
        let entrada = 0
        let salida = 0
        for await (const evento of respuesta) {
          if (evento.type === 'content_block_delta' && evento.delta.type === 'text_delta') {
            controlar.enqueue(codificar.encode(evento.delta.text))
          }
          if (evento.type === 'message_start') entrada = evento.message.usage.input_tokens
          if (evento.type === 'message_delta') salida = evento.usage.output_tokens
        }
        // Queda en los logs del servidor. Todo lo que gasta el producto se mide, no se estima.
        const usd = (entrada * ENTRADA + salida * SALIDA) / 1_000_000
        console.log(
          `[costo] chat: ${entrada} tokens de entrada + ${salida} de salida = $${usd.toFixed(4)}`,
        )
        controlar.close()
      } catch (e) {
        controlar.enqueue(
          codificar.encode(`\n\nSe cortó la respuesta: ${(e as Error).message}`),
        )
        controlar.close()
      }
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}
