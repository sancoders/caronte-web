# caronte-web

Las 5 pantallas. Next.js 15 (App Router) + TypeScript + Tailwind.

Se construye contra `datos/ejemplo.json`, que es la fuente de verdad del formato.
El contrato con el analizador está en `../docs/contrato.md`.

## Levantarlo

```bash
npm install
cp .env.local.ejemplo .env.local   # y completá ANTHROPIC_API_KEY
npm run dev
```

Queda en http://localhost:3000.

### Las variables

| Variable | Para qué | ¿Hace falta? |
|---|---|---|
| `ANTHROPIC_API_KEY` | el chat copiloto | sí, si no el chat contesta que falta la clave |
| `NEXT_PUBLIC_SUPABASE_URL` | leer la tabla `runs` | sí |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | lo mismo | sí |

`.env.local` no se sube: está en el `.gitignore`. En Vercel las tres se cargan a mano
en Settings → Environment Variables.

## Las pantallas

| Ruta | Pantalla |
|---|---|
| `/` | 1. Inicio |
| `/antes` | 2. Antes de empezar |
| `/analizar` | 3. Pegar el link |
| `/run/[id]` | 4. Analizando, y 5. Resultado cuando termina |
| `/run/demo` | la 5 con `datos/ejemplo.json`, sin necesidad de base ni worker |

`/run/demo` es la que conviene para grabar si algo se cae: no depende de nada.

## Cómo corre un análisis de verdad

La web **no** analiza nada: deja una fila en la tabla `runs` y la mira. El que trabaja
es el worker, que corre aparte:

```bash
python ../analizador/worker.py
```

El worker lee `caronte-web/.env.local` para sacar las claves, así hay un solo lugar
donde ponerlas. Levanta lo que esté en cola, clona el repo, lo revisa, abre la app en
celular y en compu, arma el plan con Claude y escribe el resultado.

La pantalla 4 se actualiza sola: Supabase Realtime, y un poll cada 2 segundos por si
el socket se cae.

## Lo que falta

- No hay cuentas. Cualquiera puede pedir un análisis y ver el de cualquiera. Las
  políticas de `runs` hoy son `using (true)`; cuando haya login pasan a `user_id = auth.uid()`.
- Las capturas que saca el analizador quedan en disco. Todavía no se suben a Storage,
  así que `capturas[].url` es una ruta local y la web no las muestra.
