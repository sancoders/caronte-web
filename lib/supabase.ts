import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Si todavia no estan las variables, la web sigue andando en modo demostracion
// (con datos/ejemplo.json) en vez de romperse en la cara de la persona.
export const hayBase = Boolean(url && anon)

export const supabase = hayBase
  ? createClient(url as string, anon as string)
  : null
