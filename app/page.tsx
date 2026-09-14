'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { Cabecera } from '@/componentes/Cabecera'

export default function Inicio() {
  const router = useRouter()
  const [repo, setRepo] = useState('')

  function seguir(e: React.FormEvent) {
    e.preventDefault()
    router.push(`/analizar?repo=${encodeURIComponent(repo.trim())}`)
  }

  return (
    <>
      <Cabecera />
      <main className="mx-auto w-full max-w-5xl px-5 pb-24">
        <div className="grid items-center gap-14 pt-10 md:grid-cols-[1.15fr_.85fr] md:pt-16">
          <div>
            <h1 className="text-[2.6rem] font-semibold leading-[1.07] tracking-tight sm:text-6xl">
              Tu app vibecodeada,
              <br />
              <span className="text-acentoSuave">a producción.</span>
            </h1>

            <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-[#b9b4cd]">
              Pegá el link de tu repo y te decimos qué le falta para que tu app se publique.
              Te armamos un plan y tenés una IA al lado para ayudarte.
            </p>

            <form onSubmit={seguir} className="mt-9 max-w-lg">
              <div className="flex gap-2.5">
                <div className="relative flex-1">
                  <svg
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                    width="18" height="18" viewBox="0 0 16 16" fill="#8e89a8" aria-hidden="true"
                  >
                    <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38l-.01-1.49c-2.23.48-2.7-1.07-2.7-1.07-.36-.93-.89-1.18-.89-1.18-.73-.5.05-.49.05-.49.81.06 1.23.83 1.23.83.72 1.23 1.89.87 2.35.67.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 014 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8 8 0 0016 8c0-4.42-3.58-8-8-8Z" />
                  </svg>
                  <input
                    className="campo pl-11"
                    placeholder="Pegá el link de tu repo de GitHub"
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                  />
                </div>
                <button className="boton px-5" disabled={!repo.trim()} aria-label="Empezar">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <Link
                href="/antes"
                className="mt-4 inline-block text-sm text-tenue underline underline-offset-4 transition hover:text-acentoSuave"
              >
                ¿No sabés qué es un repo?
              </Link>
            </form>
          </div>

          <div className="panel p-8">
            <p className="text-[4.2rem] font-semibold leading-none tracking-tighter text-acentoSuave">
              59%
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-[#b9b4cd]">
              de las apps publicadas con Lovable nunca se terminaron de publicar en serio.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-tenue">
              Medición propia sobre 54 apps que están hoy en internet.
            </p>

            <div className="mt-8 border-t border-borde pt-6">
              <Cruce />
              <p className="mt-3 text-xs text-tenue">De la idea a la publicación</p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

// El dibujito de las dos orillas. Decorativo, pero cuenta el producto en un vistazo.
function Cruce() {
  return (
    <svg viewBox="0 0 280 74" className="w-full" role="img" aria-label="De la idea a la publicación">
      <text x="0" y="12" fill="#8e89a8" fontSize="9">tu idea</text>
      <text x="228" y="12" fill="#a78bfa" fontSize="9">publicada</text>
      <path d="M6 30h44" stroke="#252239" strokeWidth="3" strokeLinecap="round" />
      <path d="M230 30h44" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" />
      <path d="M58 30h164" stroke="#252239" strokeWidth="1.5" strokeDasharray="4 5" />
      <circle cx="140" cy="30" r="9" fill="#8b5cf6" />
      <path d="M136 30h8m-3-3 3 3-3 3" stroke="#fff" strokeWidth="1.4"
            strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 52c14 6 28 6 42 0s28-6 42 0 28 6 42 0 28-6 42 0 28 6 42 0 28-6 42 0"
            stroke="#252239" strokeWidth="1.5" fill="none" />
    </svg>
  )
}
