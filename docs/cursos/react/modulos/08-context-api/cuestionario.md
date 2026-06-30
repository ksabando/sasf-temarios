---
sidebar_label: "Cuestionario"
---

# Cuestionario M08 — Context API y Autenticación

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué es Jotai y cómo resuelve los problemas de re-renders de Context API? Daishi Kato (creador de Jotai y Zustand) diseñó Jotai como una alternativa atómica a Context. ¿Cómo funciona `atom()` y en qué se diferencia de `createContext` + `useState`?

**Respuesta**: Jotai es una librería de estado atómico donde cada pieza de estado es un `atom()` independiente. A diferencia de Context (donde un cambio en el value re-renderiza TODOS los consumidores), en Jotai cada átomo notifica solo a los componentes que lo leen. Los átomos son composables: podés derivar átomos de otros átomos (`const doubledAtom = atom(get => get(countAtom) * 2)`). No necesita Provider (aunque tiene `Provider` opcional para scoping).

**Por qué**: Daishi Kato describe Jotai como "estado global con granularidad de useState". Cada `atom` es como un mini-estado independiente. Cuando usás `useAtom(countAtom)`, te suscribís solo a ese átomo. Si otro átomo cambia, tu componente no se re-renderiza. Context API, en cambio, no tiene granularidad: un solo `Provider` value que cambia fuerza re-render de todos los `useContext`. Jotai resuelve esto sin necesidad de "context splitting" manual. Además, los átomos de Jotai pueden leerse/escribirse fuera de React (útil para interceptors, igual que Zustand). Para TaskFlow, Jotai sería una alternativa a Zustand + Context — más granular pero con una API diferente (átomos vs stores). Fuente: jotai.org, "Why Jotai?" por Daishi Kato, y la comparación Jotai vs Context en el blog de Daishi.

---

### 2. [Investigar] ¿Qué es `use-context-selector` y cómo permite suscribirse a partes específicas de un contexto sin re-renderizar cuando otras partes cambian? ¿Por qué no está integrado en React nativamente?

**Respuesta**: `use-context-selector` es una librería de Daishi Kato que implementa un hook `useContextSelector(Context, selector)` que solo re-renderiza cuando la porción seleccionada del contexto cambia. Internamente, mantiene un sistema de suscripciones granulares: cuando un componente usa `useContextSelector(ctx, s => s.user)`, se registra para solo los cambios a `user`. Cuando el Provider actualiza el value, la librería ejecuta todos los selectores y solo notifica a los componentes cuyo resultado del selector cambió (usando `Object.is`).

**Por qué**: React no lo integra nativamente porque: (1) rompería la garantía de consistencia del render (diferentes componentes podrían ver diferentes versiones del contexto durante un mismo render en Concurrent Mode), (2) podría causar "tearing" donde partes de la UI muestran estado inconsistente sin `useSyncExternalStore`, (3) el equipo de React está investigando soluciones más fundamentales. La librería usa internamente `useSyncExternalStore` para ser segura en Concurrent Mode. Hasta que React ofrezca una solución nativa, `use-context-selector` o Zustand (que usa el mismo principio) son las alternativas recomendadas para estado global con React Context. Fuente: github.com/dai-shi/use-context-selector, "Context Selectors" en el blog de Daishi Kato, y discusión "Why not useContextSelector in React?" en github.com/facebook/react/issues.

---

### 3. [Investigar] ¿Qué es React Server Context (o "Server Context") y cómo se relaciona con la Context API tradicional? React 19 está explorando formas de hacer que ciertos contextos se resuelvan en el servidor (Server Components) y se pasen serializados al cliente.

**Respuesta**: React Server Context es una evolución de Context API para el paradigma Server Components. En el modelo RSC, algunos componentes se ejecutan en el servidor y su output se serializa y envía al cliente. Ciertos contextos (como tema, locale, datos de sesión) pueden resolverse en el servidor y serializarse con el árbol de componentes, evitando la necesidad de un Provider en el cliente y la cascada de re-renders. El cliente recibe los valores ya resueltos sin necesidad de `createContext` + `Provider` del lado cliente para esos datos.

**Por qué**: Esto es parte de la visión "full-stack" de React. Actualmente, Context en el cliente requiere Providers que son componentes React (con todo el overhead de render). Con Server Context, datos como la sesión del usuario o el tema preferido se inyectan en el servidor y llegan al cliente como props serializadas, sin Providers. Esto elimina el problema de "Provider hell" (anidación de Providers) y los re-renders en cascada. Sin embargo, no todos los contextos pueden ser Server Context — solo aquellos cuyos valores son conocidos en el servidor y no cambian frecuentemente en el cliente. Fuente: React RFC "Server Context", discusiones en el React Working Group, y "React Server Components: Context" en Next.js docs.

---

### 4. [Investigar] `useOptimistic` (React 19) permite actualizaciones optimistas del estado. Investigá cómo podrías usar `useOptimistic` junto con Context API para implementar una experiencia de login optimista: mostrar al usuario como "logueado" inmediatamente mientras la API de login se procesa.

**Respuesta**: `useOptimistic` toma un estado real y un reducer de actualizaciones optimistas, y retorna `[optimisticState, addOptimistic]`. Para login optimista en Context, el Provider puede usar `useOptimistic` para mostrar inmediatamente el estado de "logueado" mientras la API se procesa:

```tsx
function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [optimisticUser, addOptimistic] = useOptimistic(user)

  const login = async (email, password) => {
    const tempUser = { email, name: 'Cargando...' } // placeholder
    addOptimistic(tempUser) // UI muestra usuario inmediatamente
    const realUser = await api.login(email, password)
    setUser(realUser) // actualiza con datos reales
  }

  return <AuthContext.Provider value={{ user: optimisticUser, login }}>
    {children}
  </AuthContext.Provider>
}
```

Esto hace que el header muestre "Hola, usuario@email.com" inmediatamente al hacer clic en login, sin esperar la respuesta del servidor.

**Por qué**: `useOptimistic` maneja automáticamente la reversión si la promesa falla. Si `api.login` lanza error, React revierte el estado optimista y `optimisticUser` vuelve a `null`. Esto es más robusto que implementar optimistic updates manualmente con `useState` (tendrías que guardar el estado previo, manejar errores manualmente, etc.). En el Context, el value expuesto es `optimisticUser`, que React actualiza instantáneamente cuando `addOptimistic` se llama, y revierte si la promesa falla. Fuente: React 19 docs sobre `useOptimistic`, RFC correspondiente en github.com/reactjs/rfcs, y el ejemplo de login en el blog de Vercel.

---

### 5. [Conectar] La clase usa `localStorage` para el token JWT y axios interceptors. Investigá cómo implementarías el patrón "silent refresh" con un interceptor de axios que maneje refresh tokens de forma transparente, incluyendo la cola de peticiones simultáneas (multiple requests queue). Conectá esto con lo visto de Context en clase.

**Respuesta**: El silent refresh intercepta errores 401, llama a `/auth/refresh` para obtener un nuevo access token, y reintenta la petición original. La cola es necesaria cuando múltiples peticiones reciben 401 simultáneamente — todas deben esperar a que UNA sola llamada de refresh complete:

```ts
let isRefreshing = false
let failedQueue = []

api.interceptors.response.use(null, async (error) => {
  const originalRequest = error.config
  if (error.response?.status === 401 && !originalRequest._retry) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      })
    }
    originalRequest._retry = true
    isRefreshing = true
    try {
      const { token } = await refreshToken()
      processQueue(null, token) // resuelve la cola
      originalRequest.headers.Authorization = `Bearer ${token}`
      return api(originalRequest)
    } catch (err) {
      processQueue(err, null) // rechaza la cola
      useAuthStore.getState().logout()
      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  }
  return Promise.reject(error)
})
```

Esto se conecta con Context porque el `logout()` en caso de fallo del refresh debe limpiar el estado de auth y redirigir a login.

**Por qué**: La cola implementa un patrón de "single-flight" para el refresh token. Si 5 peticiones reciben 401 al mismo tiempo, solo la primera dispara el refresh. Las otras 4 se encolan como promesas pendientes. Cuando el refresh termina, todas las promesas se resuelven (con el nuevo token) o se rechazan (si el refresh falló). Sin la cola, cada una dispararía su propio refresh, causando múltiples llamadas de refresh y potenciales race conditions. Este patrón es usado por Axios interceptors en producción (ej: en el cliente de Spotify, Auth0 SDK). Fuente: "Refresh Token Rotation" en Auth0 docs, código de axios interceptors en múltiples tutoriales, y "Handling JWT Refresh" en el blog de Hasura.

---

### 6. [Conectar] La clase crea `AuthContext` con `createContext<AuthState | undefined>(undefined)`. Investigá cómo unificar múltiples contextos (auth, tasks, ui) en un solo Provider que use `useReducer` internamente para el estado combinado, y cómo esto afecta los re-renders comparado con Providers anidados separados.

**Respuesta**: Unificar múltiples contextos en uno solo usando `useReducer` reduce el "Provider nesting" pero empeora los re-renders: cualquier cambio en cualquier parte del estado combinado re-renderiza TODOS los consumidores. Por eso la mejor práctica es lo opuesto: separar contextos por dominio y por frecuencia de actualización, y usar un componente `AppProviders` que componga los providers:

```tsx
function AppProviders({ children }) {
  return (
    <QueryClientProvider>
      <AuthProvider>
        <TaskProvider>
          <UIProvider>
            <RouterProvider>{children}</RouterProvider>
          </UIProvider>
        </TaskProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
```

**Por qué**: Cada Provider es una barrera de propagación. Si `UIProvider` cambia (sidebar toggle), solo los componentes dentro de `UIProvider` que leen el contexto de UI se re-renderizan — `AuthProvider` y sus hijos no se ven afectados porque están "arriba" en el árbol (son padres, no hijos). Context se propaga HACIA ABAJO, no hacia arriba. Por eso separar contextos por frecuencia de cambio es la optimización clave: `AuthContext` (cambia raramente), `TaskContext` (cambia frecuentemente al editar), `UIContext` (cambia constantemente con sidebar, modales). Si los fusionás, cada cambio de sidebar re-renderizaría el formulario de tareas. Fuente: "How to avoid Provider hell" en el blog de Kent C. Dodds, "React Context and Performance" en el blog de Daishi Kato, y el código de AppProviders en proyectos open-source como cal.com.

---

### 7. [Conectar] El patrón de "context guard" (`if (!context) throw Error(...)`) de la clase usa `createContext<T | undefined>(undefined)`. Investigá cómo Daishi Kato y el ecosistema de Zustand/Jotai manejan esto sin necesidad de context guards, eliminando la verificación de `undefined` y el error en runtime.

**Respuesta**: Zustand y Jotai no usan Context en su API pública — el estado se almacena en closures a nivel módulo. Esto significa que no hay "fuera del Provider": el store existe desde que el módulo se carga, y podés acceder a él desde cualquier componente sin verificar `undefined`. Zustand usa `useSyncExternalStore` para suscribirse al store externo. Jotai usa un store interno con átomos, y un Provider opcional solo para scoping (tests, múltiples instancias). Esto elimina el problema de "olvidar el Provider" — simplemente no hay Provider que olvidar.

**Por qué**: La eliminación del Provider y del context guard es una de las ventajas clave de Zustand/Jotai sobre Context API. En Context, el valor solo existe dentro del árbol de React debajo del Provider. En Zustand, `create()` retorna un hook que se conecta a un store que vive fuera de React. Esto es un cambio arquitectónico: el estado es independiente del ciclo de vida de los componentes. Podés leer `useAuthStore.getState()` en un interceptor de axios sin que ningún componente esté montado. Esto resuelve el problema de "context guard" de raíz — el estado siempre existe. Fuente: "Why Zustand doesn't need Provider" en el blog de Daishi Kato, código fuente de Zustand, y la comparación Zustand vs Context en la documentación de Zustand.

---

### 8. [Cuestionar] ¿Es Context API adecuado para estado global de autenticación o debería usarse Zustand/Redux? La clase usa Context para auth. Pero la comunidad debate si Context fue diseñado para estado global (alta frecuencia) o solo para inyección de dependencias (tema, locale).

**Respuesta**: Context API fue diseñado principalmente para inyección de dependencias de baja frecuencia (tema, locale, auth user object que cambia raramente). Sebastian Markbage (React core team) ha dicho explícitamente que Context no fue diseñado para estado global de alta frecuencia. Para auth específicamente, Context es adecuado porque: (1) el estado de auth cambia MUY raramente (login/logout, que ocurren pocas veces por sesión), (2) el objeto `user` se lee en muchos lugares. Pero para estado que cambia frecuentemente (carrito de compras, lista de tareas con actualizaciones en tiempo real), Context no es adecuado.

**Por qué**: La distinción clave es la frecuencia de cambio. Auth state cambia 2-3 veces por sesión (login, logout, refresh). Task state puede cambiar cientos de veces (cada toggle, cada update). Con Context, cada cambio de task re-renderizaría componentes que solo leen el user. La solución arquitectónica correcta es: Context para auth (baja frecuencia) + Zustand para tasks (alta frecuencia) + React Query para server state. Esto es exactamente lo que TaskFlow hará en módulos posteriores. Fuente: "Context is not for state management" por Sebastian Markbage en el blog de React, "When to use Context" en react.dev, y discusiones en github.com/facebook/react.

---

### 9. [Cuestionar] La clase almacena el token en `localStorage`. Hay un debate de seguridad sobre `localStorage` vs `sessionStorage` vs cookies HttpOnly. ¿Es realmente `localStorage` un riesgo de seguridad inaceptable para JWTs, o es un riesgo aceptable con las mitigaciones correctas (CSP, sanitización XSS)?

**Respuesta**: `localStorage` es vulnerable a XSS porque cualquier script en la página puede leer `localStorage.getItem('token')`. Las mitigaciones (CSP, DOMPurify, sanitización) reducen el riesgo pero no lo eliminan: si hay UNA vulnerabilidad XSS, el token es robado. Las cookies HttpOnly son inmunes a XSS porque JavaScript no puede leerlas. Sin embargo, `localStorage` con mitigaciones y access tokens de vida corta (15 min) es un riesgo aceptable para muchas aplicaciones. La recomendación de OWASP y Auth0 es usar HttpOnly cookies para aplicaciones de alta seguridad (banca, salud) y `localStorage` + CSP + refresh token rotation para aplicaciones de seguridad media.

**Por qué**: El debate es pragmático: `localStorage` es simple de implementar (no requiere cambios en el backend para setear cookies), funciona con SPAs desplegadas en CDNs (las cookies requieren mismo dominio), y es compatible con APIs de terceros. La postura de la industria (2026): para apps nuevas, usá BFF con HttpOnly cookies si es posible. Para apps existentes con `localStorage`, asegurate de tener: (1) CSP estricto sin `unsafe-inline`, (2) DOMPurify para cualquier HTML renderizado, (3) access tokens de vida corta + refresh token rotation, (4) auditá regularmente dependencias npm para XSS. Fuente: OWASP "Session Management Cheat Sheet", Auth0 "Token Storage" docs, y "JWT Storage: localStorage vs Cookies" por Randall Degges (Okta).

---

### 10. [Cuestionar] ¿Deberías separar `AuthContext` en `AuthStateContext` + `AuthActionsContext` como sugiere Daishi Kato? La clase usa un solo contexto. ¿El "context splitting" es una optimización prematura o una necesidad arquitectónica?

**Respuesta**: Depende del tamaño de la aplicación. Para TaskFlow, el context splitting probablemente es prematuro porque: (1) el estado de auth cambia muy raramente, (2) los consumidores de `login`/`logout` suelen también consumir `user` (el header muestra el nombre de usuario Y tiene el botón de logout). El splitting es beneficioso cuando tenés componentes que SOLO llaman a `logout` (como un botón en un menú de configuración) y nunca leen `user`. En ese caso, sin splitting, el botón se re-renderiza cuando `user` cambia (aunque no use `user`). Con splitting, el botón solo se suscribe a `AuthActionsContext` (cuyo value nunca cambia), evitando re-renders.

**Por qué**: Daishi Kato recomienda el splitting como patrón general, pero también reconoce que la complejidad adicional (mantener dos contextos, dos providers, dos hooks) debe justificarse. Para auth (baja frecuencia), el beneficio es mínimo. Para estado de UI (alta frecuencia, como `sidebarOpen`), el splitting es más valioso. La regla práctica: empezá con un solo contexto, y solo spliteá cuando React DevTools Profiler muestre re-renders innecesarios en componentes que consumen el contexto. Fuente: "Context Splitting" en el blog de Daishi Kato, "React Context Performance" en el blog de Kent C. Dodds, y el código de auth en aplicaciones open-source como cal.com.
