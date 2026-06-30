---
sidebar_label: "Cuestionario"
---

# Cuestionario M16 — Testing en React con Vitest y React Testing Library

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué es Playwright Component Testing y cómo se compara con React Testing Library para testear componentes React? Playwright permite testear componentes en navegadores reales (Chromium, Firefox, WebKit). ¿Cuándo preferirías Playwright sobre RTL?

**Respuesta**: Playwright Component Testing ejecuta componentes React en navegadores reales (headless o visibles), lo que permite testear: estilos CSS reales (getComputedStyle, pseudo-elements), eventos nativos completos (drag & drop, hover, media queries), animaciones, y comportamiento cross-browser. RTL corre en jsdom (simulación de navegador en Node) que no implementa layout CSS, media queries, ni ciertos eventos nativos. Playwright es preferible para: (1) componentes con animaciones o transiciones CSS, (2) componentes de arrastrar y soltar, (3) comportamiento responsive (media queries), (4) e2e-like component tests que necesitan un navegador real.

**Por qué**: Playwright Component Testing se introdujo en Playwright 1.33 y usa Vite como servidor de desarrollo. Monta componentes en un iframe en un navegador real, permitiendo `expect(component).toHaveCSS('color', 'rgb(255, 0, 0)')` — algo imposible en jsdom. La desventaja: más lento que RTL (iniciar navegador toma ~1s), setup más complejo, y no es necesario para tests de lógica/hooks. La recomendación: RTL para tests unitarios y de integración (lógica, interacciones, accesibilidad), Playwright para tests visuales y de comportamiento CSS/browser. Fuente: playwright.dev/docs/test-components, "Playwright Component Testing vs RTL" en el blog de Playwright, y la charla "Testing React Components with Playwright" en React Summit.

---

### 2. [Investigar] ¿Qué es Storybook y cómo se integra con Vitest y Testing Library para testing visual y de interacción? Investigá el concepto de "Storybook Test Runner" y cómo permite escribir tests que verifican interacciones visualmente.

**Respuesta**: Storybook es un entorno de desarrollo y testing de componentes aislados. El "Storybook Test Runner" ejecuta cada story en un navegador (Playwright), captura screenshots, verifica interacciones (`play` function), y reporta regresiones visuales con herramientas como Chromatic (de los creadores de Storybook). Las stories definen estados del componente: `export const Primary = { args: { variant: 'primary' } }`. El `play` function usa Testing Library dentro de Storybook para simular interacciones: `await userEvent.click(canvas.getByRole('button'))`. El test runner verifica que el estado final sea correcto.

**Por qué**: Storybook + Test Runner cierra la brecha entre testing unitario (RTL) y testing visual. Un test en RTL verifica que `onClick` fue llamado. Un test en Storybook verifica que, después del click, el botón cambió de color (visual), el modal se abrió (DOM real), y no hay regresiones visuales (screenshot comparison). La integración con Chromatic permite "visual diffing" automático en CI: cada PR genera screenshots de todas las stories y las compara con la rama base. Esto detecta bugs visuales que RTL no puede. Fuente: storybook.js.org, "Storybook Test Runner" en el blog de Storybook, "Visual Testing with Storybook and Chromatic" en chromatic.com.

---

### 3. [Investigar] ¿Qué es "Mutation Testing" con Stryker y cómo revela tests que pasan pero no verifican nada? ¿Por qué 100% de code coverage no garantiza buenos tests? ¿Cómo aplicarías esto a los tests de TaskFlow?

**Respuesta**: Mutation Testing introduce "mutaciones" en el código fuente (cambiar `>` por `<`, `+` por `-`, eliminar líneas, invertir condiciones) y ejecuta los tests. Si un test SIGUE pasando después de una mutación, significa que el código mutado no está cubierto O el test no es lo suficientemente específico. Por ejemplo, si un test para `addTask` pasa aunque el código mutado no agregue la tarea al array (mutación: `[...tasks]` → `tasks`), el test es débil. "Mutation score" mide el % de mutaciones detectadas (ideal >80%). 100% code coverage solo significa que cada línea se ejecutó, no que el resultado fue verificado.

**Por qué**: Stryker (creado por la Universidad de Delft) es la herramienta líder de mutation testing para JavaScript/TypeScript. Para TaskFlow, Stryker podría revelar tests que: llaman a un handler pero no verifican que el argumento sea correcto, verifican que un elemento existe pero no que tenga el contenido correcto, o mockean respuestas de API pero no verifican que la UI refleje los datos mockeados. Integrado en CI (con `@stryker-mutator/vitest-runner`), Stryker genera un reporte de sobrevivencia de mutantes. Fuente: stryker-mutator.io, "Mutation Testing in JavaScript" en el blog de InfoQ, y "Why Code Coverage is Not Enough" por Kent C. Dodds.

---

### 4. [Investigar] ¿Qué es "Testing Trophy" de Kent C. Dodds y cómo se diferencia de la "Testing Pyramid" tradicional? ¿Por qué Kent C. Dodds recomienda enfocarse en tests de integración sobre tests unitarios, y qué rol juega MSW en esto?

**Respuesta**: El "Testing Trophy" prioriza: (1) la mayoría de los tests como "Integration Tests" (componentes completos con MSW mockeando la red), (2) algunos "Unit Tests" para funciones puras/lógica compleja, y (3) pocos "E2E Tests" para flujos críticos. La Pirámide tradicional de testing prioriza muchos tests unitarios, algunos de integración, y pocos E2E. Kent argumenta que los tests de integración (renderizar un componente, interactuar con él, verificar output) dan más confianza por línea de código que los tests unitarios (que prueban funciones aisladas que pueden pasar mientras la integración falla). MSW es clave porque permite mockear la red a nivel realista sin tocar el código del componente.

**Por qué**: La pirámide tradicional asume que los unit tests son más baratos y rápidos, pero en frontend, los unit tests de componentes suelen ser frágiles (acoplados a la implementación) y los integration tests (con RTL) son casi igual de rápidos. Con MSW, podés testear flujos completos (click botón → API call → UI se actualiza) sin un backend real, manteniendo los tests deterministas y rápidos. Para TaskFlow, esto significa: testear el flujo de login (escribir email/password → click → API call mockeada → redirección al dashboard), en lugar de testear `login(email, password)` como función aislada. Fuente: "The Testing Trophy and Testing Classifications" por Kent C. Dodds, blog de Testing Library, y "Write tests. Not too many. Mostly integration." por Guillermo Rauch.

---

### 5. [Conectar] La clase usa `screen.getByRole` como práctica recomendada. Conectá esto con la especificación WAI-ARIA y el concepto de "Accessibility Tree". ¿Por qué `getByRole` es más resiliente que `getByTestId`? ¿Cuándo es ACEPTABLE usar `data-testid`?

**Respuesta**: `getByRole` consulta el "Accessibility Tree" (la representación del DOM que usan lectores de pantalla), no el DOM visual. Esto significa que: (1) verifica que el elemento es accesible (tiene un role ARIA implícito o explícito), (2) es inmune a cambios de implementación (cambiar un `<div>` a `<button>` no rompe el test si el rol es "button"), (3) fuerza a que los componentes sean accesibles (si no encontrás un elemento por role, probablemente le falta `aria-label` o `role`). `data-testid` es un escape hatch para cuando: (1) el elemento no tiene role semántico (un contenedor puramente visual), (2) hay múltiples elementos con el mismo role y nombre y necesitás distinguirlos.

**Por qué**: Kent C. Dodds (creador de RTL) promueve la query priority: `getByRole` > `getByLabelText` > `getByPlaceholderText` > `getByText` > `getByDisplayValue` > `getByAltText` > `getByTitle` > `getByTestId`. Las primeras reflejan cómo el usuario interactúa (por rol, por label). Las últimas son cada vez más frágiles. `getByTestId` es el último recurso porque `data-testid` es invisible para el usuario y se vuelve ruido en el DOM. La filosofía: "The more your tests resemble the way your software is used, the more confidence they can give you." Fuente: Testing Library docs "Which query should I use?", "Making your UI tests resilient to change" por Kent C. Dodds, y la guía de WAI-ARIA en w3.org.

---

### 6. [Conectar] La clase testea `useDebounce` con `vi.useFakeTimers()`. Conectá esto con el concepto de "time mocking" en tests: ¿cómo testearías un hook que usa `requestAnimationFrame`, `IntersectionObserver`, o `ResizeObserver`? ¿Qué APIs de Vitest y RTL ayudan?

**Respuesta**: Para `requestAnimationFrame`, Vitest con `vi.useFakeTimers()` mockea `requestAnimationFrame` como `setTimeout(fn, 0)`. Para `IntersectionObserver` y `ResizeObserver`, jsdom NO los implementa nativamente, por lo que necesitás polyfills/mocks:

```ts
// Setup en setupFiles
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
```

Para tests más realistas, `@testing-library/react` provee `within` y queries que funcionan independientemente del observer usado. Para testear comportamiento específico de observers, necesitás mocks que disparen callbacks manualmente: `const observerCallback = vi.fn(); new ResizeObserver(observerCallback); observerCallback([{ contentRect: { width: 800 } }])`.

**Por qué**: jsdom es un subconjunto de APIs del navegador. `IntersectionObserver` y `ResizeObserver` no están implementadas en jsdom. Vitest expone `vi.stubGlobal()` para mockear APIs globales. Para tests de componentes que usan estas APIs (virtual scrolling, lazy images), necesitás mocks. Alternativa: usar Playwright Component Testing que corre en un navegador real con todas las APIs. Fuente: Vitest docs sobre "Mocking Globals", jsdom documentation sobre APIs soportadas, y "Testing IntersectionObserver in React" en el blog de Testing Library.

---

### 7. [Conectar] La clase usa MSW con `setupServer` para Node. Conectá esto con MSW en el navegador: ¿cómo usarías MSW para desarrollo local (mockear la API mientras el backend Spring Boot no está listo)? ¿Qué ventajas tiene sobre JSON Server?

**Respuesta**: MSW en el navegador se configura con `setupWorker` (en lugar de `setupServer` para Node). Los mismos handlers se comparten entre tests (Node) y desarrollo (navegador):

```ts
// src/mocks/browser.ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
export const worker = setupWorker(...handlers)

// main.tsx (solo en desarrollo)
if (import.meta.env.DEV) {
  const { worker } = await import('./mocks/browser')
  worker.start({ onUnhandledRequest: 'bypass' })
}
```

MSW intercepta peticiones a nivel de Service Worker (sin modificar `fetch` o `axios`), por lo que el código de la app no cambia entre desarrollo mockeado y producción real. JSON Server requiere cambiar la URL base de la API y no soporta lógica condicional en las respuestas (responder diferente según el body de la request).

**Por qué**: Con MSW, durante el desarrollo, todas las llamadas a `/api/tasks` son interceptadas y respondidas con datos mock realistas. Los handlers pueden tener lógica: `if (email === 'admin@test.com') return adminUser`. Cuando el backend Spring Boot está listo, simplemente desactivás MSW (`ENABLE_MSW=false`) y las peticiones van al backend real — sin cambiar una línea de código de componentes. Esta es una ventaja enorme sobre JSON Server. Fuente: mswjs.io/docs/integrations/browser, "Mocking APIs in Development with MSW" en el blog de MSW, y la documentación de Vite sobre variables de entorno.

---

### 8. [Cuestionar] ¿Enzyme vs React Testing Library? Enzyme (de Airbnb) dominó el testing de React por años, pero RTL es el estándar moderno. ¿Qué problemas fundamentales de Enzyme resolvió RTL y por qué Enzyme no es compatible con React 18/19?

**Respuesta**: Enzyme testea detalles de implementación (estado interno, props, shallow rendering) — podés testear `wrapper.state('count')`, `wrapper.instance().handleClick()`, o hacer `shallow()` que renderiza solo una capa. RTL testea comportamiento desde la perspectiva del usuario — solo podés interactuar con el DOM renderizado y verificar output visible. Enzyme no es compatible con React 18+ porque: (1) `shallow` rendering no funciona con hooks (que requieren el reconciler completo de React), (2) Enzyme depende de APIs internas de React que cambiaron en React 18 (Fiber, Concurrent Mode), (3) Airbnb dejó de mantener Enzyme activamente.

**Por qué**: RTL ganó porque los tests basados en comportamiento son más resilientes a refactors (cambiar de `useState` a `useReducer` no rompe tests si la UI sigue igual). Enzyme te permitía testear que `setState` fue llamado, pero esto se rompe al refactorizar a hooks. React 18 rompió definitivamente Enzyme porque el nuevo reconciler cambió APIs internas que Enzyme usaba. La comunidad migró masivamente a RTL entre 2019-2022. Para TaskFlow, RTL es la única opción compatible con React 18/19. Fuente: "Why I moved from Enzyme to RTL" por Kent C. Dodds, el issue "Enzyme + React 18" en github.com/enzymejs/enzyme, y la guía de migración en testing-library.com.

---

### 9. [Cuestionar] ¿Snapshot Testing: útil o perjudicial? La clase no cubre snapshots. La comunidad debate si los snapshots (Jest/Vitest `toMatchSnapshot()`) son una herramienta valiosa o un antipatrón que genera falsa confianza y ruido en PRs.

**Respuesta**: Los snapshots son útiles para: (1) detectar cambios no intencionales en output que es difícil de assertar manualmente (markup HTML complejo, estructuras de datos grandes), (2) tests de regresión visual de componentes simples (aunque Storybook + Chromatic es mejor). Son perjudiciales cuando: (1) se usan como sustituto de assertions específicas (snapshot de 500 líneas que nadie revisa), (2) se actualizan automáticamente con `--updateSnapshot` sin revisar (falsa confianza), (3) son frágiles (un cambio mínimo de markup rompe el snapshot sin que realmente haya un bug). La recomendación: usá snapshots solo para output pequeño y revisa cada cambio de snapshot en PRs como revisarías código.

**Por qué**: El problema no es la herramienta, es el uso. Snapshot de 10 líneas de markup de un componente pequeño (revisado en PR) = OK. Snapshot de 200 líneas de un formulario complejo (actualizado con `-u` sin mirar) = antipatrón. RTL recomienda preferir assertions específicas (`toHaveTextContent`, `toBeVisible`) sobre snapshots. Storybook + Chromatic (con visual diffing) es una alternativa más robusta para detectar cambios visuales. Fuente: "Snapshot Testing: Beyond the Hype" por Kent C. Dodds, "Effective Snapshot Testing" por Christopher Chedeau (creador de snapshots en Jest), y discusiones en el repo de Vitest.

---

### 10. [Cuestionar] ¿E2E vs Integration vs Unit para frontend? La clase usa integration tests (RTL + MSW). Algunos equipos usan SOLO E2E (Cypress/Playwright), otros SOLO unitarios (Vitest). ¿Cuál es la combinación óptima para una app como TaskFlow?

**Respuesta**: La combinación óptima según el Testing Trophy: (1) ~70% integration tests (RTL + MSW) — verifican flujos completos de UI (llenar formulario, submit, ver resultado), (2) ~20% unit tests — lógica de negocio pura (funciones de validación, formateo de fechas, filtrado de arrays), (3) ~10% E2E tests — flujos críticos de extremo a extremo con backend real o mockeado (login completo, checkout). Para TaskFlow: integration tests para TaskForm, TaskList, LoginPage; unit tests para `filterTasks()`, `formatDate()`; E2E tests para el flujo de registro + crear tarea + completar tarea.

**Por qué**: Los integration tests dan el mejor retorno de inversión (confianza / tiempo de escritura). Los unit tests para lógica pura son baratos y rápidos. Los E2E tests para flujos críticos previenen regresiones en integración real (frontend + backend). No necesitás E2E para todo — son lentos y frágiles. La clave: la mayoría de los bugs en React apps son de integración entre componentes (estado, props, eventos), no de lógica unitaria de funciones. Por eso RTL + MSW es la base de la estrategia de testing. Fuente: "The Testing Trophy" por Kent C. Dodds, "Static vs Unit vs Integration vs E2E Testing" en testing-library.com, y la guía de testing de Vite.
