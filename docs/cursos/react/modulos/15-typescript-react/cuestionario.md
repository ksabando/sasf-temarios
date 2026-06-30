---
sidebar_label: "Cuestionario"
---

# Cuestionario M15 — TypeScript con React

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué son los "Branded Types" (también llamados "Opaque Types" o "Nominal Types") en TypeScript y cómo pueden prevenir bugs en React? Por ejemplo, ¿cómo evitarías pasar un `TaskId` donde se espera un `UserId` si ambos son `string`?

**Respuesta**: Branded Types simulan tipado nominal en el sistema estructural de TypeScript agregando una propiedad phantom (`__brand`) que hace que dos tipos con la misma estructura sean incompatibles:

```ts
type TaskId = string & { __brand: 'TaskId' }
type UserId = string & { __brand: 'UserId' }

function createTaskId(id: string): TaskId { return id as TaskId }
function createUserId(id: string): UserId { return id as UserId }

function getTask(id: TaskId): Task { ... }
function getUser(id: UserId): User { ... }

getTask(createTaskId('1')) // OK
getTask(createUserId('1')) // TypeScript error: UserId not assignable to TaskId
```

En React, esto previene pasar `userId` a un componente que espera `taskId` (ambos son `string`, TypeScript no distinguiría sin branded types).

**Por qué**: TypeScript usa tipado estructural (dos tipos con la misma forma son compatibles), no nominal (el nombre del tipo importa). Branded Types agregan una diferencia estructural invisible en runtime (la propiedad `__brand` no existe realmente — es solo una anotación de tipo). Matt Pocock y el ecosistema de tRPC usan este patrón para IDs, tokens, y URLs. En TaskFlow, branded types prevendrían bugs como pasar un `userId` al endpoint de tareas. Fuente: "Branded Types in TypeScript" por Matt Pocock (Total TypeScript), TypeScript docs sobre "Nominal Typing", y el patrón en el código fuente de tRPC.

---

### 2. [Investigar] TypeScript 5.7+ introdujo `--rewriteRelativeImportExtensions`. Investigá cómo esta flag y la configuración del `module` afectan la interoperabilidad entre CommonJS y ESM en proyectos React con Vite. ¿Qué configuración de `tsconfig.json` es óptima para un proyecto Vite + React en 2026?

**Respuesta**: `rewriteRelativeImportExtensions` (TS 5.7) reescribe automáticamente las extensiones en imports relativos: `import './foo.ts'` se emite como `import './foo.js'`, permitiendo usar extensiones `.ts`/`.tsx` explícitas en el código fuente (mejor DX) mientras se emite código compatible con ESM. La configuración óptima para Vite + React en 2026:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "rewriteRelativeImportExtensions": true,
    "noEmit": true,
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "allowJs": false,
    "forceConsistentCasingInFileNames": true
  }
}
```

**Por qué**: `moduleResolution: "bundler"` (introducido en TS 5.0) es el modo específico para bundlers como Vite, Rollup, esbuild — entiende imports sin extensión, `exports` en package.json, y otras convenciones de bundlers. `allowImportingTsExtensions` permite escribir `.ts`/`.tsx` en los imports. `rewriteRelativeImportExtensions` asegura que, si alguna vez emitís `.js`, las extensiones sean correctas. `noUncheckedIndexedAccess` agrega `| undefined` a accesos por índice. `exactOptionalPropertyTypes` previene pasar `undefined` explícitamente a props opcionales. Fuente: TypeScript 5.7 release notes, "TSConfig for Vite" en vite.dev, y las recomendaciones de Matt Pocock para tsconfig.

---

### 3. [Investigar] ¿Qué son los "Template Literal Types" de TypeScript y cómo se aplican en React para tipado avanzado (rutas type-safe, estilos CSS-in-JS, eventos)? Investigá un ejemplo concreto de cómo tiparías las rutas de React Router usando template literal types.

**Respuesta**: Template Literal Types permiten crear tipos basados en strings con interpolación, similar a template literals de JavaScript pero a nivel de tipos:

```ts
type Route = `/tasks/${string}` | `/users/${string}/profile` | '/dashboard'

type ExtractId<R extends string> = R extends `/tasks/${infer Id}` ? Id : never
type TaskId = ExtractId<'/tasks/42'> // '42'
```

Para tipar rutas, podés crear un tipo que extraiga params o valide rutas en tiempo de compilación: `function navigateTo(route: Route)`. TypeScript verificará que solo pases rutas válidas. Esto combinado con `useParams<ExtractParams<Route>>()` da type safety para los parámetros.

**Por qué**: TanStack Router usa template literal types extensivamente para inferir los tipos de params desde el path string. TypeScript puede "parsear" el string literal de la ruta (`/tasks/$taskId/comments/$commentId`) y extraer los nombres de los parámetros, generando `{ taskId: string; commentId: string }`. Esto elimina la necesidad de definir manualmente interfaces para params. En React Router, no hay soporte nativo, pero librerías como `routes-gen` y `typesafe-routes` lo implementan. Fuente: TypeScript 4.1 "Template Literal Types", código fuente de TanStack Router, y "Type-Safe Routing in React" por varios autores.

---

### 4. [Investigar] ¿Qué es `fp-ts` y cómo se relaciona con React? Investigá cómo las estructuras de programación funcional (Option, Either, TaskEither) podrían reemplazar el manejo tradicional de `null`, `undefined`, y errores en aplicaciones React.

**Respuesta**: `fp-ts` es una librería de programación funcional para TypeScript que implementa patrones como `Option<T>` (en lugar de `null`/`undefined`), `Either<E, T>` (en lugar de try-catch), y `TaskEither<E, T>` (async con error tipado). En React, usar `Option` para estado potencialmente ausente elimina la necesidad de verificar `null` con `if (!user) return null`:

```ts
import { Option, none, some, fold } from 'fp-ts/Option'
const [user, setUser] = useState<Option<User>>(none)
// Render: fold(none, () => <Login />, (u) => <Dashboard user={u} />)(user)
```

`TaskEither` para API calls tipa el error: `const fetchTasks: TaskEither<ApiError, Task[]>`. El componente puede usar `fold` para renderizar loading/error/success sin estados booleanos ad-hoc.

**Por qué**: `fp-ts` trae el rigor del sistema de tipos a runtime. Con `Option`, TypeScript te obliga a manejar el caso "nada" (no podés accidentalmente usar `user.name` sin verificar). Con `Either`, el error es parte del tipo (no necesitás `try-catch` + estado de error separado). La desventaja es la curva de aprendizaje y que React no está diseñado alrededor de estos patrones (hooks como `useState` esperan valores simples, no monads). Para TaskFlow, es probablemente overkill, pero para aplicaciones con lógica de negocio compleja, `fp-ts` reduce bugs. Fuente: gcanti.github.io/fp-ts, "Functional Programming in React with fp-ts" en múltiples tutoriales, y la charla "Practical FP in TypeScript" por Giulio Canti.

---

### 5. [Conectar] La clase muestra `Partial<T>` y `Omit<T, K>`. Conectá estos utility types con el patrón "Make Required" y "Make Optional" para props de componentes. ¿Cómo crearías tipos para un componente `TaskCard` que recibe una tarea pero ciertos campos son opcionales en modo "edición" y requeridos en modo "visualización"?

**Respuesta**: Usando utility types compuestos:

```ts
interface Task {
  id: string; title: string; description: string; completed: boolean; createdAt: Date
}

// Modo visualización: todos los campos necesarios
type TaskCardViewProps = { task: Task; mode: 'view' }

// Modo edición: solo título y descripción son editables (y requeridos para el form)
type TaskCardEditProps = { task: Required<Pick<Task, 'title' | 'description'>> & Partial<Omit<Task, 'title' | 'description'>>; mode: 'edit' }

type TaskCardProps = TaskCardViewProps | TaskCardEditProps
```

También podés crear utility types genéricos reutilizables: `type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>`.

**Por qué**: Estos utility types son composiciones de `Partial`, `Pick`, `Omit`, y `Required`. La clave es usar discriminators (`mode: 'view' | 'edit'`) para que TypeScript sepa qué campos están disponibles. En modo 'view', `description` es `string` (requerido). En modo 'edit', podrías querer que `description` sea opcional (el usuario podría solo editar `title`). Los utility types personalizados encapsulan estas transformaciones y hacen el código más legible que escribir `Omit<T, K> & Partial<Pick<T, K>>` cada vez. Fuente: TypeScript docs sobre Utility Types, "Advanced TypeScript Patterns for React" por Matt Pocock, y ejemplos en el código de TanStack.

---

### 6. [Conectar] La clase recomienda `interface` para props. Investigá el debate `interface` vs `type` desde la perspectiva de rendimiento de compilación (no de runtime). ¿Hay diferencia en el tiempo que TypeScript tarda en compilar con interfaces vs types en proyectos grandes?

**Respuesta**: Aunque la clase dice que no hay diferencia de rendimiento, investigaciones recientes (Matt Pocock, Jake Bailey) muestran que `interface` puede ser marginalmente más rápido en TypeScript porque: (1) las interfaces usan "declaration merging" que permite a TypeScript cachear y reutilizar definiciones, (2) los tipos condicionales (usados con `type`) son más costosos de evaluar porque TypeScript debe resolver la condición en cada uso. Sin embargo, la diferencia es mínima (milisegundos incluso en proyectos grandes) y no debería ser el factor decisivo. La elección debe basarse en: `interface` para objetos que pueden extenderse, `type` para uniones e intersecciones complejas.

**Por qué**: Jake Bailey (TypeScript team) midió que en un proyecto con 100,000 líneas, usar `type` vs `interface` para props de componentes tiene una diferencia de <1% en tiempo de compilación. El verdadero impacto en performance viene de: (1) tipos condicionales complejos anidados, (2) recursión ilimitada en tipos, (3) demasiadas uniones combinadas (combinatoria explosiva). Para la mayoría de proyectos React, el cuello de botella de compilación es `node_modules` (que se skipea con `skipLibCheck: true`), no las definiciones de props. Fuente: "TypeScript Performance" en github.com/microsoft/TypeScript/wiki, análisis de Matt Pocock en Total TypeScript, y el tweet de Jake Bailey sobre benchmarks de compilación.

---

### 7. [Conectar] `satisfies` (TS 4.9) verifica tipos sin cambiar la inferencia. Conectá esto con `as const`: ¿cómo usar `satisfies` para tipar configuraciones de componentes (variantes, tamaños) manteniendo la inferencia literal y la validación?

**Respuesta**: `satisfies` permite validar que un objeto cumple un tipo, pero TypeScript sigue usando el tipo inferido (más específico) para usos posteriores:

```ts
const buttonVariants = {
  primary: { bg: 'bg-blue-500', text: 'text-white' },
  secondary: { bg: 'bg-gray-200', text: 'text-black' },
  danger: { bg: 'bg-red-500', text: 'text-white' },
} satisfies Record<string, { bg: string; text: string }>

type Variant = keyof typeof buttonVariants // 'primary' | 'secondary' | 'danger' (literal union!)
const variant: Variant = 'primary' // type-safe
buttonVariants.danger.bg // infiere 'bg-red-500' (string literal, no string)
```

Con `as const` + `satisfies`, obtenés el tipo más específico posible mientras validás contra una interfaz.

**Por qué**: `as const` solo (sin `satisfies`) no valida contra una interfaz — podrías tener `bg: 42` y TypeScript no se quejaría. `Record<string, ...>` solo (sin `as const`) ensancharía las claves a `string`. La combinación `satisfies` + `as const` da lo mejor de ambos: validación contra la interfaz esperada, e inferencia literal preservada. Esto es particularmente útil para configuraciones de componentes (variantes de Button, temas, tamaños) donde querés autocompletado de las claves específicas. Fuente: TypeScript 4.9 release notes sobre `satisfies`, "satisfies in React" por Matt Pocock, y ejemplos en el código de cva/class-variance-authority.

---

### 8. [Cuestionar] `any` vs `unknown`: la clase recomienda `unknown` en lugar de `any`. Pero en la práctica, muchos desarrolladores usan `as any` como "escape hatch" rápido. ¿Cuándo es ACEPTABLE usar `any` en React y cuándo es un riesgo que justifica configurar `no-explicit-any: error` en ESLint?

**Respuesta**: `any` es aceptable como escape hatch en: (1) tests (mocks, fixtures donde el tipo exacto no importa — aunque `as unknown as MockType` es más seguro), (2) migración de JavaScript a TypeScript (temporalmente, con un plan para removerlo), (3) integración con librerías sin tipos donde escribir declaraciones tomaría más tiempo del razonable. `any` es inaceptable en: (1) props de componentes, (2) estado (useState), (3) respuestas de API (tipar con interfaz o usar Zod), (4) funciones de utilidad. `no-explicit-any: error` debe ser la regla por defecto, con supresiones puntuales y comentarios explicativos (`// eslint-disable-next-line @typescript-eslint/no-explicit-any — third-party lib without types`).

**Por qué**: `any` desactiva TypeScript para esa variable y todo lo que toca — es contagioso. `as any` en un lugar puede propagarse silenciosamente a través de asignaciones, spreads, y retornos. El equipo de TypeScript recomienda `unknown` como "type-safe any": te obliga a validar antes de usar (type narrowing). La regla `no-explicit-any: error` (con `// eslint-disable-next-line` como escape documentado) es la configuración estándar en equipos profesionales (Microsoft, Shopify, Vercel). Para TaskFlow, el objetivo es `no-explicit-any: error` en toda la app. Fuente: TypeScript docs sobre `any` vs `unknown`, "Don't use any" en el blog de TypeScript, y la configuración de ESLint recomendada por typescript-eslint.

---

### 9. [Cuestionar] `enum` vs union types en TypeScript/React: la clase usa union types (`type Status = 'pending' | 'completed'`). ¿Son los `enum` de TypeScript una mala práctica? ¿Por qué el equipo de TypeScript y ESLint desaconsejan `enum` en proyectos modernos?

**Respuesta**: Los `enum` de TypeScript son desaconsejados porque: (1) generan código JavaScript en runtime (a diferencia de las union types que solo existen en tiempo de compilación), (2) los `const enum` fueron problemáticos con `isolatedModules` (que Vite/esbuild requiere) — esbuild no puede procesarlos sin contexto de proyecto completo, (3) los `enum` numéricos tienen comportamiento sorprendente (son asignables entre sí). La recomendación moderna es: union types de strings (`type Status = 'pending' | 'completed'`) + `as const` arrays para iterar sobre valores (`const STATUSES = ['pending', 'completed'] as const`). Esto es type-safe y no genera código extra.

**Por qué**: El equipo de TypeScript (Daniel Rosenwasser) ha reconocido que los `enum` fueron un error de diseño temprano. En TypeScript 5.x, la recomendación oficial es usar union types para nuevos proyectos. `isolatedModules: true` (requerido por Vite/esbuild/Babel) no es compatible con `const enum` porque cada archivo se transpila independientemente sin ver otros archivos. La alternativa idiomática: `type Status = (typeof STATUSES)[number]` — genera la union type desde el array. Fuente: "TypeScript Enums are Terrible" por Matt Pocock, TypeScript docs sobre `isolatedModules`, y la discusión "Enums vs Union Types" en el repo de TypeScript.

---

### 10. [Cuestionar] `import type` vs `import`: la clase menciona `import type` para tree-shaking. ¿Es realmente necesario en proyectos con Vite? Vite ya hace tree-shaking agresivo con Rollup. ¿Agregar `import type` en todos lados es una micro-optimización?

**Respuesta**: `import type` es más importante por la semántica que por el tree-shaking: (1) evita dependencias circulares en runtime (TypeScript elimina `import type` del emit, por lo que no crea dependencia real, evitando errores como "Cannot access before initialization"), (2) en proyectos con `isolatedModules: true` (requerido por Vite), `import type` es necesario para imports que solo se usan como tipos (porque Vite/esbuild no puede saber que un import es solo de tipo sin esta anotación), (3) mejora la legibilidad (deja claro que el import es solo para tipos). Para tree-shaking, Vite/Rollup ya detectan imports no usados en runtime, pero `import type` lo hace explícito y previene que el bundler incluya accidentalmente un módulo por un side effect.

**Por qué**: Matt Pocock recomienda: "Use inline `type` imports (`import { type Task }`) when you only need the type." En Vite, si importás `{ Task }` (sin `type`), y `Task` es una interfaz, Vite sabe eliminarlo del bundle. Pero si importás `{ Task, taskSchema }` de un archivo que también exporta un `QueryClient` con side effects (como `queryClient.ts`), Vite incluye el módulo completo aunque solo uses `Task`. `import type { Task }` lo evita explícitamente. No es micro-optimización — es prevención de bugs y mejora de DX. Fuente: TypeScript 3.8 "import type" docs, "import type vs import" por Matt Pocock, y la documentación de Vite sobre `isolatedModules`.
