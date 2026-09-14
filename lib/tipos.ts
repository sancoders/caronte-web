// La forma exacta esta en docs/contrato.md y en datos/ejemplo.json.
// Si cambia algo aca, tiene que cambiar tambien del lado del analizador.

export type Eje = 'segura' | 'funciona' | 'usable' | 'compartible'
export type Gravedad = 'critico' | 'alto' | 'medio' | 'bajo'

export type Problema = {
  id: string
  eje: Eje
  gravedad: Gravedad
  titulo: string
  donde: string
  por_que_importa: string
  lo_arregla_caronte: boolean
}

export type PasoDelPlan = {
  orden: number
  titulo: string
  bloqueante: boolean
  estado: string
  lo_hace_caronte: boolean
  por_que: string
  pasos: string[]
  problemas?: string[]
}

export type Captura = {
  ruta: string
  pantalla: 'celular' | 'compu'
  momento: string
  url: string
}

// Un eje que no se midio vale null, nunca un numero. Es la regla del proyecto:
// nunca mostramos que algo esta bien sin haberlo mirado.
export type Score = {
  total: number
  segura: number | null
  funciona: number | null
  usable: number | null
  compartible: number | null
  sobre?: number
  ejes_medidos?: Eje[]
}

export type Resultado = {
  version: number
  estado: string
  app: {
    nombre: string
    repo: string
    url: string
    hecha_con: string
    stack: string
    analizada_el: string
  }
  score: Score
  problemas: Problema[]
  plan: PasoDelPlan[]
  capturas: Captura[]
  resumen?: string
}

export type EstadoRun =
  | 'en_cola' | 'bajando' | 'revisando' | 'levantando'
  | 'probando' | 'armando_plan' | 'listo' | 'error'

export type Run = {
  id: string
  repo_url: string
  app_url: string | null
  hecha_con: string | null
  estado: EstadoRun
  paso: string | null
  score_total: number | null
  resultado: Resultado | null
  creado: string
}

export const NOMBRE_EJE: Record<Eje, string> = {
  segura: 'Es segura',
  funciona: 'Funciona de verdad',
  usable: 'Se puede usar',
  compartible: 'Se puede compartir',
}

export const NOMBRE_GRAVEDAD: Record<Gravedad, string> = {
  critico: 'Crítico',
  alto: 'Alto',
  medio: 'Medio',
  bajo: 'Bajo',
}
