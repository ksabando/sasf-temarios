---
sidebar_label: "Cuestionario"
---

# Cuestionario M01 — Setup de Proyecto con Vite + React + TypeScript

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué es el React Compiler (antes React Forget) y cómo cambiaría la necesidad de `useMemo` y `useCallback` en los proyectos Vite + React que configuramos? ¿Qué diferencia hay entre la memoización automática del compilador y la manual con hooks?

**Respuesta**: El React Compiler (anunciado en React Conf 2024, basado en el proyecto "React Forget") analiza el código de los componentes en tiempo de build y determina automáticamente qué valores y funciones deben ser memoizados, inyectando las optimizaciones equivalentes a `useMemo`/`useCallback` sin que el desarrollador los escriba. A diferencia de la memoización manual, el compilador es exhaustivo y no depende de que el desarrollador recuerde optimizar cada caso.

**Por qué**: El equipo de React (Joe Savona, Sathya Gunasekaran) presentó el React Compiler en React Conf 2024 como la evolución de React Forget. Funciona como un plugin de Babel que analiza el AST de los componentes y aplica reglas del "React Compiler Playground" para determinar qué memorizar. La diferencia clave es que el compilador asume que los componentes siguen las reglas de React (pureza de render, no mutación) y puede memoizar agresivamente donde manualmente sería tedioso. Vite puede integrarlo vía `@vitejs/plugin-react` con la opción `babel: { plugins: ['babel-plugin-react-compiler'] }`. Fuente: React documentation en react.dev/blog, talk "React Compiler" en React Conf 2024, y el RFC en el repo de React.

---

### 2. [Investigar] Rspack y Turbopack se presentan como alternativas a Vite. ¿Qué diferencias arquitectónicas reales tienen con Vite en desarrollo y build, y por qué Evan You (creador de Vite) los considera parte del mismo ecosistema y no competidores?

**Respuesta**: Rspack (ByteDance) es un bundler escrito en Rust compatible con la API de webpack, enfocado en builds de producción ultrarrápidos. Turbopack (Vercel) es un bundler incremental en Rust para Next.js que memoiza resultados de compilación a nivel de función. Vite usa esbuild y Rollup como motores subyacentes. Evan You ha declarado que la filosofía de Vite es ser agnóstico al framework y al bundler subyacente — el objetivo es la capa superior unificada (HMR, plugins, config) independientemente de si abajo corre esbuild, Rollup o eventualmente Rolldown (el bundler Rust del ecosistema Vite, escrito por el equipo de Vite).

**Por qué**: En ViteConf 2024, Evan You anunció Rolldown: un bundler en Rust desarrollado específicamente como reemplazo unificado de esbuild + Rollup, con el objetivo de tener un solo motor para dev y build. Rspack compite más directamente con webpack, y Turbopack está acoplado a Next.js. Vite se posiciona como la capa de integración y experiencia de desarrollo. Fuente: charla "Rolldown: The Future of Vite" — ViteConf 2024, blog de Evan You en evanyou.me, y discusiones en el repo de Vite (RFC #16417).

---

### 3. [Investigar] ¿Qué es Bun y por qué su enfoque de "all-in-one runtime + bundler + package manager" podría reemplazar la combinación Node.js + Vite + npm en proyectos React nuevos? ¿Qué limitaciones prácticas tiene actualmente?

**Respuesta**: Bun es un runtime de JavaScript (como Node.js) escrito en Zig que incluye bundler nativo, test runner, package manager compatible con npm, y soporte para TypeScript/JSX sin configuración. Reemplaza Node.js + Vite + npm con un solo binario. Sus limitaciones: ecosistema de plugins mucho menor que Vite, compatibilidad incompleta con algunos paquetes de Node.js (especialmente los que dependen de APIs nativas de V8), y Windows support relativamente nuevo (estable desde Bun 1.1).

**Por qué**: Bun implementa `bun build`, `bun test`, `bun install`, y `bun run` en un solo binario de ~90MB. Para proyectos React, `bun create react-app` genera un proyecto que corre TypeScript/JSX sin plugins adicionales. Sin embargo, librerías como `prisma`, `bcrypt`, y algunas dependencias nativas aún requieren Node.js. Según Jarred Sumner (creador de Bun), la meta es compatibilidad completa con Node.js. En la práctica actual (mid-2026), Bun es excelente para proyectos nuevos y desarrollo local, pero en producción muchas empresas aún prefieren Node.js LTS por estabilidad. Fuente: bun.sh/docs, talk "Bun 2.0" en React Summit 2025.

---

### 4. [Investigar] ¿Cómo funciona el flat config de ESLint (`eslint.config.js`) a nivel interno comparado con el legacy config (`.eslintrc`) y qué decisiones de diseño llevaron al equipo de ESLint a hacer este cambio? ¿Qué impacto tiene en proyectos React con TypeScript?

**Respuesta**: El flat config reemplaza el sistema de cascada y extends basado en strings por un array plano de objetos de configuración JavaScript, eliminando la resolución implícita de plugins y extends. Internamente, cada objeto es una "config object" independiente con `files`, `ignores`, `rules`, `plugins`, etc. Esto simplifica la resolución (no más `extends: ['airbnb']` que desencadena búsqueda en `node_modules`), permite composición mediante spreads de arrays, y hace que TypeScript y ESM sean ciudadanos de primera clase.

**Por qué**: Nicholas C. Zakas (creador de ESLint) escribió el RFC en 2019 citando problemas: la cascada de configs era impredecible, los extends basados en strings requerían resolución compleja de módulos, y no había soporte nativo para ESM. El flat config (estable desde ESLint 9.x) resuelve esto: cada plugin se importa explícitamente como módulo JS, la composición es vía array spreads, y la configuración es programática. Para React + TS: `import tseslint from 'typescript-eslint'; import reactPlugin from 'eslint-plugin-react'; import hooksPlugin from 'eslint-plugin-react-hooks'` — todo explícito. Fuente: ESLint blog post "Flat Config" (2022), RFC #9 en github.com/eslint/eslint, y la documentación oficial de ESLint 9.x.

---

### 5. [Conectar] La clase menciona que Vite usa esbuild en desarrollo y Rollup en build. Investigá cómo funciona el Hot Module Replacement (HMR) de Vite a nivel técnico (no solo conceptual) y cómo se diferencia del HMR de webpack. ¿Qué rol juega `@vitejs/plugin-react` en este proceso específicamente para componentes React?

**Respuesta**: El HMR de Vite usa ESM nativo: cada módulo se sirve como un archivo separado, y cuando uno cambia, Vite invalida la cadena de imports de ese módulo (usando el grafo de dependencias interno), envía un mensaje WebSocket al cliente con el módulo cambiado, y el navegador re-importa solo ese módulo. `@vitejs/plugin-react` agrega "React Fast Refresh" (sucesor de React Hot Loader) usando Babel para inyectar código de registro en cada componente, que permite preservar el estado local de hooks entre recargas de módulos.

**Por qué**: En webpack, HMR requiere que el bundle sea recompilado parcialmente y luego webpack determine qué chunks actualizar. En Vite, no hay bundle en desarrollo — cada archivo es un módulo ESM independiente. Cuando `Button.tsx` cambia, Vite: (1) invalida el módulo en el grafo, (2) envía `{ type: 'update', path: '/src/components/Button.tsx' }` vía WebSocket, (3) el cliente ejecuta `import('./src/components/Button.tsx?t=timestamp')`, (4) React Fast Refresh detecta que es un componente React y en lugar de remontarlo, actualiza sus hooks preservando el estado. `@vitejs/plugin-react` configura Babel con `react-refresh/babel`, que transforma componentes para incluir metadata de registro. Sin este plugin, el HMR funcionaría pero recargaría el componente completo perdiendo estado. Fuente: vite.dev/guide/api-hmr.html, github.com/facebook/react/tree/main/packages/react-refresh, y el código fuente de `@vitejs/plugin-react`.

---

### 6. [Conectar] TypeScript 5.7+ introdujo features como `--rewriteRelativeImportExtensions` y mejoras en el control-flow narrowing. Investigá qué características de TypeScript 5.7 y 5.8 son particularmente relevantes para proyectos React con Vite y cómo afectan el `tsconfig.json` que configuramos en clase.

**Respuesta**: TypeScript 5.7 agregó `--rewriteRelativeImportExtensions` (reescribe `.ts` → `.js` en los imports emitidos, esencial para proyectos ESM puros) y mejor narrowing en condiciones con `??`. TypeScript 5.8 introdujo verificación de `return` en funciones que retornan JSX y mejor control-flow para discriminated unions dentro de JSX expressions. Para Vite+React: `allowImportingTsExtensions` sigue siendo necesario en `tsconfig.json`, pero `rewriteRelativeImportExtensions` permite usar extensiones explícitas en imports (`.ts`/`.tsx`) que se convierten correctamente en el output sin necesidad de configuración extra.

**Por qué**: En proyectos Vite con `"moduleResolution": "bundler"`, TypeScript debe entender que Vite manejará las extensiones. TS 5.7 introdujo `rewriteRelativeImportExtensions` como contraparte de `allowImportingTsExtensions` — mientras esta permite escribir `.ts` en imports, aquella asegura que el emit use `.js`. En TS 5.8, el narrowing mejorado dentro de JSX expressions (`{data && <Component prop={data.field} />}`) reduce los falsos positivos de "possibly undefined". Fuente: TypeScript 5.7/5.8 release notes en devblogs.microsoft.com/typescript, y discusiones en el repo de Vite sobre compatibilidad con nuevas versiones de TS.

---

### 7. [Conectar] La clase explica `tsconfig.json` con `strict: true`. Investigá el flag `noUncheckedIndexedAccess` y explicá por qué el equipo de React recomienda habilitarlo y cómo cambiaría la forma en que tipás arrays de tareas (`tasks[0]`) en un proyecto React.

**Respuesta**: `noUncheckedIndexedAccess` hace que todo acceso por índice (`tasks[0]`, `obj[key]`) retorne `T | undefined` en lugar de `T`, reflejando la realidad de que un array puede no tener elemento en esa posición. React recomienda habilitarlo porque previene el patrón común de `tasks[0].title` que crashea si el array está vacío. Cambia el tipado de: `const first = tasks[0]; first.title` (error si array vacío) a requerir: `const first = tasks[0]; if (first) { first.title }`.

**Por qué**: Este flag no está incluido en `strict: true` porque el equipo de TypeScript lo consideró demasiado disruptivo para codebases existentes. Sin embargo, en codebases React modernos, previene una categoría entera de errores "Cannot read property of undefined" que ocurren cuando asumís que un array tiene elementos. El equipo de React (Dan Abramov, en discusiones en github.com/reactjs) y Matt Pocock (en Total TypeScript) recomiendan habilitarlo en proyectos nuevos. En Vite+React, agregás `"noUncheckedIndexedAccess": true` en `compilerOptions`. Fuente: TypeScript docs sobre noUncheckedIndexedAccess, Matt Pocock en "Total TypeScript Essentials", y discusiones en el repo de React sobre strict patterns.

---

### 8. [Cuestionar] Existe un debate en la comunidad sobre si Vite realmente es superior a CRA en 2026, dado que CRA está oficialmente deprecado y la recomendación oficial de React es usar un framework como Next.js o Remix. ¿Es Vite suficiente para una SPA profesional o la industria se movió hacia SSR/SSG con frameworks? Fundamentá con el posicionamiento oficial del equipo de React.

**Respuesta**: El equipo de React, en la nueva documentación de react.dev (2025), recomienda frameworks con SSR/SSG (Next.js, Remix, Gatsby) como punto de partida por defecto, y menciona Vite explícitamente como la opción para SPAs cuando no se necesita SSR. Esto generó debate porque sugiere que las SPAs puras son un "caso de uso secundario", a pesar de que muchas aplicaciones empresariales (dashboards, herramientas internas) no se benefician del SSR.

**Por qué**: Dan Abramov explicó en un issue de github.com/reactjs/react.dev que la recomendación de frameworks no es un rechazo a Vite o las SPAs, sino un reconocimiento de que la mayoría de los proyectos se benefician de SSR (SEO, performance inicial) y que los frameworks integran estas soluciones. Vite sigue siendo la herramienta recomendada para construir SPAs y es el build tool subyacente de muchos meta-frameworks (Astro, SvelteKit, SolidStart). Para TaskFlow (un dashboard interno), Vite SPA es la elección correcta. La controversia es que nuevos desarrolladores pueden interpretar el mensaje como "SPA = legacy". Fuente: react.dev "Start a New React Project", github discussions en reactjs/react.dev, y talks de Dan Abramov en React Conf sobre el futuro de las SPAs.

---

### 9. [Cuestionar] La comunidad está dividida sobre el flat config de ESLint: algunos equipos grandes reportan migraciones dolorosas desde `.eslintrc`. ¿Es realmente superior el flat config o fue un cambio innecesario que fragmentó el ecosistema? Evaluá argumentos de Nicholas Zakas y contraargumentos de la comunidad.

**Respuesta**: Nicholas Zakas defendió el flat config como necesario para resolver problemas estructurales del sistema anterior: resolución impredecible de `extends`, imposibilidad de usar ESM en configs, y complejidad excesiva en la API de plugins. Los críticos (incluyendo maintainers de configuraciones populares como eslint-config-airbnb) argumentaron que la migración rompió miles de configuraciones existentes, forzó a todos los plugins a reescribirse, y que los beneficios no justificaban el costo de migración para equipos que ya tenían configs estables.

**Por qué**: El flat config resuelve problemas reales (el algoritmo de cascada de `.eslintrc` era conocido por ser difícil de debugear), pero la transición fue disruptiva: ESLint 9 eliminó el soporte para `.eslintrc` completamente, forzando la migración. Equipos con configuraciones complejas que usaban `extends` anidados encontraron que el flat config requiere reescribir todo como arrays de objetos explícitos. Anthony Fu (creador de `eslint-config-flat-gitignore`) y otros desarrolladores crearon herramientas de migración, pero la fragmentación fue real. En proyectos React con TypeScript, la migración es más simple porque `typescript-eslint` ya soporta flat config nativamente. Fuente: ESLint blog "Flat config rollout plan", issues en github.com/eslint/eslint, y discusiones en twitter de Nicholas Zakas y Anthony Fu.

---

### 10. [Cuestionar] Existe un debate creciente sobre pnpm vs npm vs yarn en proyectos React, especialmente con Vite. ¿Qué diferencia técnica real hace pnpm (node_modules symlinked, strict dependency resolution) en el desarrollo diario y en CI/CD, y por qué algunos equipos grandes (como el de Vite mismo) migraron a pnpm?

**Respuesta**: pnpm usa un sistema de "content-addressable storage" con hard links en lugar de copiar paquetes a cada `node_modules`. Esto reduce drásticamente el uso de disco y el tiempo de instalación. Además, pnpm es estricto con las dependencias: un paquete solo puede importar dependencias declaradas en su propio `package.json` (no dependencias fantasma). npm/yarn permiten "phantom dependencies" que funcionan localmente pero fallan en entornos estrictos.

**Por qué**: El equipo de Vite migró a pnpm en 2023 citando tres razones: (1) instalación más rápida en CI (menos I/O porque usa hard links), (2) detección temprana de dependencias faltantes (phantom dependencies que npm permite pero que rompen en algunos entornos), (3) mejor manejo de monorepos con `pnpm workspaces`. Para un proyecto React con Vite, la diferencia práctica es: `pnpm install` es consistentemente 2-3x más rápido que `npm install` en frío, y detecta imports incorrectos que npm silenciaría. La contra: algunos scripts y herramientas asumen `node_modules` plano y requieren configuración adicional (`shamefully-hoist=true`). Fuente: pnpm.io/motivation, github.com/vitejs/vite/discussions sobre la migración a pnpm, y benchmarks en pnpm.io/benchmarks.
