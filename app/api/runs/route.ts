import { NextResponse } from 'next/server'
import { supabase, hayBase } from '@/lib/supabase'
import { chequearRepo, MOTIVO } from '@/lib/repo'

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
  return NextResponse.json({ id: data.id })
}
