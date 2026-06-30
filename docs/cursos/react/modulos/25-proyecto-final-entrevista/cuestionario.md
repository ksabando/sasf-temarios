---
sidebar_label: "Cuestionario"
---

# Cuestionario M25 — Proyecto Final y Preparación para Entrevistas

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué es Vercel v0 y cómo la IA generativa está cambiando el desarrollo de aplicaciones React? ¿Cómo herramientas como v0, Copilot, y Cursor afectan la forma de escribir componentes?

**Respuesta**: Vercel v0 es una herramienta de UI generativa que crea componentes React + Tailwind a partir de prompts en lenguaje natural. Genera código TypeScript/React completo con componentes funcionales, props tipadas, y estilos Tailwind. GitHub Copilot y Cursor (IDE) asisten durante la escritura de código prediciendo el siguiente bloque. Estas herramientas cambian el flujo: en lugar de escribir componentes manualmente, describís la UI deseada y la IA genera el código que luego refinás. Para desarrolladores React, esto significa: (1) prototipado más rápido, (2) menos tiempo en boilerplate, (3) pero aún necesitás entender React para verificar, refinar y debugear el código generado.

**Por qué**: v0 está integrado con shadcn/ui y Tailwind, generando componentes que siguen buenas prácticas. Sin embargo, la IA no reemplaza el conocimiento de React — genera código que puede tener bugs, ser subóptimo, o no seguir las convenciones del proyecto. Para entrevistas, cada vez más se espera que sepas usar estas herramientas eficientemente (como "pair programming con IA") pero también que puedas explicar el código generado. Fuente: v0.dev, "AI-Assisted React Development" en el blog de Vercel, y discusiones sobre el impacto de la IA en el desarrollo frontend.

---

### 2. [Investigar] React 19 introdujo "Server Functions" (antes Server Actions) como primitiva para comunicación client-server. ¿Cómo cambian las Server Functions la arquitectura de una app e-commerce como ShopFlow comparado con REST APIs tradicionales?

**Respuesta**: Server Functions permiten llamar funciones del servidor directamente desde componentes React sin definir endpoints REST. Una Server Function es una función async con la directiva 'use server' que puede ser pasada como prop `action` de un formulario o llamada directamente. Para ShopFlow: en lugar de `POST /api/checkout` + `fetch`, definís `async function checkout(formData) { 'use server'; ... }` y la usás como `<form action={checkout}>`. Esto simplifica la arquitectura: eliminás la capa de API routes, reducís el boilerplate de axios/fetch, y mantenés type safety end-to-end.

**Por qué**: Las Server Functions son parte de la visión full-stack de React (junto con Server Components). Para ShopFlow (e-commerce), el flujo de checkout podría ser: formulario React Hook Form (cliente) → validación Zod (cliente) → submit → Server Function (servidor) → actualizar DB → retornar resultado. Esto elimina la necesidad de un servicio REST separado para el checkout. Sin embargo, para APIs que necesitan ser consumidas por terceros (mobile apps, otros servicios), REST/GraphQL sigue siendo necesario. Fuente: React 19 docs "Server Functions", "React Server Actions in E-Commerce" en el blog de Vercel, y la talk "Full-Stack React" por Dan Abramov.

---

### 3. [Investigar] ¿Qué es "Island Architecture" (Astro, Fresh) y cómo se compara con una SPA React tradicional? ¿Podría ShopFlow beneficiarse de un enfoque de islas?

**Respuesta**: Island Architecture renderiza la página como HTML estático con "islas" de interactividad (JavaScript hidratado solo donde se necesita). Astro (framework) usa este enfoque: la mayor parte de la página es HTML estático (sin JS), y solo componentes interactivos (carrito, formularios) son "islands" de React/Svelte/Vue. Comparado con una SPA React (donde TODO es JavaScript), Island Architecture reduce drásticamente el JavaScript enviado al cliente (mejor LCP, TTI). Para ShopFlow: la vista de catálogo (productos) podría ser estática con islas para el buscador y el botón de agregar al carrito; el checkout sería una isla más grande con React.

**Por qué**: Astro permite usar React dentro de las islas: `<Cart client:load><ReactComponent /></Cart>`. Esto combina lo mejor de ambos mundos: performance de sitios estáticos con interactividad de React donde se necesita. Para un e-commerce, esto es ideal: las páginas de producto son mayormente contenido (SEO, carga rápida), con pequeñas islas de interactividad. La contra: más complejidad de configuración y un modelo mental diferente. Fuente: astro.build, "Island Architecture" por Jason Miller (creador de Preact), y "E-Commerce with Astro + React" en el blog de Astro.

---

### 4. [Investigar] ¿Qué es la "React Forget/Compiler" en el contexto de un proyecto E-Commerce final? ¿Cómo cambiaría la forma de escribir código sin `useMemo`/`useCallback`/`React.memo` en ShopFlow?

**Respuesta**: Con el React Compiler habilitado, ShopFlow se escribiría SIN optimizaciones manuales de memoización. El compilador analiza los componentes y automáticamente aplica memoización donde es beneficioso. Esto significa: (1) eliminás `useMemo` en filtros de productos, (2) eliminás `useCallback` en handlers del carrito, (3) eliminás `React.memo` en ProductCard y CartItem. El código resultante es más limpio y directo: la lógica de negocio no está oscurecida por wrappers de performance. Si el compilador no puede optimizar algo (porque el componente viola las reglas de React), el linter del compilador te lo señala.

**Por qué**: El React Compiler es la culminación de años de iteración en React. Para un proyecto final como ShopFlow, usar el Compiler demostraría conocimiento de las últimas herramientas de React. El equipo de React (Joe Savona) demostró en React Conf 2024 que el compilador puede eliminar el 90%+ de useMemo/useCallback manuales en aplicaciones reales, resultando en código más mantenible. Fuente: react.dev/learn/react-compiler, "React Compiler in Practice" en React Conf 2024, y el React Compiler Playground.

---

### 5. [Conectar] La clase usa Zustand para el carrito de ShopFlow. Conectá esto con el patrón "Optimistic Cart" usado por Amazon y Shopify. ¿Cómo implementarías un carrito optimista con Zustand + React Query?

**Respuesta**: Un "Optimistic Cart" actualiza la UI del carrito inmediatamente antes de recibir respuesta del servidor, dando al usuario feedback instantáneo. Con Zustand + React Query: (1) el store de Zustand (`cartStore`) mantiene el estado local del carrito, (2) al agregar/remover items, el store se actualiza inmediatamente (optimista), (3) simultáneamente, una mutación de React Query envía el cambio al servidor, (4) si la mutación falla, se revierte el store de Zustand con `onError`. Esto da UX de app nativa (respuesta instantánea) con consistencia eventual con el servidor. Grandes e-commerce (Amazon, Shopify) usan este patrón.

**Por qué**: La percepción de velocidad es crítica en e-commerce. Un estudio de Amazon mostró que cada 100ms de latencia cuesta 1% en ventas. El carrito optimista elimina la latencia percibida: el usuario hace clic en "Agregar" y el contador del carrito se actualiza instantáneamente (via Zustand), sin esperar al servidor. Si la red falla, se revierte. Fuente: "Optimistic UI Patterns" en el blog de Shopify Engineering, "How Amazon built a faster cart" en el blog de Amazon, y TanStack Query docs sobre optimistic updates.

---

### 6. [Conectar] La clase usa `zodResolver` con Zod. Conectá esto con la validación de formularios de checkout en e-commerce: ¿cómo validarías reglas de negocio complejas como "no se puede comprar más de 10 unidades del mismo producto" o "el código de descuento es válido solo en productos sin oferta"?

**Respuesta**: Zod con `superRefine` para validaciones cross-field y asíncronas:

```ts
const checkoutSchema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number() })),
  discountCode: z.string().optional(),
}).superRefine(async (data, ctx) => {
  for (const item of data.items) {
    if (item.quantity > 10) {
      ctx.addIssue({ code: 'custom', message: `Máximo 10 unidades de ${item.productId}`, path: ['items', data.items.indexOf(item), 'quantity'] })
    }
  }
  if (data.discountCode) {
    const valid = await api.validateDiscount(data.discountCode, data.items)
    if (!valid) {
      ctx.addIssue({ code: 'custom', message: 'Código no válido para estos productos', path: ['discountCode'] })
    }
  }
})
```

**Por qué**: `superRefine` permite validaciones que requieren acceso a múltiples campos y llamadas asíncronas (verificar código de descuento contra API). En e-commerce, las reglas de negocio de checkout son complejas y frecuentemente requieren validación server-side (el descuento puede haberse agotado entre que se cargó la página y el submit). Zod + `superRefine` maneja esto elegantemente, integrado con RHF via `zodResolver`. Fuente: Zod docs "superRefine", "Building a Checkout Form" en el blog de Stripe, y ejemplos de validación de e-commerce.

---

### 7. [Conectar] La clase estructura ShopFlow con feature-based architecture. Conectá esto con el patrón "Vertical Slices" (Jimmy Bogard). ¿Cómo se relaciona feature-based con la idea de que cada feature es un slice vertical completo?

**Respuesta**: Vertical Slices (Jimmy Bogard) propone organizar el código por funcionalidad de extremo a extremo, no por capa técnica. Un slice vertical para "checkout" incluiría TODO lo necesario para esa funcionalidad: componentes UI, hooks, store, API calls, validación, y tipos — todo en `features/checkout/`. Esto contrasta con la arquitectura horizontal (capa de componentes, capa de hooks, capa de API) donde una feature está dispersa. Feature-based de la clase es esencialmente Vertical Slices aplicado a frontend. Cada feature es autónoma y puede desarrollarse, testearse, y desplegarse independientemente.

**Por qué**: Jimmy Bogard popularizó Vertical Slices para backend (.NET), pero el principio es el mismo para frontend: minimizar el acoplamiento entre features y maximizar la cohesión dentro de cada feature. Si eliminás la feature "checkout", borrás `features/checkout/` y listo (sin buscar archivos dispersos). Esto es el principio de "delete-ability" — una buena arquitectura facilita eliminar código. Fuente: "Vertical Slice Architecture" por Jimmy Bogard, "Feature Folders in React" en el blog de Bulletproof React, y "Vertical Slices for Frontend" por Robin Wieruch.

---

### 8. [Cuestionar] ¿SPA vs MPA vs Hybrid para e-commerce? La clase construye ShopFlow como SPA. ¿Es la arquitectura correcta para un e-commerce real?

**Respuesta**: Para un e-commerce real, una SPA pura no es óptima: el SEO es crítico (Google debe indexar productos), y la carga inicial debe ser rápida (LCP). La tendencia de la industria es: (1) páginas de producto y catálogo: SSG/SSR (Next.js, Remix, Astro) para SEO y LCP, (2) carrito y checkout: SPA-like con React para interactividad rica, (3) enfoque híbrido: Astro + islas de React, o Next.js App Router con Server Components para páginas estáticas y Client Components para interactividad. Shopify Hydrogen (Remix) y Vercel Commerce (Next.js) son ejemplos de este enfoque híbrido. Una SPA pura como ShopFlow es viable para un dashboard de administración de e-commerce, pero no para la tienda pública.

**Por qué**: El SEO es el factor decisivo. Google puede indexar SPAs (desde 2019), pero el ranking es mejor con SSR/SSG porque el contenido está disponible en el HTML inicial (sin esperar JS). Para la parte de administración (panel de admin de productos), una SPA es perfecta (no necesita SEO, es una herramienta interna). Fuente: "SPA vs MPA for E-Commerce" en el blog de Shopify, "Next.js Commerce" en nextjs.org/commerce, y "Rendering Strategies for E-Commerce" por Addy Osmani.

---

### 9. [Cuestionar] ¿CSR vs SSR vs SSG para e-commerce con React en 2026? La clase usa Vite SPA (CSR). ¿Debería un proyecto profesional de e-commerce usar Next.js en lugar de Vite?

**Respuesta**: Para un e-commerce profesional en 2026: Next.js (App Router) es la recomendación estándar porque combina SSG (páginas de producto), SSR (búsqueda dinámica), ISR (revalidación incremental para catálogos que cambian), y CSR (carrito interactivo) en un solo framework. Vite SPA (CSR-only) es mejor para dashboards administrativos, herramientas internas, y aplicaciones que no necesitan SEO. Para ShopFlow como proyecto final de aprendizaje, Vite SPA es válido porque cubre todos los conceptos de React. Para un e-commerce real, migrarías a Next.js conservando la misma lógica de React (componentes, hooks, stores, React Query, RHF, Zod, Framer Motion) porque todas estas librerías funcionan en Next.js.

**Por qué**: La diferencia entre Vite SPA y Next.js no es React (usan el mismo React) — es la estrategia de renderizado. Next.js te permite elegir por página: `'use client'` (SPA-like), Server Components (SSR/SSG), o static generation. Esto te da lo mejor de ambos mundos. La tendencia 2025-2026: Next.js para apps públicas, Vite para SPAs internas. Fuente: nextjs.org/docs/app, "Choosing between Vite and Next.js" en el blog de Lee Robinson (Vercel), y "The State of React 2025" survey.

---

### 10. [Cuestionar] ¿React o Next.js para un proyecto nuevo en 2026? La clase enseña React con Vite. Pero la recomendación oficial de react.dev es "start with a framework like Next.js or Remix". ¿Está equivocado el enfoque Vite SPA de la clase?

**Respuesta**: El enfoque de la clase NO está equivocado, pero es importante entender el contexto. React.dev recomienda frameworks porque resuelven problemas que Vite SPA no resuelve (SEO, routing, data loading, SSR) y la mayoría de proyectos nuevos se benefician de ellos. Pero Vite SPA es la mejor herramienta para APRENDER React: (1) menor complejidad inicial (no tenés que aprender Server Components, streaming, edge), (2) enfocás en React puro (estado, hooks, composición) sin las capas del framework, (3) todo lo que aprendés es transferible a Next.js/Remix (son el mismo React). La clase construye la base; migrar a Next.js después es natural porque ya sabés React. La postura de Dan Abramov: "Learn React first, then a framework."

**Por qué**: La recomendación de react.dev es para desarrolladores que quieren empezar un proyecto de producción. Para aprendizaje, el equipo de React mantiene que aprender React "puro" primero es válido y valioso. Además, muchas empresas tienen SPAs Vite en producción para dashboards, herramientas internas, y aplicaciones B2B donde el SEO no es crítico. Fuente: react.dev "Start a New React Project", "Should I use Next.js or Vite?" por Dan Abramov en React Discussions, y la encuesta "State of React 2025" que muestra Vite como el build tool #1 incluso en proyectos que usan Next.js.
