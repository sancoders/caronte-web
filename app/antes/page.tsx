'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Cabecera } from '@/componentes/Cabecera'

const HERRAMIENTAS = ['Lovable', 'Bolt', 'v0', 'Claude Code', 'Cursor', 'Otra']
const EN_GITHUB = ['Sí', 'No', 'No sé qué es eso'] as const

// Los pasos para llegar al repo cambian segun con que hizo la app. Lovable tiene un
// boton que lo hace solo; en las demas hay que subirlo a mano.
const GUIA: Record<string, string[]> = {
  Lovable: [
    'Abrí tu proyecto en Lovable y buscá el botón de GitHub, arriba a la derecha.',
    'Tocá "Connect to GitHub" y autorizá. Te va a pedir entrar con tu cuenta de GitHub; si no tenés, la creás ahí mismo, es gratis.',
    'Listo: Lovable crea el repositorio solo. Copiá el link que te queda y pegalo acá.',
  ],
  Bolt: [
    'En Bolt, arriba a la derecha, tocá el ícono de GitHub y después "Push to GitHub".',
    'Autorizá con tu cuenta de GitHub y elegí un nombre para el repositorio.',
    'Copiá el link que te queda y pegalo acá.',
  ],
  v0: [
    'En v0 abrí tu proyecto y tocá los tres puntitos, arriba a la derecha.',
    'Elegí "Push to GitHub" y autorizá con tu cuenta.',
    'Copiá el link que te queda y pegalo acá.',
  ],
  otra: [
    'Creá una cuenta gratis en github.com si todavía no tenés.',
    'Descargá GitHub Desktop, que es gratis y no hace falta escribir comandos.',
    'Abrí GitHub Desktop, elegí "Add existing repository" y buscá la carpeta de tu app.',
    'Tocá "Publish repository". Copiá el link que te queda y pegalo acá.',
  ],
}

export default function Antes() {
  const router = useRouter()
  const [herramienta, setHerramienta] = useState('')
  const [enGithub, setEnGithub] = useState<string>('')

  const necesitaGuia = enGithub === 'No' || enGithub === 'No sé qué es eso'
  const guia = GUIA[herramienta] ?? GUIA.otra
  const listo = herramienta && enGithub

  return (
    <>
      <Cabecera paso={2} />
      <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-6">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Antes de empezar</h1>
        <p className="mt-3 text-[#b9b4cd]">
          Dos preguntas cortas y arrancamos.
        </p>

        <section className="mt-10">
          <h2 className="text-lg font-medium">¿Con qué hiciste tu app?</h2>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {HERRAMIENTAS.map((h) => (
              <button
                key={h}
                onClick={() => setHerramienta(h)}
                className={`rounded-xl border px-5 py-3 text-[15px] transition ${
                  herramienta === h
                    ? 'border-acento bg-acento/15 text-[#ece9f6]'
                    : 'border-borde text-[#b9b4cd] hover:border-acento/50'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-medium">¿Ya está en GitHub?</h2>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {EN_GITHUB.map((o) => (
              <button
                key={o}
                onClick={() => setEnGithub(o)}
                className={`rounded-xl border px-5 py-3 text-[15px] transition ${
                  enGithub === o
                    ? 'border-acento bg-acento/15 text-[#ece9f6]'
                    : 'border-borde text-[#b9b4cd] hover:border-acento/50'
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </section>

        {necesitaGuia && (
          <section className="panel mt-10 p-7">
            <h3 className="text-lg font-medium">
              {herramienta
                ? `Cómo subir tu app de ${herramienta} a GitHub`
                : 'Cómo subir tu app a GitHub'}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#b9b4cd]">
              GitHub es donde vive el código de tu app. Lo necesitamos para poder mirarlo.
              Es gratis y no hace falta saber programar.
            </p>
            <ol className="mt-6 space-y-4">
              {guia.map((p, i) => (
                <li key={i} className="flex gap-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-acento/20 text-sm text-acentoSuave">
                    {i + 1}
                  </span>
                  <span className="text-[15px] leading-relaxed text-[#d6d2e6]">{p}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <button
          className="boton mt-10"
          disabled={!listo}
          onClick={() =>
            router.push(`/analizar?hecha_con=${encodeURIComponent(herramienta)}`)
          }
        >
          Siguiente
        </button>
      </main>
    </>
  )
}
