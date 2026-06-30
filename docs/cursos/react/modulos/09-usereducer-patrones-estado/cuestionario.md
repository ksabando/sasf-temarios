---
sidebar_label: "Cuestionario"
---

# Cuestionario M09 — useReducer y Patrones de Estado

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué es XState y cómo se compara con `useReducer` para manejar estado complejo con máquinas de estados finitos? ¿En qué escenarios de TaskFlow (wizard de tareas, flujo de autenticación) una state machine sería superior a un reducer?

**Respuesta**: XState es una librería de state machines y statecharts que modela el estado como nodos finitos con transiciones explícitas, guardias, y acciones. A diferencia de `useReducer` (donde las transiciones son implícitas en el switch/case y no hay garantía de que ciertas acciones sean válidas en ciertos estados), XState define explícitamente qué estados existen y qué transiciones son válidas desde cada uno. Para TaskFlow: el wizard de creación de tareas (paso 1 → paso 2 → paso 3 → submit) es una máquina de estados perfecta: estados `basic`, `subtasks`, `review`, `submitting`, `success`, `error`; transiciones `NEXT`, `PREV`, `SUBMIT`.

**Por qué**: La ventaja de state machines es que eliminan estados imposibles. Con `useReducer`, podrías accidentalmente despachar `SUBMIT` desde el paso 1 (cuando solo debería ser posible desde `review`). Con XState, `SUBMIT` solo es una transición válida desde el estado `review`; si intentás despacharla desde otro estado, es un no-op o error predecible. XState también genera diagramas visuales automáticamente (via inspector), lo que ayuda a comunicar la lógica de estado al equipo. La desventaja es la curva de aprendizaje y el boilerplate adicional. David Khourshid (creador de XState) argumenta que toda UI es inherentemente una state machine, y hacerlo explícito elimina bugs. Fuente: xstate.js.org, "State Machines in React" por David Khourshid, y la charla "The Visual Future of State" en React Conf.

---

### 2. [Investigar] ¿Cómo se integra Immer con `useReducer` para simplificar las actualizaciones inmutables de estado? ¿Qué hace `produce` de Immer y cómo evita que escribas spreads anidados como `{ ...state, tasks: state.tasks.map(t => t.id === id ? { ...t, ...data } : t) }`?

**Respuesta**: Immer (creado por Michel Weststrate, autor de MobX) usa Proxies para permitir escribir código "mutable" que produce un estado inmutable. `produce(state, draft => { draft.tasks[0].title = 'new' })` automáticamente genera un nuevo estado con las modificaciones aplicadas de forma inmutable, sin necesidad de spreads manuales. Con `useReducer`, podés usar `produce` curried como reducer:

```ts
const taskReducer = produce((draft: TaskState, action: TaskAction) => {
  switch (action.type) {
    case 'ADD_TASK':
      draft.tasks.push(action.payload)     // parece mutable, pero es inmutable
      break
    case 'UPDATE_TASK':
      const task = draft.tasks.find(t => t.id === action.payload.id)
      if (task) Object.assign(task, action.payload.data)
      break
    case 'DELETE_TASK':
      draft.tasks = draft.tasks.filter(t => t.id !== action.payload)
      break
  }
})
```

Immer detecta qué partes del draft fueron modificadas y produce un nuevo estado solo con las partes cambiadas (structural sharing).

**Por qué**: Immer usa ES6 Proxies para interceptar todas las operaciones sobre el `draft`. Cada mutación se registra, y al final, Immer construye un nuevo objeto/array inmutable con solo las partes modificadas (las partes no tocadas se comparten con el estado anterior). Esto hace que los reducers para estado complejo (objetos anidados, arrays de objetos) sean mucho más legibles y menos propensos a errores de inmutabilidad (olvidar un `...` en algún nivel). React + Immer es una combinación recomendada por el equipo de Redux Toolkit (que incluye Immer por defecto en `createReducer`). Fuente: immerjs.github.io/immer, "Simplifying Reducers with Immer" en el blog de Michel Weststrate, y la documentación de Redux Toolkit.

---

### 3. [Investigar] ¿Cómo funciona `useReducer` internamente en React? La clase menciona que `useState` es un `useReducer` simplificado. Investigá el código fuente de React (Fiber hooks) y explicá cómo se almacenan y actualizan el estado y la función reducer en la Fiber del componente.

**Respuesta**: Internamente, `useReducer` almacena el estado actual y la función reducer en un nodo de la lista enlazada de hooks de la Fiber. Cada hook ocupa una posición en esta lista. Cuando se crea el hook (`mountReducer`), React guarda `reducer`, `initialState`, y `memoizedState = initialState` en el hook. `dispatch` es una función que crea un objeto `Update` con la acción, lo agrega a una cola (`updateQueue`) en el hook, y programa un re-render (llamando a `scheduleUpdateOnFiber`). En el próximo render (`updateReducer`), React procesa la cola de updates: itera sobre los Updates pendientes, para cada uno llama a `reducer(previousState, action)` (o usa el valor directo si no es función), y el resultado final es el nuevo `memoizedState`.

**Por qué**: El código relevante está en `ReactFiberHooks.new.js` (o `.old.js` para el modo legacy). `useState` se implementa como `useReducer` con `basicStateReducer`:
```js
function basicStateReducer(state, action) {
  return typeof action === 'function' ? action(state) : action
}
function useState(initialState) {
  return useReducer(basicStateReducer, initialState)
}
```
Esto muestra que `useState` y `useReducer` comparten exactamente la misma infraestructura. La diferencia es puramente semántica y de API: `useState` te permite pasar un nuevo valor directamente (`setState(newValue)`) o una función updater, mientras que `useReducer` requiere un objeto acción y un reducer separado. La cola de updates se procesa en orden, y React aplica batching: múltiples `dispatch` en el mismo handler se encolan y procesan juntas en el siguiente render. Fuente: Código fuente de React en github.com/facebook/react, "Inside Fiber: Hooks" en el blog de React, y "Deep Dive into React Hooks" por Max Koretskyi.

---

### 4. [Investigar] ¿Qué es el patrón "State Reducer" (popularizado por Kent C. Dodds en Downshift) y cómo se compara con `useReducer`? ¿Cómo permite que el consumidor de un componente controle CÓMO se actualiza el estado interno?

**Respuesta**: El State Reducer Pattern extiende `useReducer` permitiendo que el consumidor del componente inyecte un reducer personalizado que intercepta (y potencialmente modifica) los cambios de estado. El componente tiene su reducer interno (`internalReducer`), pero antes de aplicarlo, pasa la acción por el `stateReducer` del consumidor:

```ts
function useToggle({ stateReducer = (state, action) => action } = {}) {
  const [state, dispatch] = useReducer((state, action) => {
    const changes = stateReducer(state, action) // el consumidor puede modificar la acción
    // aplicar cambios al estado
  }, initialState)
}
```

El consumidor puede prevenir ciertas transiciones, modificarlas, o agregar side effects.

**Por qué**: Kent C. Dodds creó este patrón para Downshift (autocomplete accesible) porque diferentes aplicaciones necesitan diferentes comportamientos: una app quiere que al seleccionar un item, el input se limpie; otra quiere que mantenga el valor. Con el State Reducer Pattern, el consumidor controla la lógica de transición sin tener que reimplementar todo el componente. Este patrón es un ejemplo avanzado de "inversion of control" y es la base de cómo librerías headless (Downshift, React Table, TanStack) permiten personalización extrema. Fuente: "The State Reducer Pattern" en el blog de Kent C. Dodds, código fuente de Downshift, y "Inversion of Control in React" por Kent C. Dodds.

---

### 5. [Conectar] La clase muestra un logger middleware manual para `useReducer`. Investigá cómo `useReducer` se puede integrar con Redux DevTools usando el middleware `devtools` de Zustand o manualmente con `window.__REDUX_DEVTOOLS_EXTENSION__`. ¿Cómo conectarías el reducer de TaskFlow a Redux DevTools?

**Respuesta**: Redux DevTools se comunica mediante la API `window.__REDUX_DEVTOOLS_EXTENSION__`. Para conectar un `useReducer`, creás una conexión al iniciar el componente y envías cada acción:

```ts
function useReducerWithDevTools(reducer, initialState, name = 'Store') {
  const [state, dispatch] = useReducer(reducer, initialState)
  const devToolsRef = useRef()

  useEffect(() => {
    const ext = window.__REDUX_DEVTOOLS_EXTENSION__
    if (ext) {
      devToolsRef.current = ext.connect({ name })
      devToolsRef.current.init(initialState)
    }
    return () => devToolsRef.current?.unsubscribe()
  }, [])

  const dispatchWithDevTools = (action) => {
    dispatch(action)
    devToolsRef.current?.send(action, state) // state es previo
  }

  return [state, dispatchWithDevTools]
}
```

Alternativamente, Zustand con middleware `devtools` hace esto automáticamente (y es una de las razones para migrar a Zustand en Módulo 17).

**Por qué**: Redux DevTools es una extensión de navegador que implementa el protocolo de Redux para inspeccionar estado, acciones, y hacer time-travel debugging. Cualquier store que implemente `connect()` + `init()` + `send()` + `subscribe()` puede integrarse. Zustand implementa esto en su middleware `devtools`. Para `useReducer`, necesitás manualmente conectar y enviar. La limitación: después de `dispatch(action)`, `state` en el closure es el valor anterior (no el nuevo), por lo que Redux DevTools muestra el estado PREVIO en cada acción (o necesitás calcular `reducer(state, action)` manualmente). Fuente: Redux DevTools Extension docs, "Integrating Redux DevTools with useReducer" en múltiples tutoriales, y el middleware `devtools` de Zustand.

---

### 6. [Conectar] La clase menciona que los reducers deben ser puros. Investigá el concepto de "reducer puro" desde la perspectiva de Redux (Dan Abramov) y cómo React aplica esto en `StrictMode` (ejecutando reducers dos veces en desarrollo). ¿Qué diferencia hay entre un efecto secundario en un reducer y en un `useEffect`?

**Respuesta**: Un reducer puro es una función que: (1) dados el mismo state y action, siempre retorna el mismo nuevo state (determinismo), (2) no modifica el state existente (inmutabilidad), (3) no tiene efectos secundarios (no API calls, no random, no Date.now(), no mutaciones de variables externas). React StrictMode ejecuta reducers dos veces en desarrollo para detectar impurezas. Un efecto secundario en un reducer se ejecutaría dos veces, potencialmente creando datos duplicados o corrompiendo el estado. Los efectos secundarios pertenecen a `useEffect` (que se ejecuta DESPUÉS del render, no DURANTE) o a event handlers/thunks.

**Por qué**: Dan Abramov enfatizó la pureza de los reducers como la base del modelo de Redux, que React adoptó para `useReducer`. La pureza permite: (1) predecibilidad (el estado es función determinista de state + action), (2) time-travel debugging (reproducir cualquier secuencia de acciones), (3) testing simple (reducer es una función pura, no necesita mocks). StrictMode ejecuta los reducers dos veces llamando a `dispatch` dos veces internamente durante el mount, y comparando que ambos resultados sean iguales (si son diferentes, hay una impureza). Esto detecta bugs como `state.push(...)` o `new Date()` dentro del reducer. Fuente: "Redux: Reducers" en redux.js.org, "StrictMode: Detecting unexpected side effects" en react.dev, y "Why are Reducers Pure?" por Dan Abramov.

---

### 7. [Conectar] Expertos como Mark Erikson (mantenedor de Redux) recomiendan usar Immer por defecto en reducers. Compará el código de un reducer con y sin Immer para un estado complejo (tareas con subtareas, comentarios, etiquetas). ¿Qué patrones de error elimina Immer?

**Respuesta**: Sin Immer, actualizar una subtarea dentro de una tarea requiere múltiples niveles de spreads:
```ts
// Sin Immer
case 'UPDATE_SUBTASK':
  return {
    ...state,
    tasks: state.tasks.map(t =>
      t.id === action.taskId ? {
        ...t,
        subtasks: t.subtasks.map(st =>
          st.id === action.subtaskId ? { ...st, title: action.title } : st
        )
      } : t
    )
  }
```
Con Immer:
```ts
// Con Immer
case 'UPDATE_SUBTASK':
  const task = draft.tasks.find(t => t.id === action.taskId)
  const subtask = task?.subtasks.find(st => st.id === action.subtaskId)
  if (subtask) subtask.title = action.title
  break
```

Immer elimina: (1) olvidar un nivel de spread (el error #1 — mutar accidentalmente un objeto anidado), (2) errores de tipado en spreads profundos, (3) código difícil de leer con muchas llaves y paréntesis.

**Por qué**: Mark Erikson integró Immer en Redux Toolkit (`createReducer` usa Immer internamente) después de años de ver bugs por mutaciones accidentales en reducers. Immer garantiza inmutabilidad incluso si el desarrollador escribe código "mutable". El structural sharing de Immer también mejora performance: solo las partes del árbol de estado que cambiaron son nuevos objetos, el resto se comparte. Esto es valioso para selectores de Zustand y React.memo (las referencias no cambiadas = no re-render). Fuente: "Why Immer is a Must-Have for Reducers" por Mark Erikson, Redux Toolkit docs sobre Immer, y "Immer and Immutability in React" en el blog de Michel Weststrate.

---

### 8. [Cuestionar] ¿Cuándo usar `useReducer` vs múltiples `useState`? La clase dice que `useReducer` es para "estado complejo". Pero la comunidad debate si `useReducer` es overkill para casos que pueden manejarse con 2-3 `useState`. ¿Dónde está la línea?

**Respuesta**: La línea no es sobre la complejidad del estado, sino sobre la complejidad de las TRANSICIONES. Si las actualizaciones de estado son independientes (cambiar `name`, cambiar `email`, cambiar `age` en un formulario), múltiples `useState` es más simple. Si las actualizaciones son interdependientes (agregar una tarea también debería resetear el filtro, y actualizar la tarea debería tocar múltiples campos del estado), `useReducer` centraliza la lógica y evita bugs donde olvidás actualizar un estado relacionado. Kent C. Dodds sugiere: "useReducer para lógica de actualización que depende de múltiples piezas de estado o del estado previo de forma compleja."

**Por qué**: La ventaja de `useReducer` no es solo organización — es atomicidad. Cuando despachás `ADD_TASK`, el reducer produce el nuevo estado COMPLETO en una sola operación, garantizando que `tasks`, `filter`, y cualquier otro campo relacionado estén consistentes. Con múltiples `useState`, harías `setTasks(...)`, `setFilter(...)`, `setSearch(...)` en secuencia — React los batea en un render, pero el orden de los setters importa y es fácil olvidar uno. La desventaja de `useReducer` es el boilerplate: definir tipos de acción, el switch case, action creators. Para estados simples (un contador, un toggle), `useState` es claramente mejor. Fuente: "useState vs useReducer" en el blog de Kent C. Dodds, y "When to useReducer" en react.dev.

---

### 9. [Cuestionar] ¿Es `useReducer` + Context un reemplazo válido para Redux? La clase muestra este patrón. ¿Qué limitaciones tiene comparado con Redux Toolkit (middleware, DevTools, RTK Query) o Zustand (selectores finos, persistencia)?

**Respuesta**: `useReducer` + Context es un reemplazo válido para aplicaciones chicas/medianas con estado global simple, pero tiene limitaciones comparado con Redux Toolkit o Zustand: (1) no tiene middleware (thunks, sagas, logging), (2) no tiene selectores finos (cualquier cambio re-renderiza todos los consumidores a menos que hagas context splitting manual), (3) no tiene DevTools integradas, (4) no tiene persistencia, (5) no tiene soporte para acciones asíncronas sin implementar thunks manualmente. Redux Toolkit y Zustand resuelven todos estos con middleware y ecosistema.

**Por qué**: Mark Erikson (mantenedor de Redux) ha dicho que `useReducer` + Context es una "solución del 80%" para estado global, y que Redux Toolkit es para el 20% restante donde necesitás middleware, DevTools, y performance tuning. Zustand ocupa un punto intermedio: más simple que Redux, más potente que Context, con middleware (persist, devtools) integrados. Para TaskFlow, la migración de `useReducer` + Context a Zustand (Módulo 17) es natural porque ganamos persistencia automática, selectores finos, y eliminamos el Provider nesting. Fuente: "When should I use Redux?" en redux.js.org, "useReducer + Context vs Redux" por Mark Erikson, y docs de Zustand.

---

### 10. [Cuestionar] ¿Thunks vs Sagas vs async actions en el reducer? La clase usa `useReducer` con acciones sincrónicas. Para acciones asíncronas (fetchTasks, createTask), ¿dónde debería vivir esa lógica? ¿En el componente, en un custom hook, o en un middleware?

**Respuesta**: La lógica asíncrona NO debe vivir en el reducer (que debe ser puro y sincrónico). Tres enfoques válidos: (1) En el componente/event handler: `onClick` → `await api.createTask()` → `dispatch({ type: 'ADD_TASK', payload: result })`. (2) En un custom hook: `useCreateTask()` que internamente hace el fetch y llama a dispatch. (3) En un middleware/thunk: extender dispatch para aceptar funciones asíncronas. Para `useReducer` sin middleware, los enfoques (1) y (2) son idiomáticos. Con Redux Toolkit, `createAsyncThunk` es el enfoque (3). Con Zustand, las acciones asíncronas viven directamente en el store.

**Por qué**: La separación de concerns es: reducer = lógica de transición de estado (pura), componentes/hooks = orquestación de efectos secundarios y dispatch. Mezclar fetching en el reducer viola la pureza y causa los problemas que vimos (doble ejecución en StrictMode). El enfoque de custom hook es el más común en el ecosistema React sin Redux: `useTasks()` expone funciones como `addTask(title)` que internamente llaman a la API y hacen dispatch. Este es exactamente el patrón que TaskFlow usa entre Módulos 09 y 17. Con Zustand (Módulo 17), la lógica asíncrona puede moverse al store porque Zustand no requiere pureza en las acciones. Fuente: "Async Logic in Reducers" en redux.js.org, "Where to put async logic in React" por Kent C. Dodds, y el código de ejemplo en react.dev.
