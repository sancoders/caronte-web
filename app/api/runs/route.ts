import { NextResponse } from 'next/server'
import { supabase, hayBase } from '@/lib/supabase'
import { chequearRepo, MOTIVO } from '@/lib/repo'

// El que hace el trabajo pesado no vive acá: corre en GitHub Actions, que levanta una
// máquina con navegador y todo. Esto le toca el timbre para que arranque ya mismo.
// Si no hay token igual funciona, pero el pedido espera hasta 5 minutos al reloj
// automático. Nunca hacemos fallar el análisis por esto: es una mejora, no un requisito.
const REPO_ANALIZADOR = 'sancoders/caronte-analizador'

async function tocarElTimbre() {
  const token = process.env.GITHUB_TOKEN_CARONTE
  if (!token) return 'sin token: arranca solo en menos de 5 minutos'
  try {
    const r = await fetch(
      `https://api.github.com/repos/${REPO_ANALIZADOR}/actions/workflows/analizar.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({ ref: 'main' }),
        signal: AbortSignal.timeout(8000),
      },
    )
    if (!r.ok) return `GitHub contestó ${r.status}: ${(await r.text()).slice(0, 120)}`
    return 'arrancando ahora'
  } catch (e) {
    return `no pude avisarle a GitHub: ${(e as Error).message}`
  }
}

// Crea el analisis. No lo corre: lo deja en cola en la tabla runs y el analizador
// lo levanta. La web nunca escribe nada mas que esto (ver docs/contrato.md).
export async function POST(req: Request) {
  const { repo_url, app_url, hecha_con } = await req.json()

  const chequeo = await chequearRepo(repo_url ?? '')
  if (!chequeo.ok) {
    return NextResponse.json({ error: MOTIVO[chequeo.motivo] }, { status: 400 })
  }

  if (!hayBase || !supabase) {
    return NextResponse.json(
      { error: 'Todavía no está conectada la base. Mirá el README de caronte-web.' },
      { status: 503 },
    )
  }

  const { data, error } = await supabase
    .from('runs')
    .insert({
      repo_url: chequeo.url,
      app_url: (app_url ?? '').trim() || null,
      hecha_con: hecha_con || null,
      estado: 'en_cola',
      paso: 'Esperando turno',
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Que quede en los logs si el timbre no sonó: si no, los análisis tardarían 5 minutos
  // en arrancar y nadie sabría por qué.
  const timbre = await tocarElTimbre()
  console.log(`[run ${data.id}] ${timbre}`)

  return NextResponse.json({ id: data.id })
}
