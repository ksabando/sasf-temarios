---
sidebar_label: "Cuestionario"
---

# Cuestionario M17 — Estado Global con Zustand (y RTK)

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué es XState y cómo se compara con Zustand para manejar estado global? XState usa state machines (máquinas de estados finitos) y statecharts. ¿En qué escenarios de TaskFlow una state machine sería superior a un store de Zustand?

**Respuesta**: XState modela el estado como nodos finitos con transiciones explícitas, guardias y acciones. Zustand modela el estado como un objeto mutable con funciones de actualización (similar a `useState` global). XState es superior cuando: (1) el flujo de estado tiene transiciones restringidas (wizard multi-paso: solo podés ir de step1 a step2 si pasaste validación), (2) hay múltiples subestados concurrentes (un reproductor de video: volumen, pausa/reproducción, fullscreen son independientes), (3) necesitás visualizar el flujo de estado (XState genera diagramas automáticos). Zustand es superior cuando el estado es más "data" y menos "flow": carrito de compras, lista de tareas, preferencias de usuario.

**Por qué**: David Khourshid (creador de XState) argumenta que toda UI es inherentemente una state machine, y hacerlo explícito previene estados imposibles. Pero XState tiene más boilerplate (definir máquina, interpretarla, hooks) y una curva de aprendizaje mayor. Para TaskFlow: el wizard de tareas sería mejor modelado con XState (estados: idle, fillingBasic, fillingSubtasks, reviewing, submitting, success, error), pero el store de tareas y auth son mejor modelados con Zustand. La tendencia es usar Zustand para "data" y XState para "flows". Fuente: xstate.js.org, "State Machines in React" por David Khourshid, y la comparación en el blog de Stately (stately.ai).

---

### 2. [Investigar] ¿Qué es Legend State y cómo se compara con Zustand? Legend State (creado por el equipo de Legend App) se promociona como "el state manager más rápido". ¿Qué arquitectura interna diferente tiene que lo hace más rápido?

**Respuesta**: Legend State usa observables granulares a nivel de propiedad (no a nivel de store). Cada propiedad en el estado es un observable independiente — cambiar `state.user.name` solo notifica a los componentes que leen `user.name`, no a los que leen `user.email` o `state.tasks`. Internamente, usa Proxies para interceptar accesos y mutaciones, rastreando automáticamente qué componentes dependen de qué propiedades. Zustand, en cambio, notifica a nivel de store: cualquier `set({ tasks: [...] })` ejecuta todos los selectores de todos los suscriptores de ese store, y solo descarta re-renders si el selector retornó el mismo valor.

**Por qué**: Legend State logra granularidad sin selectores manuales. En Zustand: `useStore(s => s.user.name)` — vos definís el selector manualmente. En Legend State: `useSelector(state => state.user.name)` o directamente `state.user.name.get()` — el proxy rastrea el acceso automáticamente. Esto elimina selectores duplicados y la necesidad de `useShallow`. Sin embargo, Zustand es más simple (no requiere entender observables) y más maduro. Para TaskFlow, la performance de Zustand con selectores finos es suficiente; Legend State sería overkill. Fuente: legendapp.com/open-source/state, "Introducing Legend State" en el blog de Legend, y benchmarks en el repo de Legend State.

---

### 3. [Investigar] ¿Qué es Jotai y cómo se diferencia de Zustand? Ambos son del mismo creador (Daishi Kato). ¿Cuándo elegir Jotai sobre Zustand y viceversa? ¿Cuál es más adecuado para TaskFlow?

**Respuesta**: Jotai tiene un modelo de átomos (estado granular): cada pieza de estado es un `atom()` independiente. Los átomos pueden derivarse de otros átomos (`const pendingCount = atom(get => get(tasksAtom).filter(...))`). Zustand tiene un modelo de store (estado agrupado): un store contiene múltiples campos y acciones. Jotai es mejor cuando: (1) el estado es muy granular y las piezas son independientes (ej: estado de UI de muchos componentes — isModalOpen, sidebarWidth, activeTab), (2) necesitás derivaciones reactivas entre piezas de estado. Zustand es mejor cuando: (1) el estado está agrupado por dominio (auth store, task store), (2) necesitás acciones que tocan múltiples campos del store, (3) querés middleware simple (persist, devtools).

**Por qué**: Daishi Kato describe la diferencia como "bottom-up" (Jotai) vs "top-down" (Zustand). En Jotai, los átomos son bloques independientes que se componen. En Zustand, el store es un contenedor cohesivo. Para TaskFlow: Zustand es más adecuado porque el estado se agrupa naturalmente por dominio (auth, tasks, ui) y las acciones suelen tocar múltiples campos (login afecta user, token, isAuthenticated). Jotai sería mejor para una app con estado de UI muy granular (dashboard con docenas de widgets independientes). Fuente: jotai.org, "Jotai vs Zustand" en el blog de Daishi Kato, y la charla "State Management in React" por Daishi Kato en React Summit.

---

### 4. [Investigar] ¿Qué es Valtio y cómo se diferencia de Zustand? Valtio usa Proxies para mutaciones "mutables" del estado (similar a MobX o Legend State). ¿Por qué Zustand es más popular que Valtio a pesar de tener el mismo creador?

**Respuesta**: Valtio permite mutar el estado como un objeto JavaScript normal (usando Proxies) y automáticamente rastrea qué componentes dependen de qué propiedades. Zustand requiere `set()` explícito con inmutabilidad (spreads). Valtio es más "mágico" y menos verboso:

```ts
// Zustand: inmutable explícito
set(state => ({ user: { ...state.user, name: 'New' } }))

// Valtio: mutable transparente
state.user.name = 'New'
```

Zustand es más popular porque: (1) el modelo inmutable explícito es más familiar para desarrolladores React (alineado con `useState`/`setState`), (2) es más fácil de debugear (cada cambio pasa por `set()`), (3) funciona mejor con Redux DevTools (cada `set` es una acción), (4) la inmutabilidad explícita es más predecible en aplicaciones grandes.

**Por qué**: Daishi Kato creó Valtio como experimento de "¿qué tan simple puede ser el state management?" y Zustand como "¿qué tan simple puede ser Redux-like state management?". Valtio es más simple de usar pero más complejo internamente (proxies, snapshot, suscripciones). Zustand es más explícito pero más simple internamente (pub-sub con selectores). La comunidad prefirió Zustand por la transparencia y predictibilidad. Fuente: valtio.pmnd.rs, "Valtio vs Zustand" en el blog de Daishi Kato, y npm trends comparando adopción.

---

### 5. [Conectar] La clase migra de Context + useReducer a Zustand. Conectá esto con el concepto de "separación de server state y client state". ¿Por qué Zustand es para client state y React Query para server state? ¿Qué pasa si ponés datos del servidor en Zustand?

**Respuesta**: Client state (Zustand) es estado que la aplicación "crea" localmente: UI state (sidebar abierto, tema, modales), preferencias de usuario, carrito de compras, estado de formularios no guardados. Server state (React Query) es estado que "refleja" datos del servidor: lista de tareas, productos, perfil de usuario. Si ponés datos del servidor en Zustand, perdés: (1) caching automático, (2) refetch en background (stale-while-revalidate), (3) deduplication de requests, (4) sincronización entre pestañas, (5) garbage collection de datos no usados. Tendrías que implementar todo esto manualmente en el store.

**Por qué**: Tanner Linsley (creador de TanStack Query) y Dominik (mantenedor de React Query) argumentan que la mayoría del estado en apps React es "server state cache", no "client state". Usar Zustand para server state duplica el trabajo: fetch → set en Zustand → seleccionar en componente. React Query hace: fetch → cache → invalidar → refetch — todo automático. La arquitectura correcta es clara: Zustand para lo que la app "posee" (UI), React Query para lo que el servidor "posee" (datos). En TaskFlow: `authStore` (token, user — aunque user podría ser server state), `taskStore` → `useQuery(['tasks'])`, `uiStore` (sidebar, theme). Fuente: "State Management: Server State vs Client State" por Dominik en el blog de TanStack, "Why you don't need Zustand for API data" por TkDodo, y el diagrama en react-query docs.

---

### 6. [Conectar] Zustand usa `useSyncExternalStore` internamente. Conectá esto con el concepto de "selectors". ¿Cómo implementa Zustand los selectores finos usando `useSyncExternalStoreWithSelector` y cómo evita re-renders innecesarios?

**Respuesta**: Zustand internamente usa `useSyncExternalStoreWithSelector` (un wrapper de `useSyncExternalStore` del paquete `use-sync-external-store`). El flujo es: (1) cada componente llama a `useStore(selector)`, (2) Zustand registra el selector en el store, (3) cuando `set()` es llamado, Zustand notifica a todos los selectores registrados, (4) cada selector se ejecuta con el nuevo estado y compara el resultado con el resultado anterior usando `Object.is`, (5) si son iguales, el componente NO se re-renderiza; si son diferentes, se re-renderiza con el nuevo valor.

```ts
// Simplificación de lo que Zustand hace internamente
function useStore(api, selector, equalityFn = Object.is) {
  const getSnapshot = () => selector(api.getState())
  const subscribe = (callback) => api.subscribe(callback)
  return useSyncExternalStore(subscribe, getSnapshot)
}
```

**Por qué**: La magia está en el selector y `Object.is`. Si `useStore(s => s.count)` y `count` no cambió, aunque otros campos del store cambiaron, el selector retorna el mismo valor (mismo número primitivo) y Zustand omite el re-render. Sin embargo, si el selector crea un nuevo objeto/array (`useStore(s => s.tasks.filter(...))`), cada ejecución retorna una nueva referencia y Zustand SIEMPRE re-renderiza. Por eso `useShallow` es necesario para selectores que derivan objetos/arrays. Fuente: Código fuente de Zustand en github.com/pmndrs/zustand, React docs sobre `useSyncExternalStore`, y la charla "Inside Zustand" por Daishi Kato.

---

### 7. [Conectar] La clase usa `persist` middleware de Zustand con `name`. Conectá esto con las limitaciones de `localStorage` para datos sensibles. ¿Cómo implementarías un `persist` custom que use `sessionStorage` o IndexedDB en lugar de `localStorage`?

**Respuesta**: Zustand `persist` acepta un `storage` option que puede ser cualquier objeto con `getItem` y `setItem`. Para usar `sessionStorage`:

```ts
const useStore = create(
  persist(
    (set) => ({ ... }),
    {
      name: 'auth-storage',
      storage: {
        getItem: (name) => {
          const value = sessionStorage.getItem(name)
          return value ? JSON.parse(value) : null
        },
        setItem: (name, value) => sessionStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => sessionStorage.removeItem(name),
      },
    }
  )
)
```

Para IndexedDB (más espacio que localStorage, asíncrono, mejor para datos estructurados), necesitás un storage adapter asíncrono. Zustand `persist` soporta storage asíncrono via la opción `storage: createJSONStorage(() => asyncStorage)`.

**Por qué**: `sessionStorage` se limpia al cerrar la pestaña (bueno para tokens temporales). IndexedDB permite almacenar más de 5MB (límite de localStorage) y es mejor para datos binarios o grandes. La interfaz `Storage` es simple (sync), pero Zustand la abstrae. Para auth tokens, la decisión es de seguridad: `sessionStorage` (se limpia solo) > `localStorage` (persiste, vulnerable a XSS) > IndexedDB (similar a localStorage pero más complejo). Fuente: Zustand docs sobre `persist` y storage custom, MDN sobre Storage API e IndexedDB, y "localStorage vs sessionStorage for Auth" en Auth0 blog.

---

### 8. [Cuestionar] ¿Zustand vs Redux Toolkit (RTK) en 2026? Redux Toolkit moderno con `createSlice` y RTK Query es comparable en simplicidad a Zustand. ¿Cuándo un proyecto debería elegir RTK sobre Zustand?

**Respuesta**: RTK es preferible cuando: (1) el equipo ya tiene experiencia Redux y valora la estructura predecible (slices, reducers, actions separados), (2) necesitás RTK Query integrado (data fetching + state management en una sola librería), (3) la app tiene lógica de estado muy compleja que se beneficia del ecosistema de middleware Redux, (4) necesitás features avanzadas como `createEntityAdapter`, normalización de datos, o time-travel debugging via Redux DevTools. Zustand es preferible cuando: (1) el equipo valora minimalismo y flexibilidad, (2) ya usás React Query para server state, (3) querés evitar el boilerplate de Redux (incluso con RTK, definir slices + reducers + actions + selectors es más código).

**Por qué**: Mark Erikson (mantenedor de Redux) y Daishi Kato (creador de Zustand) coinciden: RTK es para equipos que quieren estructura y convenciones; Zustand es para equipos que quieren minimalismo y flexibilidad. No hay diferencia técnica significativa (ambos usan `useSyncExternalStore` internamente). En 2026, Zustand es más popular para proyectos nuevos pequeños/medianos; RTK domina en empresas grandes con estándares establecidos. Para TaskFlow, Zustand es la elección correcta (proyecto de aprendizaje, no necesita middleware Redux complejo). Fuente: "Redux Toolkit vs Zustand vs Jotai" por Mark Erikson, "State of State Management 2025" en el blog de TkDodo, y discusiones en reddit.com/r/reactjs.

---

### 9. [Cuestionar] ¿Múltiples stores pequeños vs un store grande en Zustand? La clase recomienda stores separados (`authStore`, `taskStore`, `uiStore`). Pero algunos argumentan que un solo store es más simple y evita dependencias entre stores. ¿Qué dice Daishi Kato?

**Respuesta**: Daishi Kato recomienda múltiples stores basados en dominio (principio de responsabilidad única) porque: (1) cada store puede tener su propio middleware (solo `authStore` necesita `persist`, solo `taskStore` necesita `devtools`), (2) cambios en un store no afectan componentes que usan otro store (performance), (3) code-splitting natural (cada store se carga con su feature). Un store monolítico tiene la ventaja de que podés acceder al estado completo desde cualquier acción (sin `useAuthStore.getState()`), pero a costa de mayor acoplamiento y re-renders potenciales.

**Por qué**: La preocupación de "dependencias entre stores" (cuando una acción en `taskStore` necesita leer `authStore`) es válida, pero se resuelve con `useAuthStore.getState()` dentro de la acción de `taskStore`. Esto es transparente y no crea dependencia circular. La alternativa — un store monolítico — lleva a que cada `set` ejecute TODOS los selectores de TODOS los suscriptores. Con stores separados, un `set` en `uiStore` solo afecta a suscriptores de `uiStore`. Fuente: "Stores in Zustand" en la documentación de Zustand, "Multiple vs Single Store" en el blog de Daishi Kato, y ejemplos en el repo de Zustand.

---

### 10. [Cuestionar] ¿Debería Zustand reemplazar completamente a `useState` y `useContext`? Algunos equipos ponen TODO en Zustand (hasta el estado de un formulario local). ¿Es esto una buena práctica o un abuso de estado global?

**Respuesta**: NO. Zustand debe usarse para estado que es genuinamente global (compartido entre múltiples componentes no relacionados). El estado local de un formulario, un toggle, o un contador que solo afecta a un componente debe usar `useState`. Poner estado local en Zustand tiene desventajas: (1) el estado persiste aunque el componente se desmonte (necesitás limpiarlo manualmente), (2) contaminás el store global con estado efímero, (3) perdés el acoplamiento natural al ciclo de vida del componente (el estado en `useState` se limpia al desmontar automáticamente). La regla: si el estado solo lo usa un componente o sus hijos directos → `useState`. Si lo comparten componentes en diferentes ramas del árbol → Zustand.

**Por qué**: Tanner Linsley y Kent C. Dodds insisten en "state colocation": mantené el estado tan cerca como sea posible de donde se usa. Estado global prematuro crea acoplamiento innecesario y hace el código más difícil de razonar. En TaskFlow: `sidebarOpen`, `theme`, `user` → Zustand (global). `title`, `description` del formulario de tarea → `useState` o React Hook Form (local). `filter`, `search` → `useState` local en TaskList o en la URL (search params). Fuente: "State Colocation will make your React app faster" por Kent C. Dodds, "Don't put everything in global state" por Tanner Linsley, y el principio "Single Responsibility" aplicado a estado.
