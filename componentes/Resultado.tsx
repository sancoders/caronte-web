'use client'

import { useState } from 'react'
import { Anillo } from './Anillo'
import { Chat } from './Chat'
import type { Eje, Gravedad, Resultado as Datos } from '@/lib/tipos'
import { NOMBRE_EJE, NOMBRE_GRAVEDAD } from '@/lib/tipos'

const EJES: Eje[] = ['segura', 'funciona', 'usable', 'compartible']

const COLOR_GRAVEDAD: Record<Gravedad, string> = {
  critico: 'border-[#7f2c2c] bg-[#2a1618] text-[#f0a5a5]',
  alto: 'border-[#7a4a1d] bg-[#2a1f12] text-[#f3c08a]',
  medio: 'border-[#6b5a1e] bg-[#242013] text-[#ecd58c]',
  bajo: 'border-borde bg-[#17162a] text-[#a9a3c4]',
}

export function Resultado({ datos }: { datos: Datos }) {
  const { score, problemas, plan, app } = datos
  const sobre = score.sobre ?? 100
  const [hechos, setHechos] = useState<number[]>([])

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-24 pt-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{app.nombre}</h1>
      <p className="mt-3 text-[#b9b4cd]">
        {datos.resumen ??
          `Encontramos ${problemas.length} ${problemas.length === 1 ? 'cosa' : 'cosas'} para resolver antes de que tu app esté lista para que la use gente.`}
      </p>

      {/* Tu puntaje */}
      <section className="panel mt-9 flex flex-col items-center gap-9 p-7 sm:flex-row">
        <Anillo total={score.total} sobre={sobre} />
        <div className="grid w-full flex-1 gap-3 sm:grid-cols-2">
          {EJES.map((eje) => {
            const v = score[eje]
            return (
              <div key={eje} className="rounded-xl border border-borde bg-[#0e0d18] p-4">
                <p className="text-sm text-tenue">{NOMBRE_EJE[eje]}</p>
                {v === null || v === undefined ? (
                  <p className="mt-1.5 text-[15px] text-tenue">Sin medir</p>
                ) : (
                  <p className="mt-1 text-2xl font-semibold">{v}</p>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {score.ejes_medidos && score.ejes_medidos.length < 4 && (
        <p className="mt-4 text-sm leading-relaxed text-tenue">
          Hay ejes sin medir porque no nos pasaste el link de la app publicada. Pasanos el link
          y los medimos: abrimos tu app de verdad, en celular y en compu.
        </p>
      )}

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.25fr_1fr]">
        {/* Lo que le falta */}
        <section>
          <h2 className="text-xl font-semibold">Lo que le falta</h2>
          <ul className="mt-5 space-y-3.5">
            {problemas.map((p) => (
              <li key={p.id} className="panel p-5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`rounded-md border px-2.5 py-1 text-xs ${COLOR_GRAVEDAD[p.gravedad]}`}>
                    {NOMBRE_GRAVEDAD[p.gravedad]}
                  </span>
                  <span className="text-xs text-tenue">{NOMBRE_EJE[p.eje]}</span>
                </div>
                <p className="mt-3 text-[15px] font-medium leading-snug">{p.titulo}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#b9b4cd]">
                  <span className="text-tenue">Riesgo: </span>
                  {p.por_que_importa}
                </p>
                <div className="mt-3.5 flex flex-wrap items-center gap-3 text-xs text-tenue">
                  <code className="rounded bg-[#0e0d18] px-2 py-1">{p.donde}</code>
                  <span className={p.lo_arregla_caronte ? 'text-acentoSuave' : ''}>
                    {p.lo_arregla_caronte ? 'Caronte lo arregla' : 'Lo hacés vos'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Plan para publicar */}
        <section>
          <h2 className="text-xl font-semibold">Plan para publicar</h2>
          {plan.length === 0 ? (
            <p className="mt-5 text-sm leading-relaxed text-tenue">
              El plan todavía no está armado.
            </p>
          ) : (
            <ol className="mt-5 space-y-3">
              {plan.map((paso) => {
                const hecho = hechos.includes(paso.orden)
                return (
                  <li key={paso.orden} className="panel p-5">
                    <div className="flex items-start gap-3.5">
                      <button
                        onClick={() =>
                          setHechos((h) =>
                            hecho ? h.filter((x) => x !== paso.orden) : [...h, paso.orden],
                          )
                        }
                        aria-label={hecho ? 'Marcar como pendiente' : 'Marcar como hecho'}
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
                          hecho ? 'border-acento bg-acento' : 'border-borde hover:border-acento'
                        }`}
                      >
                        {hecho && (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="m5 13 4 4L19 7" stroke="#fff" strokeWidth="3.5"
                                  strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-tenue">{paso.orden}</span>
                          <span className={`text-[15px] font-medium ${hecho ? 'text-tenue line-through' : ''}`}>
                            {paso.titulo}
                          </span>
                          {paso.bloqueante && (
                            <span className="rounded-md border border-[#7f2c2c] bg-[#2a1618] px-2 py-0.5 text-xs text-[#f0a5a5]">
                              Bloqueante
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-[#b9b4cd]">{paso.por_que}</p>
                        <details className="group mt-3">
                          <summary className="cursor-pointer list-none text-xs text-acentoSuave">
                            Ver detalles del plan
                          </summary>
                          <ul className="mt-3 space-y-2">
                            {paso.pasos.map((x, i) => (
                              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-[#d6d2e6]">
                                <span className="text-tenue">·</span>
                                {x}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-3 text-xs text-tenue">
                            {paso.lo_hace_caronte ? 'Caronte lo arregla' : 'Lo hacés vos'}
                          </p>
                        </details>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </section>
      </div>

      <Chat datos={datos} />
    </main>
  )
}
