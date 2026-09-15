'use client'

import { useRef, useState } from 'react'
import type { Resultado } from '@/lib/tipos'

type Mensaje = { role: 'user' | 'assistant'; content: string }

// Las sugerencias salen de los datos reales del analisis. Si fueran genericas, el chat
// parece un widget de soporte y perdimos: la gracia es que ya sabe de TU app.
function sugerencias(datos: Resultado): string[] {
  const out: string[] = []
  const peor = datos.problemas[0]
  const caronte = datos.problemas.filter((p) => p.lo_arregla_caronte).length
  const primero = datos.plan[0]

  if (peor) out.push(`¿Por qué es tan grave "${peor.titulo.toLowerCase()}"?`)
  if (primero) out.push(`Explicame paso a paso cómo hago "${primero.titulo.toLowerCase()}"`)
  if (caronte) out.push(`¿Qué son las ${caronte} cosas que arreglás vos?`)
  out.push('¿Puedo publicarla igual así como está?')
  return out.slice(0, 4)
}

export function Chat({ datos }: { datos: Resultado }) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [texto, setTexto] = useState('')
  const [pensando, setPensando] = useState(false)
  const fin = useRef<HTMLDivElement>(null)

  async function mandar(pregunta: string) {
    if (!pregunta.trim() || pensando) return
    const nuevos: Mensaje[] = [...mensajes, { role: 'user', content: pregunta }]
    setMensajes(nuevos)
    setTexto('')
    setPensando(true)

    // El servidor corta a los 60 segundos. Si por lo que sea no contesta, cortamos
    // nosotros a los 70 y lo decimos: nada de quedarse en "Pensando..." para siempre.
    const cortar = new AbortController()
    const reloj = window.setTimeout(() => cortar.abort(), 70_000)

    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensajes: nuevos, analisis: datos }),
        signal: cortar.signal,
      })

      if (!r.ok || !r.body) {
        const msg = await r.text()
        setMensajes([...nuevos, { role: 'assistant', content: msg || 'No pude contestar.' }])
        setPensando(false)
        return
      }

      const lector = r.body.getReader()
      const decodificar = new TextDecoder()
      let acumulado = ''
      setMensajes([...nuevos, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await lector.read()
        if (done) break
        acumulado += decodificar.decode(value, { stream: true })
        setMensajes([...nuevos, { role: 'assistant', content: acumulado }])
        fin.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
    } catch (e) {
      const seColgo = (e as Error)?.name === 'AbortError'
      setMensajes([
        ...nuevos,
        {
          role: 'assistant',
          content: seColgo
            ? 'Tardé demasiado en contestarte y corté. Probá de nuevo, o preguntame algo más corto.'
            : 'Se cortó la conexión. Fijate si tenés internet y probá de nuevo.',
        },
      ])
    } finally {
      window.clearTimeout(reloj)
    }
    setPensando(false)
  }

  return (
    <section className="panel mt-12 p-7">
      <h2 className="text-xl font-semibold">Chateá con Caronte</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-[#b9b4cd]">
        Ya sabe de tu app. Preguntá lo que necesites o pedí ayuda con el plan.
      </p>

      {mensajes.length > 0 && (
        <div className="mt-7 space-y-4">
          {mensajes.map((m, i) => (
            <div
              key={i}
              className={
                m.role === 'user'
                  ? 'ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-acento/20 px-4 py-3 text-[15px] leading-relaxed'
                  : 'max-w-[92%] whitespace-pre-wrap text-[15px] leading-relaxed text-[#d6d2e6]'
              }
            >
              {m.content || (pensando ? 'Pensando…' : '')}
            </div>
          ))}
          <div ref={fin} />
        </div>
      )}

      {mensajes.length === 0 && (
        <div className="mt-6 flex flex-wrap gap-2.5">
          {sugerencias(datos).map((s) => (
            <button
              key={s}
              onClick={() => mandar(s)}
              className="rounded-xl border border-borde px-4 py-2.5 text-left text-sm text-[#b9b4cd] transition hover:border-acento/60 hover:text-[#ece9f6]"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); mandar(texto) }}
        className="mt-7 flex gap-2.5"
      >
        <input
          className="campo flex-1"
          placeholder="Escribí tu pregunta…"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <button className="boton px-6" disabled={pensando || !texto.trim()}>
          {pensando ? '…' : 'Enviar'}
        </button>
      </form>
    </section>
  )
}
