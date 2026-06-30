---
sidebar_label: "Cuestionario"
---

# Cuestionario M24 — Arquitectura Final y Mejores Prácticas

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué son los Micro-Frontends con Module Federation (Webpack 5) y cómo se comparan con una arquitectura feature-based monorepo? ¿Cuándo justifica la complejidad de micro-frontends?

**Respuesta**: Micro-Frontends dividen una app React en múltiples sub-aplicaciones independientes, cada una con su propio build, deploy, y equipo. Module Federation (Webpack 5, también soportado por Vite via `@originjs/vite-plugin-federation`) permite que estas sub-apps compartan dependencias en runtime. Comparado con una arquitectura feature-based monorepo (donde todo vive en un solo repo y build): micro-frontends permiten deploys independientes, diferentes versiones de React, y equipos autónomos. La complejidad extra (orquestación, estilos compartidos, comunicación cross-app) solo se justifica para aplicaciones muy grandes con múltiples equipos (50+ desarrolladores).

**Por qué**: Luca Mezzalira (autor de "Building Micro-Frontends") recomienda micro-frontends solo cuando la organización tiene equipos independientes que necesitan deploys independientes. Para TaskFlow o incluso una app mediana, micro-frontends son sobre-ingeniería severa. La arquitectura feature-based (que combina features en un solo build) es suficiente hasta que tengas problemas de coordinación entre equipos. Fuente: "Micro-Frontends" por Luca Mezzalira, Module Federation docs, y "Micro-Frontends: The Good, the Bad, and the Ugly" en el blog de ThoughtWorks.

---

### 2. [Investigar] ¿Qué es Nx monorepo y cómo mejora la arquitectura de un proyecto React? Nx (de Nrwl) ofrece generators, dependency graph, affected commands, y computation caching.

**Respuesta**: Nx es un build system para monorepos que ofrece: (1) generators para crear features/componentes con estructura consistente, (2) dependency graph automático (detecta dependencias circulares, muestra el grafo visual), (3) affected commands: `nx affected:test` solo ejecuta tests de proyectos afectados por un cambio, (4) computation caching: builds/tests cacheados. En un monorepo manual (TaskFlow), tendrías que implementar esto manualmente o no tenerlo.

**Por qué**: Nx brilla en monorepos con múltiples aplicaciones y librerías compartidas. Para TaskFlow (una sola app React), Nx es overkill. Pero para un proyecto con React frontend + React Native mobile + librería de componentes compartida, Nx es invaluable. Fuente: nx.dev, "Why Nx for React" en el blog de Nrwl, y la comparación Nx vs Turborepo vs Lerna.

---

### 3. [Investigar] ¿Qué es "Bulletproof React" (de Alan Alickovic) y cómo estructura un proyecto React "production-ready"? Compará su enfoque con la arquitectura de la clase.

**Respuesta**: Bulletproof React propone: (1) `src/features/` con cada feature autocontenida (similar a la clase), (2) separación estricta de API layer (funciones puras, no hooks), (3) componentes divididos en Elements/Form/Layout, (4) store por feature con Zustand, (5) testing colocado junto al código. Comparado con la clase: Bulletproof React va más allá en separación de capas (API layer separada de hooks) y en convenciones estrictas de testing con tests al lado del archivo fuente.

**Por qué**: Alan Alickovic documentó patrones de arquitectura React observados en proyectos enterprise exitosos. La recomendación de Bulletproof React de mantener la API layer pura (`export const getTasks = () => axios.get(...)`) y que los hooks la consuman hace el código más testeable (la API layer se testea con mocks de axios, los hooks con `renderHook`). Fuente: github.com/alan2207/bulletproof-react, "Bulletproof React Architecture" en el blog de Alan Alickovic.

---

### 4. [Investigar] ¿Qué es "Tao of React" (de Alexander Kondov) y qué principios de arquitectura propone que difieren de la clase?

**Respuesta**: "Tao of React" propone minimalismo: (1) no crear carpetas hasta que sean necesarias (empezar con todo en un archivo), (2) colocar archivos según dependencias, no según tipo (un hook que solo usa un componente va en la carpeta de ese componente), (3) evitar abstracciones prematuras, (4) componentes "stupid" (solo renderizar), lógica en hooks. Difiere de la arquitectura de la clase porque es más pragmático y menos dogmático sobre la estructura de carpetas inicial.

**Por qué**: Alexander Kondov critica la sobre-estructuración inicial y propone una arquitectura orgánica que evoluciona con el proyecto. Para TaskFlow, la arquitectura de la clase es un balance: suficiente estructura para ser mantenible, sin sobre-ingeniería. Fuente: alexkondov.com/tao-of-react, "The Tao of React" por Alexander Kondov.

---

### 5. [Conectar] La clase presenta Clean Architecture y Atomic Design. Conectá estos conceptos con el libro "Clean Architecture" de Robert C. Martin. ¿Cómo se traducen "dependency rule", "entities", y "use cases" al frontend React?

**Respuesta**: Clean Architecture en frontend: Entities = tipos TypeScript puros (`Task`, `User` sin dependencias de React). Use Cases = custom hooks (`useCreateTask`) y stores de Zustand. Interface Adapters = API layer, localStorage wrapper. Frameworks & Drivers = componentes React, React Router. La Dependency Rule: las capas externas dependen de internas (componentes dependen de hooks, hooks dependen de tipos, nunca al revés). Atomic Design complementa esto organizando la UI en Atoms → Molecules → Organisms → Templates → Pages.

**Por qué**: La adaptación de Clean Architecture al frontend no es 1:1 porque React está en todas partes. Pero el principio de que la lógica de negocio no debe depender de React es valioso: un store de Zustand es independiente de React y testeable sin montar componentes. Fuente: "Clean Architecture" por Robert C. Martin, "Clean Architecture in React" en múltiples blogs.

---

### 6. [Conectar] La clase organiza features con carpetas autocontenidas. Conectá esto con "cohesión funcional" vs "cohesión técnica". ¿Por qué agrupar por feature es superior a agrupar por tipo en proyectos grandes?

**Respuesta**: Cohesión funcional (feature-based) agrupa código que cambia junto: modificar auth toca solo `features/auth/`. Cohesión técnica (layer-based) dispersa el cambio en múltiples carpetas (`components/`, `hooks/`, `store/`, `services/`). En proyectos grandes, la cohesión funcional reduce la carga cognitiva, facilita code-splitting (cada feature puede ser un chunk), y permite que equipos trabajen en features independientes sin conflictos de merge. La cohesión técnica es más simple inicialmente pero no escala.

**Por qué**: La ley de Conway aplica: la estructura del código refleja la estructura de comunicación del equipo. Si tenés equipos por feature (equipo auth, equipo tasks), la arquitectura feature-based minimiza la coordinación entre equipos. Fuente: "Cohesion and Coupling in Software Design" por John Ousterhout, discusiones en el blog de Kent C. Dodds sobre estructura de carpetas.

---

### 7. [Conectar] La clase usa ESLint strict rules. Conectá esto con el concepto de "static analysis beyond ESLint". ¿Qué herramientas complementan ESLint para mantener la calidad de código en un proyecto React?

**Respuesta**: Más allá de ESLint: (1) TypeScript strict mode + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` (prevención de bugs de tipos), (2) Prettier (formateo consistente, reduce discusiones en PRs), (3) Knip (detecta imports, exports, y dependencias no usados), (4) depcheck (detecta dependencias npm no usadas), (5) bundle size checker (previene que PRs incrementen el bundle sin intención), (6) typesync (sincroniza @types con dependencias), (7) sherif (valida consistencia de package.json en monorepos). Juntas, estas herramientas automatizan la higiene del código.

**Por qué**: ESLint detecta problemas de estilo y lógica, pero no detecta imports muertos (Knip), dependencias no usadas (depcheck), o tipos flojos (TypeScript strict). La combinación de herramientas de static analysis crea una "red de seguridad" que previene que código de baja calidad llegue a producción. Fuente: github.com/webpro-nl/knip, depcheck docs, y "Beyond ESLint: Static Analysis for JS" en el blog de Anton Medvedev.

---

### 8. [Cuestionar] ¿Feature-based vs Domain-Driven Design (DDD) en frontend? La clase usa feature-based. ¿Deberíamos aplicar conceptos de DDD (aggregates, bounded contexts) a la arquitectura React?

**Respuesta**: Feature-based es el equivalente práctico de DDD Bounded Contexts en frontend: cada feature es un bounded context con su propio lenguaje ubicuo, entidades, y reglas. DDD completo (aggregates, value objects, domain events, repositories) suele ser overkill para frontend, pero los principios aplican: (1) bounded context = feature folder, (2) aggregate = store de Zustand, (3) domain event = acciones del store, (4) repository = API layer. Para TaskFlow, feature-based es suficiente. DDD completo tendría sentido en una app con lógica de negocio muy compleja (seguros, fintech) donde las reglas de negocio dominan.

**Por qué**: El frontend es principalmente presentación y orquestación. La lógica de negocio compleja debería vivir en el backend. El frontend refleja los bounded contexts del backend, pero no necesita modelar aggregates completos. Fuente: "Domain-Driven Design in Frontend" por Khalil Stemmler, "DDD for React Apps" en el blog de Stately, y discusiones en la comunidad de Arquitectura de Software.

---

### 9. [Cuestionar] ¿Monorepo vs polyrepo para proyectos React? La clase usa un solo repo. ¿Cuándo un polyrepo (múltiples repos) es mejor?

**Respuesta**: Monorepo: mejor para proyectos donde el frontend y backend (o múltiples frontends) comparten código (tipos, utilidades, configuraciones) y se despliegan juntos. Polyrepo: mejor para equipos completamente independientes con ciclos de release diferentes, o cuando el frontend y backend son mantenidos por organizaciones separadas. Para TaskFlow (frontend + Spring Boot), un monorepo (o repo separado por stack) es apropiado. Polyrepo sería útil si el equipo de frontend y backend tienen ciclos de sprint independientes y nunca comparten código.

**Por qué**: El debate monorepo vs polyrepo es resuelto por herramientas modernas: Turborepo/Nx para monorepos con múltiples apps, o GitHub Actions separados para polyrepos. La tendencia es hacia monorepos por la simplicidad de compartir tipos y configuraciones. Google, Meta, y Microsoft usan monorepos masivos. Fuente: "Monorepo vs Multirepo" en el blog de Semaphore, "Why Google uses a monorepo" en ACM, y la experiencia de Vercel con Turborepo.

---

### 10. [Cuestionar] ¿Atomic Design es sobre-ingeniería para la mayoría de proyectos React? Brad Frost creó Atomic Design para design systems. ¿Cuándo justifica su uso y cuándo es una estructura innecesaria?

**Respuesta**: Atomic Design es valioso cuando construís un design system reutilizable (librería de componentes para múltiples aplicaciones). Para una sola aplicación (TaskFlow), la distinción estricta entre atoms y molecules puede ser innecesaria — los componentes pueden organizarse simplemente en `components/ui/` (genéricos) y `features/*/components/` (específicos). La sobre-ingeniería ocurre cuando gastás más tiempo clasificando componentes (¿esto es atom o molecule?) que construyendo la aplicación. La recomendación: aplicá los principios de Atomic Design (composición, reusabilidad) sin el rigor taxonómico.

**Por qué**: Brad Frost mismo ha dicho que Atomic Design es una "metáfora" y una "herramienta de pensamiento", no una especificación rígida. En proyectos reales, la línea entre atom y molecule es difusa. Enfocate en el principio (componentes pequeños que se componen) en lugar de la taxonomía exacta. Fuente: "Atomic Design" por Brad Frost, "Atomic Design in Practice" en el blog de Brad Frost, y discusiones en la comunidad sobre la aplicación pragmática del patrón.
