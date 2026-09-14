'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { Cabecera } from '@/componentes/Cabecera'
import { parsearRepo } from '@/lib/repo'

function Formulario() {
  const router = useRouter()
  const params = useSearchParams()

  const [repo, setRepo] = useState(params.get('repo') ?? '')
  const [appUrl, setAppUrl] = useState('')
  const [error, setError] = useState('')
  const [mandando, setMandando] = useState(false)

  const hechaCon = params.get('hecha_con') ?? ''
  const repoValido = Boolean(parsearRepo(repo))

  async function iniciar(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMandando(true)
    try {
      const r = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: repo, app_url: appUrl, hecha_con: hechaCon }),
      })
      const data = await r.json()
      if (!r.ok) {
        setError(data.error ?? 'Algo falló. Probá de nuevo.')
        setMandando(false)
        return
      }
      router.push(`/run/${data.id}`)
    } catch {
      setError('No pudimos conectarnos. Fijate si tenés internet y probá de nuevo.')
      setMandando(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-5 pb-24 pt-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Pegá el link</h1>

      <form onSubmit={iniciar} className="mt-10 space-y-7">
        <div>
          <label className="block text-[15px] font-medium">Link del repo de GitHub</label>
          <div className="relative mt-3">
            <input
              className="campo pr-11"
              placeholder="https://github.com/tu-usuario/tu-app"
              value={repo}
              onChange={(e) => { setRepo(e.target.value); setError('') }}
            />
            {repoValido && (
              <svg className="absolute right-4 top-1/2 -translate-y-1/2" width="18" height="18"
                   viewBox="0 0 24 24" fill="none" aria-label="Link válido" role="img">
                <path d="m5 13 4 4L19 7" stroke="#4ade80" strokeWidth="2.4"
                      strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          {repo.trim() && !repoValido && (
            <p className="mt-2.5 text-sm text-[#f0a5a5]">
              Ese link no parece de GitHub. Tiene que ser del estilo github.com/tu-usuario/tu-app.
            </p>
          )}
        </div>

        <div>
          <label className="block text-[15px] font-medium">
            Link de la app publicada <span className="font-normal text-tenue">· opcional</span>
          </label>
          <input
            className="campo mt-3"
            placeholder="https://tudominio.com"
            value={appUrl}
            onChange={(e) => setAppUrl(e.target.value)}
          />
          <p className="mt-2.5 text-sm text-tenue">
            Si ya está publicada, la abrimos de verdad en celular y en compu. Si no, revisamos
            el código igual.
          </p>
        </div>

        <div className="panel p-5 text-sm leading-relaxed text-[#b9b4cd]">
          Tarda entre 2 y 4 minutos. Después vas a ver el resultado con un plan paso a paso
          y la lista de problemas.
        </div>

        {error && (
          <div className="rounded-xl border border-[#5c2b2b] bg-[#2a1618] p-4 text-sm leading-relaxed text-[#f0a5a5]">
            {error}
          </div>
        )}

        <button className="boton w-full sm:w-auto" disabled={!repoValido || mandando}>
          {mandando ? 'Arrancando…' : 'Iniciar análisis'}
        </button>
      </form>
    </main>
  )
}

export default function Analizar() {
  return (
    <>
      <Cabecera paso={3} />
      <Suspense fallback={<div className="mx-auto max-w-2xl px-5 text-tenue">Cargando…</div>}>
        <Formulario />
      </Suspense>
    </>
  )
}
