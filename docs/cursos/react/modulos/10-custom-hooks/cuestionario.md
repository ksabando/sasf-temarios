---
sidebar_label: "Cuestionario"
---

# Cuestionario M10 — Custom Hooks

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] Investigá la filosofía de "TanStack Hooks" y cómo Tanner Linsley diseña hooks reutilizables y agnósticos de framework (React, Vue, Solid). ¿Qué patrones de sus librerías (React Query, TanStack Table, TanStack Router) podrías aplicar al diseñar tus propios custom hooks?

**Respuesta**: Tanner Linsley sigue principios clave en sus hooks: (1) "Headless UI": el hook no renderiza nada, solo maneja estado y lógica (el desarrollador controla el render), (2) "Framework-agnostic core": la lógica central vive en un paquete independiente (ej: `@tanstack/query-core`) y el adaptador de React (`@tanstack/react-query`) solo conecta con hooks, (3) "Get, not Set": los hooks exponen datos derivados y funciones de acción, no setters directos, (4) "TypeScript-first": tipos inferidos automáticamente, sin necesidad de genéricos manuales, (5) "Composable": hooks pequeños que se componen (ej: `useReactTable` usa `useState`, `useReducer`, `useMemo`, etc.).

**Por qué**: Estos patrones producen hooks que son fáciles de usar, difíciles de usar mal, y portables entre proyectos. Para aplicar en tus custom hooks: (1) separá la lógica de la UI (tu hook no debería retornar JSX), (2) usá genéricos para type safety (`useDebounce<T>`), (3) exponé estados claros (no booleanos aislados — usá discriminated unions como `{ status: 'loading' } | { status: 'success', data: T }`), (4) hacé que el hook sea "just works" con defaults razonables pero configurable. Fuente: "How to build a React hook" en el blog de Tanner Linsley, el código fuente de `@tanstack/react-query`, y la charla "Headless UI Components" en React Summit.

---

### 2. [Investigar] ¿Qué es `usehooks-ts` y qué hooks ofrece que van más allá de los básicos (`useDebounce`, `useLocalStorage`)? Investigá hooks como `useEventListener`, `useIntersectionObserver`, `useIsFirstRender`, `useStep`, y `useCounter`. ¿Qué patrones de implementación seguís viendo?

**Respuesta**: `usehooks-ts` es una colección de custom hooks TypeScript mantenida por Julien Carpon. Incluye hooks que encapsulan APIs web nativas: `useEventListener(event, handler, element)` abstrae `addEventListener`/`removeEventListener` con cleanup automático; `useIntersectionObserver(ref, options)` devuelve `entry` con `isIntersecting`, `intersectionRatio`; `useStep(max)` maneja navegación paso a paso con `next`, `prev`, `goTo`; `useIsFirstRender()` retorna `true` solo en el primer render; `useCounter(initialValue)` ofrece `count`, `increment`, `decrement`, `reset`, `setCount`.

**Por qué**: Los patrones comunes que emergen: (1) encapsulan APIs del navegador con `useEffect` + cleanup, (2) usan `useRef` para valores que no deben causar re-renders, (3) exponen tanto el valor como funciones de control, (4) soportan genéricos para type safety, (5) usan lazy initialization (`useState(() => ...)`) para valores iniciales costosos. Estos hooks son excelentes ejemplos de "extraer lógica repetitiva" — cada uno encapsula un patrón común que de otra manera copiarías entre componentes. Fuente: usehooks-ts.com, el repo github.com/juliencrn/usehooks-ts, y la documentación de cada hook.

---

### 3. [Investigar] ¿Qué es el patrón "Hook + Context" vs "Hook + Zustand" para custom hooks como `useAuth`? La clase define `useAuth` como wrapper de `useContext(AuthContext)`. ¿Qué cambiaría si migraras a Zustand y cómo afecta el diseño de tus custom hooks?

**Respuesta**: Con Context, `useAuth` es un wrapper que accede al contexto y valida que existe:
```ts
function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be within AuthProvider')
  return ctx
}
```
Con Zustand, `useAuth` se convierte en selectores directos al store (no necesita Provider ni validación):
```ts
const useAuthStore = create<AuthStore>(...)
function useAuth() {
  return useAuthStore(state => ({ user: state.user, login: state.login, logout: state.logout }))
}
```
Esto cambia el diseño: (1) no hay Provider — el hook funciona en cualquier parte, (2) los selectores permiten granularidad (`useAuthStore(s => s.user)` solo se re-renderiza cuando user cambia), (3) podés acceder al estado fuera de React (`useAuthStore.getState().token` en interceptors).

**Por qué**: La migración a Zustand simplifica los custom hooks porque elimina la capa de Context (Provider + validación). Además, habilita selectores finos que serían complejos con Context (requieren splitting). El patrón emerge: el custom hook se convierte en una capa de "selectores y acciones convenientes" sobre el store, en lugar de un wrapper de Context. Daishi Kato describe esto como "el hook es la API pública, el store es el detalle de implementación". Fuente: Zustand docs, "From Context to Zustand" en el blog de Daishi Kato, y el código de TaskFlow en módulo 17.

---

### 4. [Investigar] ¿Qué son los "hooks factory" y cómo se diferencian de los custom hooks? Investigá el patrón `create` de Zustand y cómo retorna tanto un hook como métodos externos (`getState`, `subscribe`, `setState`). ¿Cómo diseñarías una factory de hooks para un servicio de API?

**Respuesta**: Un "hook factory" es una función que crea un hook (y posiblemente otros artefactos) configurado con opciones específicas. Zustand `create()` es el ejemplo canónico: retorna `useStore` (hook) pero también expone `useStore.getState()`, `useStore.setState()`, `useStore.subscribe()`. Para un servicio de API, una factory podría ser:

```ts
function createApiHook<T>(endpoint: string) {
  const useApi = () => {
    const [state, setState] = useState<AsyncState<T>>({ status: 'idle' })
    // ... fetching logic
    return state
  }
  useApi.invalidate = () => queryClient.invalidateQueries({ queryKey: [endpoint] })
  useApi.prefetch = () => queryClient.prefetchQuery({ queryKey: [endpoint], queryFn: ... })
  return useApi
}
const useTasks = createApiHook<Task[]>('/tasks')
useTasks.prefetch() // disponible fuera de React
```

**Por qué**: Este patrón es poderoso porque el hook no es solo una función — es un objeto con métodos y propiedades. Esto permite que la misma API sirva para uso dentro de React (el hook) y fuera de React (los métodos estáticos). Tanner Linsley usa este patrón extensivamente en TanStack: `useQueryClient()` retorna un objeto con `invalidateQueries`, `prefetchQuery`, etc. Para TaskFlow, aplicar esto haría los hooks más modulares y testeables. Fuente: Código fuente de Zustand `create()`, "Hook Factory Pattern" en el blog de Tanner Linsley, y ejemplos en TanStack Query.

---

### 5. [Conectar] La clase implementa `useDebounce` y `useLocalStorage`. Conectá estos hooks con el concepto de "useSyncExternalStore" — ¿cómo implementarías un `useLocalStorage` que use `useSyncExternalStore` para reaccionar a cambios en localStorage desde otras pestañas (evento `storage`)?

**Respuesta**: `useSyncExternalStore` es ideal para `useLocalStorage` porque `localStorage` es un store externo (fuera de React) que puede cambiar por eventos de otras pestañas. La implementación:

```ts
function useLocalStorage<T>(key: string, initialValue: T) {
  const getSnapshot = () => {
    const item = localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : initialValue
  }

  const subscribe = (callback: () => void) => {
    const handler = (e: StorageEvent) => {
      if (e.key === key && e.storageArea === localStorage) callback()
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }

  const value = useSyncExternalStore(subscribe, getSnapshot)

  const setValue = (newValue: T | ((prev: T) => T)) => {
    const next = typeof newValue === 'function' ? (newValue as Function)(getSnapshot()) : newValue
    localStorage.setItem(key, JSON.stringify(next))
    window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(next), storageArea: localStorage }))
  }

  return [value, setValue] as const
}
```

**Por qué**: `useSyncExternalStore` resuelve dos problemas: (1) consistencia en Concurrent Mode (todos los componentes que usan el mismo localStorage ven el mismo valor), (2) reactividad cross-tab (el evento `storage` dispara `callback`, React re-renderiza). La línea `window.dispatchEvent(new StorageEvent(...))` es necesaria porque el evento `storage` nativo NO se dispara en la pestaña que HIZO el cambio (solo en otras pestañas). Para que `useSyncExternalStore` detecte cambios locales, despachamos manualmente. Fuente: React docs "useSyncExternalStore", "Syncing localStorage across tabs" en el blog de Jake Archibald, y "useSyncExternalStore with localStorage" en ejemplos de react.dev.

---

### 6. [Conectar] La clase muestra hooks de ejemplo (`useAuth`, `useTasks`, `useDebounce`, `useLocalStorage`, `useMediaQuery`). Investigá cómo harías un hook `useMediaQuery` que use `matchMedia` con `useSyncExternalStore` en lugar de `useEffect` + `useState`. ¿Qué ventaja da?

**Respuesta**: `useMediaQuery` con `useSyncExternalStore`:

```ts
function useMediaQuery(query: string): boolean {
  const getSnapshot = () => window.matchMedia(query).matches
  const subscribe = (callback: () => void) => {
    const mql = window.matchMedia(query)
    mql.addEventListener('change', callback)
    return () => mql.removeEventListener('change', callback)
  }
  return useSyncExternalStore(subscribe, getSnapshot)
}
```

Ventajas sobre `useEffect` + `useState`: (1) sin render intermedio sin suscripción (el estado se lee sincrónicamente en el render), (2) consistencia en Concurrent Mode (evita tearing si múltiples componentes leen el mismo media query), (3) no necesita `useEffect` — el valor se obtiene directamente en el render, eliminando el delay de un frame entre cambio y actualización de estado.

**Por qué**: Con `useEffect` + `useState`, cuando el media query cambia, React: (1) recibe el evento, (2) llama a `setState`, (3) programa re-render, (4) renderiza con el nuevo valor. Esto toma al menos 1 frame. Con `useSyncExternalStore`, React lee el valor sincrónicamente durante el render, por lo que el cambio se refleja inmediatamente. Además, en Concurrent Mode, React puede "bloquear" el store externo para que todos los componentes vean el mismo valor consistente durante un render. Esta es la implementación recomendada en React 18+ para cualquier suscripción a fuente externa. Fuente: React docs "useSyncExternalStore", "Why useSyncExternalStore matters" por Dan Abramov, y el ejemplo de media query en react.dev.

---

### 7. [Conectar] La clase organiza hooks en `hooks/` separados de los contexts. Investigá el patrón de "barrel exports" (index.ts) para hooks y cómo afecta el tree-shaking. ¿Qué ventaja tiene `import { useAuth } from '@/hooks'` vs `import { useAuth } from '@/hooks/useAuth'`?

**Respuesta**: El barrel export (`hooks/index.ts` que re-exporta todos los hooks) ofrece DX conveniente (un solo import path). Pero tiene un costo: si no está configurado correctamente, el bundler no puede tree-shake hooks no usados (porque el barrel file importa todo, creando dependencias laterales). Con `import { useAuth } from '@/hooks/useAuth'`, el bundler solo carga ese archivo. La solución moderna: usar barrel exports condicionales con `sideEffects: false` en `package.json` o usar el flag `importsNotUsedAsValues` de TypeScript para que los tipos no generen imports runtime.

**Por qué**: Vite/Rollup pueden tree-shake barrels si el módulo es ESM y tiene `sideEffects: false`. Pero si un hook tiene un side effect a nivel módulo (como `createContext` o instanciar un `QueryClient`), el barrel puede incluir ese side effect incluso si el hook no se usa. La mejor práctica actual (2026): evitá barrels para código que se comparte entre múltiples entry points (como una librería). Para una app como TaskFlow, el impacto es mínimo porque el bundle final incluye todo de todas formas. Pero es buena práctica mantener imports directos para máxima tree-shakeability. Fuente: "Barrel files and tree-shaking" en el blog de Marvin Hagemeister, "The Barrel File Debate" en twitter de desarrolladores de Vite, y la documentación de Rollup sobre tree-shaking.

---

### 8. [Cuestionar] ¿Cuándo un custom hook es "demasiado" abstracto? La comunidad debate si hooks como `useWindowSize`, `useIsMounted`, `usePrevious` son genuinamente útiles o sobre-ingeniería (1-3 líneas de código propio vs una abstracción). ¿Dónde está la línea entre "hook útil" y "hook innecesario"?

**Respuesta**: La línea es: si el hook encapsula una API del navegador o lógica con cleanup (`useEventListener`, `useMediaQuery`, `useDebounce`), es útil porque abstrae complejidad (especialmente el cleanup que es fácil de olvidar). Si el hook es solo una o dos líneas de React puro (`usePrevious`, `useIsMounted`), puede ser sobre-ingeniería — el código inline es más legible y directo. Kent C. Dodds argumenta que los hooks deben encapsular "comportamiento reutilizable con ciclo de vida", no "una línea de state".

**Por qué**: `usePrevious` es literalmente:
```ts
function usePrevious<T>(value: T) {
  const ref = useRef<T>()
  useEffect(() => { ref.current = value })
  return ref.current
}
```
Son 4 líneas. Crear un hook para esto agrega indirección sin reducir complejidad. `useIsMounted()` es incluso peor porque es un patrón que generalmente indica un problema de diseño (deberías cancelar el efecto, no verificar si está montado). En contraste, `useDebounce` encapsula `useState` + `useEffect` + `setTimeout` + `clearTimeout` — 10+ líneas con lógica de timing y cleanup que es fácil de hacer mal. La pregunta a hacerse: "¿Este hook reduce la probabilidad de bugs?" Si la respuesta es sí, es un buen hook. Si solo ahorra 2 líneas, probablemente no. Fuente: "When to create a custom hook" en el blog de Kent C. Dodds, "AHA Programming" (Avoid Hasty Abstractions) por Kent C. Dodds, y discusiones en reddit.com/r/reactjs.

---

### 9. [Cuestionar] ¿Es "hooks for everything" una buena arquitectura? Algunos desarrolladores crean hooks para TODO (useFormValidation, useTaskFiltering, useTaskSorting), fragmentando la lógica en decenas de hooks. ¿Cuándo un custom hook crea más problemas que los que resuelve (prop drilling de hooks, acoplamiento oculto)?

**Respuesta**: "Hooks for everything" es un antipatrón cuando los hooks no son reutilizables y solo sirven para extraer código de un componente a otro archivo. Si un hook `useTaskForm` solo se usa en `TaskForm.tsx`, no es un hook — es código que moviste de lugar sin beneficio. Los hooks deben ser reutilizables o encapsular comportamiento con ciclo de vida complejo. El acoplamiento oculto ocurre cuando múltiples hooks leen/escriben el mismo estado implícitamente (ej: un hook lee `filter` de Context, otro hook llama a `setFilter` via dispatch, y no hay una relación explícita entre ellos).

**Por qué**: El problema no son los hooks en sí, sino la granularidad incorrecta. La solución es: (1) hooks por dominio, no por operación (`useTasks()` en lugar de `useTaskFilter()` + `useTaskSort()` + `useTaskCreate()`), (2) mantener la lógica cerca de donde se usa (si un hook solo se usa en un componente, inlinealo), (3) los hooks deben ser composables hacia arriba, no hacia los costados (un hook puede usar otros hooks, pero dos hooks hermanos no deberían acoplarse implícitamente). Dan Abramov comparó esto con el problema de HOCs en 2017: "wrapper hell" se convirtió en "hook hell" cuando cada comportamiento es un hook separado. Fuente: "Why hooks are not a silver bullet" por Dan Abramov, "Custom hooks: When and why" en el blog de Tanner Linsley, y "Clean code with React hooks" por Kent C. Dodds.

---

### 10. [Cuestionar] La clase usa `useEffect` dentro de `useDebounce`. ¿Es esto correcto o debería usar `useLayoutEffect`? La comunidad debate cuándo usar `useEffect` vs `useLayoutEffect`, especialmente en hooks de UI como debounce, media queries, y resize observers. ¿Qué dice el equipo de React?

**Respuesta**: Para `useDebounce`, `useEffect` es correcto porque no necesitamos leer/escribir el DOM sincrónicamente. `useLayoutEffect` se usa cuando necesitás medir el DOM y aplicar cambios antes de que el navegador pinte (para evitar flickering). Para hooks de UI: `useMediaQuery` (no modifica DOM) → `useEffect`; `useResizeObserver` (mide DOM) → `useLayoutEffect` para evitar CLS si el tamaño afecta el layout; `useDebounce` (solo lógica de timing) → `useEffect`. La regla del equipo de React: empezá con `useEffect`, solo cambiá a `useLayoutEffect` si ves flickering visual o necesitás la medida del DOM antes del paint.

**Por qué**: La diferencia práctica: `useEffect` se ejecuta después de que el navegador pintó (el usuario ve el cambio, luego el efecto se ejecuta). `useLayoutEffect` se ejecuta después del commit del DOM pero antes del paint (el navegador no ha pintado aún). Si medís el DOM en `useEffect` y actualizás estado basado en esa medida, el usuario verá el layout viejo por un frame y luego el nuevo — flickering. Si lo hacés en `useLayoutEffect`, el cambio se aplica antes del paint y el usuario nunca ve el estado intermedio. Fuente: "useEffect vs useLayoutEffect" en react.dev, "When to use useLayoutEffect" por Kent C. Dodds, y el artículo "You might not need useLayoutEffect" por Dan Abramov.
