'use client'

import { useEffect, useRef, useState } from 'react'
import type { Problema, Run } from '@/lib/tipos'
import { NOMBRE_EJE } from '@/lib/tipos'

// Esto tarda dos o tres minutos. La regla de esta pantalla: que SIEMPRE haya algo que se
// mueva. Si la persona mira diez segundos y nada cambia, asume que se colgo y se va.
// Por eso hay tres cosas moviendose a la vez: el reloj, la barra, y el renglon de lo que
// estamos haciendo ahora mismo.

const PASOS = [
  { estado: 'bajando', texto: 'Bajando tu código', piso: 6 },
  { estado: 'revisando', texto: 'Revisando los archivos', piso: 24 },
  { estado: 'levantando', texto: 'Levantando tu app', piso: 46 },
  { estado: 'probando', texto: 'Probándola en celular y en compu', piso: 58 },
  { estado: 'armando_plan', texto: 'Armando tu plan', piso: 86 },
]

const ORDEN = ['en_cola', 'bajando', 'revisando', 'levantando', 'probando', 'armando_plan', 'listo']

function reloj(segundos: number) {
  const m = Math.floor(segundos / 60)
  const s = Math.floor(segundos % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function Analizando({ run }: { run: Run }) {
  const actual = ORDEN.indexOf(run.estado)
  const problemas: Problema[] = run.resultado?.problemas ?? []
  const capturas = (run.resultado?.capturas ?? []).filter((c) => c.url.startsWith('http'))

  const [ahora, setAhora] = useState(() => Date.now())
  const cambio = useRef({ marca: Date.now(), señal: '' })

  // el reloj corre solo, aunque del otro lado no pase nada
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 500)
    return () => clearInterval(t)
  }, [])

  // cada vez que llega algo nuevo, anotamos cuando fue
  const señal = `${run.estado}|${run.paso}|${problemas.length}`
  if (señal !== cambio.current.señal) {
    cambio.current = { marca: Date.now(), señal }
  }

  const desde = new Date(run.creado).getTime()
  const transcurrido = Math.max(0, (ahora - desde) / 1000)
  const quieto = (ahora - cambio.current.marca) / 1000

  // La barra salta al piso del paso en curso y despues avanza de a poco hacia el
  // siguiente, sin llegar nunca. Nunca vuelve para atras y nunca miente diciendo que
  // termino algo que no termino.
  const i = Math.max(0, actual - 1)
  const piso = actual <= 0 ? 0 : (PASOS[i]?.piso ?? 0)
  const techo = PASOS[i + 1]?.piso ?? 98
  const avance = piso + (techo - piso) * (1 - Math.exp(-quieto / 22))

  const enCola = run.estado === 'en_cola'
  const demorado = quieto > 75

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-24 pt-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Analizando tu app</h1>
          <p className="mt-3 text-[#b9b4cd]">{run.repo_url.replace('https://github.com/', '')}</p>
        </div>
        <span className="rounded-lg border border-borde bg-[#0e0d18] px-3 py-1.5 font-mono text-sm tabular-nums text-acentoSuave">
          {reloj(transcurrido)}
        </span>
      </div>

      {/* la barra */}
      <div className="mt-7 h-2 w-full overflow-hidden rounded-full bg-[#0e0d18]">
        <div
          className="h-full rounded-full bg-acento transition-[width] duration-700 ease-out"
          style={{ width: `${Math.min(avance, 98)}%` }}
        />
      </div>

      {/* lo que estamos haciendo justo ahora */}
      <p className="mt-4 flex items-center gap-2.5 text-[15px] text-[#d6d2e6]">
        <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-acento border-t-transparent" />
        {run.paso ?? 'Esperando turno'}
      </p>

      {enCola && quieto > 25 && (
        <div className="panel mt-5 p-5 text-sm leading-relaxed text-[#b9b4cd]">
          Todavía no lo agarró nadie. El analizador corre aparte de la web: si lo estás
          probando en tu máquina, fijate que esté levantado con{' '}
          <code className="rounded bg-[#0e0d18] px-1.5 py-0.5 text-acentoSuave">
            python analizador/worker.py
          </code>
          .
        </div>
      )}

      {demorado && !enCola && (
        <p className="mt-3 text-sm text-tenue">
          Está tardando más de lo habitual, pero sigue andando. Tu app puede estar lenta
          para abrir.
        </p>
      )}

      <div className="mt-9 grid gap-6 md:grid-cols-2">
        <ol className="panel p-7">
          {PASOS.map((p) => {
            const indice = ORDEN.indexOf(p.estado)
            const hecho = actual > indice
            const enCurso = actual === indice
            return (
              <li key={p.estado} className="border-b border-borde/60 py-3.5 last:border-0">
                <div className="flex items-center gap-3.5">
                  <Marca hecho={hecho} enCurso={enCurso} />
                  <span className={hecho || enCurso ? 'text-[#ece9f6]' : 'text-tenue'}>
                    {p.texto}
                  </span>
                  <span className="ml-auto shrink-0 text-xs text-tenue">
                    {hecho ? 'Listo' : enCurso ? 'Ahora' : 'Pendiente'}
                  </span>
                </div>
                {enCurso && run.paso && (
                  <p className="ml-[38px] mt-1.5 text-[13px] leading-snug text-tenue">
                    {run.paso}
                  </p>
                )}
              </li>
            )
          })}
        </ol>

        <div className="panel p-7">
          <div className="flex items-baseline justify-between">
            <h2 className="font-medium">Problemas encontrados</h2>
            {problemas.length > 0 && (
              <span className="text-sm tabular-nums text-acentoSuave">{problemas.length}</span>
            )}
          </div>

          {problemas.length === 0 ? (
            <p className="mt-5 text-sm leading-relaxed text-tenue">
              Todavía no encontramos nada. Van a ir apareciendo acá a medida que revisamos.
            </p>
          ) : (
            <ul className="mt-5 space-y-3.5">
              {problemas.map((p) => (
                <li key={p.id} className="border-b border-borde pb-3.5 last:border-0">
                  <p className="text-[15px] leading-snug">{p.titulo}</p>
                  <p className="mt-1.5 text-xs text-tenue">{NOMBRE_EJE[p.eje]}</p>
                </li>
              ))}
            </ul>
          )}

          {capturas.length > 0 && (
            <div className="mt-6 border-t border-borde pt-5">
              <p className="text-xs text-tenue">
                Fotos que le sacamos a tu app: {capturas.length}
              </p>
              <div className="mt-3 flex gap-2">
                {capturas.map((c) => (
                  <img
                    key={`${c.ruta}-${c.pantalla}`}
                    src={c.url}
                    alt={`${c.ruta} en ${c.pantalla}`}
                    className="h-16 w-12 rounded border border-borde object-cover object-top"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="mt-8 text-sm text-tenue">
        Tarda entre 2 y 4 minutos. Podés dejar la pestaña abierta y volver después: no se pierde.
      </p>
    </main>
  )
}

function Marca({ hecho, enCurso }: { hecho: boolean; enCurso: boolean }) {
  if (hecho) {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-acento">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m5 13 4 4L19 7" stroke="#fff" strokeWidth="3.2"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }
  if (enCurso) {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-acento border-t-transparent" />
      </span>
    )
  }
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center">
      <span className="h-2 w-2 rounded-full bg-borde" />
    </span>
  )
}
