---
sidebar_label: "Cuestionario"
---

# Cuestionario M20 — Animaciones con Framer Motion

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué es `@react-spring/web` y cómo se compara con Framer Motion? React Spring usa física de springs como primitiva fundamental, sin `duration` ni `ease`. ¿En qué casos React Spring es superior a Framer Motion?

**Respuesta**: React Spring (creado por Paul Henschel y el equipo de Poimandres) usa física de springs como base — toda animación es un spring (masa, tensión, fricción). Esto produce animaciones más naturales y fluidas que los tweens de Framer Motion, especialmente para animaciones continuas (arrastrar, scroll, gestos). React Spring tiene un API declarativa (`useSpring`, `useTransition`, `useTrail`) y un render props API (`<Spring>`). Es superior a Framer Motion para: (1) animaciones basadas en gestos continuos (drag, scroll-linked animations), (2) animaciones en canvas/WebGL (react-three-fiber usa React Spring), (3) secuencias de animación complejas con `useChain`. Framer Motion es superior para: (1) animaciones de layout (FLIP con `layout` prop), (2) animaciones de entrada/salida (`AnimatePresence`), (3) simplicidad para animaciones UI comunes.

**Por qué**: La diferencia fundamental: Framer Motion usa duración/easing por defecto (`duration: 0.3`), React Spring usa física de springs (se siente más natural pero es menos predecible). Para UI de aplicaciones (transiciones de página, hover effects, modales), Framer Motion es más simple. Para experiencias interactivas ricas (arrastrar elementos con física realista, animaciones basadas en scroll), React Spring es más potente. Para TaskFlow, Framer Motion es la elección correcta (necesitamos animaciones de UI, no física compleja). Fuente: react-spring.io, "React Spring vs Framer Motion" en el blog de Poimandres, y la charla "The Physics of Animation" por Paul Henschel.

---

### 2. [Investigar] ¿Cómo se integra GSAP (GreenSock Animation Platform) con React? GSAP es el estándar de la industria para animaciones web complejas. ¿Cuándo usarías GSAP en lugar de Framer Motion para un proyecto React y cómo lo integrarías con `useRef` y `useLayoutEffect`?

**Respuesta**: GSAP se integra con React usando `useRef` para seleccionar elementos y `useLayoutEffect` para aplicar animaciones imperativas:

```tsx
const boxRef = useRef<HTMLDivElement>(null)
useLayoutEffect(() => {
  const ctx = gsap.context(() => {
    gsap.from(boxRef.current, { opacity: 0, y: 50, duration: 0.5 })
  })
  return () => ctx.revert() // cleanup
}, [])
```

GSAP es preferible a Framer Motion cuando: (1) necesitás animaciones de timeline complejas (secuencias con posición exacta en el tiempo), (2) animaciones SVG complejas (morphing, drawSVG), (3) scroll-triggered animations con pinning y parallax, (4) necesitás máxima performance en animaciones con muchos elementos (GSAP es más rápido que Framer Motion porque opera directamente sobre el DOM). Framer Motion es preferible para animaciones declarativas simples y cuando querés que React "controle" la animación (estados de React → animación).

**Por qué**: GSAP es imperativo (llamás funciones en momentos específicos) y opera sobre el DOM directamente. Framer Motion es declarativo (definís estados iniciales/finales y el framework interpola). Para animaciones de UI típicas (hover, tap, entrada/salida de componentes), Framer Motion es más natural en React. Para animaciones narrativas o de alta complejidad (landing pages, visualizaciones), GSAP es la herramienta profesional. `gsap.context()` es crucial en React: agrupa animaciones y las limpia al desmontar, evitando memory leaks. Fuente: greensock.com/react, "GSAP + React Best Practices" por Carl Schooff (GSAP), y la comparación en el blog de GSAP.

---

### 3. [Investigar] ¿Qué es "motion" (la librería) y cómo se relaciona con Framer Motion? Motion es un fork/spin-off ligero? ¿Cuál es la diferencia de API y bundle size?

**Respuesta**: "Motion" (anteriormente "Framer Motion", ahora el paquete `motion`) es la evolución de Framer Motion mantenida por el equipo de Framer. El paquete `motion` es ~8KB gzipped (vs ~30KB de `framer-motion` legacy) porque eliminó dependencias internas y simplificó la API. La API cambió ligeramente: en lugar de `framer-motion`, importás de `motion`. La funcionalidad core (`motion.div`, `animate`, `AnimatePresence`) es la misma. El nombre "Framer Motion" sigue siendo el nombre del producto; el paquete npm se renombró a `motion` para simplificar.

**Por qué**: Matt Perry (creador de Framer Motion) lideró la transición a `motion` para reducir el tamaño del paquete y modernizar la API. El bundle más pequeño se logró eliminando dependencias duplicadas y optimizando internamente. Para proyectos nuevos, deberías usar `motion` (el paquete `motion` en npm). Para TaskFlow con `framer-motion` instalado (Módulo 20), podrías migrar a `motion` para reducir ~22KB del bundle. Fuente: motion.dev, "The Future of Framer Motion" por Matt Perry, y el changelog de migración de framer-motion a motion.

---

### 4. [Investigar] ¿Qué es la técnica FLIP (First, Last, Invert, Play) y cómo la implementa Framer Motion con el prop `layout`? Investigá el artículo original de Paul Lewis y cómo Framer Motion abstrae esta técnica para animar cambios de layout automáticamente.

**Respuesta**: FLIP (First, Last, Invert, Play) es una técnica de animación de layout acuñada por Paul Lewis (Google) para animar cambios de posición/tamaño de manera performante. Consiste en: (1) First: medir la posición/tamaño del elemento antes del cambio, (2) Last: medir después del cambio, (3) Invert: aplicar un `transform` inverso al delta para que visualmente el elemento parezca en su posición anterior, (4) Play: animar el `transform` a `none` y las propiedades de layout a sus valores finales. Framer Motion implementa esto con el prop `layout`: internamente, antes de un re-render, guarda `getBoundingClientRect()` de los elementos con `layout`, después del commit del DOM, calcula el delta, aplica el `transform` inverso en `useLayoutEffect`, y anima a la posición final.

**Por qué**: FLIP es performante porque solo anima `transform` y `opacity` (propiedades que el navegador puede animar en la GPU, sin causar layout/paint). Framer Motion abstrae todo el proceso: solo agregás `layout` a un elemento y cuando cambia de posición/tamaño debido a un re-render (cambio de estado), Framer Motion lo anima suavemente. El artículo original de Paul Lewis (2015) es la base de esta técnica. Fuente: "FLIP Your Animations" por Paul Lewis en aerotwist.com, el código fuente de Framer Motion (layout animation), y "Inside Framer Motion: Layout Animations" por Matt Perry.

---

### 5. [Conectar] La clase usa `AnimatePresence` para animar elementos que se montan/desmontan. Conectá esto con el concepto de "exit animation" en React. ¿Por qué React por sí solo no puede animar la salida de un componente, y cómo `AnimatePresence` resuelve esto manteniendo el componente "vivo" durante la animación?

**Respuesta**: React, cuando una condición se vuelve `false`, desmonta el componente inmediatamente (lo remueve del DOM y destruye su Fiber). No hay tiempo para una animación de salida. `AnimatePresence` mantiene un registro de los hijos que están "saliendo" (keys que estaban en el render anterior pero no en el actual). Cuando un hijo desaparece del árbol, `AnimatePresence` lo retiene en el DOM, aplica la prop `exit` (que inicia la animación de salida), espera que la animación termine (`onAnimationComplete`), y solo ENTONCES lo remueve del DOM y notifica a React que el componente fue desmontado.

**Por qué**: Internamente, `AnimatePresence` tiene dos arrays: `present` (hijos actuales) y `all` (hijos actuales + hijos salientes en animación). Cuando un hijo está en `all` pero no en `present`, se renderiza con su prop `exit` activa. Cuando la animación termina, se remueve de ambos arrays. Esto es un workaround necesario porque React no tiene un hook de ciclo de vida "beforeUnmount". El equipo de React está explorando una API nativa para exit animations (el propuesto `useUnmountAnimation`), pero mientras tanto, `AnimatePresence` es la solución estándar. Fuente: Código fuente de `AnimatePresence` en el repo de Framer Motion, "Why React can't animate unmount" en el blog de Matt Perry, y discusiones en github.com/facebook/react sobre exit animations.

---

### 6. [Conectar] La clase menciona `useReducedMotion` para accesibilidad. Conectá esto con las pautas WCAG 2.3.3 (Animation from Interactions). ¿Qué requisitos específicos impone WCAG para animaciones y cómo implementarlos con Framer Motion?

**Respuesta**: WCAG 2.3.3 establece que las animaciones iniciadas por interacción del usuario deben poder desactivarse, a menos que la animación sea esencial para la funcionalidad. Para implementarlo con Framer Motion: (1) usar `useReducedMotion()` para detectar la preferencia del usuario, (2) desactivar animaciones de movimiento (parallax, scroll-linked) cuando `prefers-reduced-motion: reduce`, (3) mantener animaciones de opacidad/fade (no causan mareo) incluso en modo reducido, (4) no usar `duration: 0` para simplemente "saltar" (puede ser confuso), sino usar fade simple. WCAG 2.3.2 (Three Flashes or Below Threshold) también aplica: no usar animaciones que parpadeen más de 3 veces por segundo.

**Por qué**: Algunos usuarios tienen trastornos vestibulares y las animaciones de movimiento (slide, zoom, parallax) causan mareos y náuseas. `prefers-reduced-motion` es una media query del sistema operativo que estos usuarios activan. Respetarla no es opcional — es un requisito de accesibilidad (WCAG AA). Implementación correcta:
```ts
const shouldReduce = useReducedMotion()
const variants = shouldReduce
  ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } // solo fade
  : { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } } // fade + slide
```
Fuente: WCAG 2.1 "Success Criterion 2.3.3", "prefers-reduced-motion" en MDN, y la guía de accesibilidad de Framer Motion.

---

### 7. [Conectar] La clase usa `variants` para definir estados de animación. Conectá esto con el patrón "Design Tokens + Variants" de design systems. ¿Cómo podrías unificar los variants de animación con los variants de estilo (CVA) en un sistema de diseño cohesivo?

**Respuesta**: Creando un objeto de "design tokens" que mapee variantes de UI a propiedades de estilo Y animación:

```ts
const cardTokens = {
  enter: {
    style: { opacity: 0, y: 20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: {
    style: { opacity: 0, y: -20 },
    transition: { duration: 0.2 }
  },
  hover: {
    style: { scale: 1.02 },
    transition: { type: 'spring', stiffness: 400 }
  },
} as const
```

Los componentes usan estos tokens tanto para CVA (estilos CSS) como para Framer Motion (props de animación). Esto unifica la "fuente de verdad" de cómo se ve y se mueve cada variante.

**Por qué**: En design systems grandes, las animaciones son parte del lenguaje visual (junto con colores, tipografía, espaciado). Unificar tokens de animación con tokens de estilo asegura consistencia: todos los `Card` entran igual, todos los `Modal` salen igual. Framer Motion `variants` + CVA `variants` comparten la misma estructura (objetos con claves de variante), lo que permite que un solo token defina ambos. Fuente: "Design Tokens for Animation" en el blog de Framer, "CVA + Framer Motion" en la documentación de shadcn/ui, y "Motion Design Systems" por Matt Perry.

---

### 8. [Cuestionar] ¿CSS Animations vs JS Animations en React? La clase usa Framer Motion (JS). Algunos argumentan que las animaciones CSS son más performantes (GPU-accelerated, no pasan por el main thread de JS). ¿Cuándo deberías usar CSS puro en lugar de Framer Motion?

**Respuesta**: CSS animations son preferibles para: (1) animaciones simples y estáticas (hover effects, loading spinners, transitions de color), (2) cuando no necesitás coordinar la animación con el estado de React, (3) cuando la performance es crítica y la animación puede delegarse completamente a la GPU (opacity, transform). Framer Motion/JS es necesario cuando: (1) la animación depende del estado de React (montar/desmontar, cambiar layout basado en datos), (2) necesitás secuenciar animaciones (stagger, orquestación), (3) necesitás animaciones basadas en gestos (drag, hover con spring physics), (4) necesitás animar propiedades que CSS no puede (scroll-linked, SVG path).

**Por qué**: CSS animations corren en el compositor thread del navegador (fuera del main thread de JS), por lo que son inmunes a bloqueos de JavaScript. Pero no pueden reaccionar al estado de React (no saben cuándo un componente se montó o cuando `count` cambió de 0 a 42). La recomendación pragmática: CSS para animaciones puramente visuales (hover, focus, loading), Framer Motion para animaciones que reflejan cambios de estado de la aplicación. Fuente: "CSS vs JS Animations" en web.dev de Google, "Performance of CSS vs JavaScript Animations" por Paul Lewis, y la comparación en el blog de Framer Motion.

---

### 9. [Cuestionar] ¿Es Framer Motion demasiado pesado para una SPA? El paquete `framer-motion` pesa ~30KB gzipped. Para una app donde solo animás un par de elementos, ¿justifica el costo? ¿Qué alternativas más livianas existen?

**Respuesta**: Para animaciones mínimas (solo fade in/out, hover scale), CSS puro o la Web Animations API nativa (`element.animate()`) son alternativas de 0KB. Para animaciones declarativas ligeras: `@react-spring/web` (~10KB), `motion` (~8KB), o `auto-animate` (~2KB, solo anima cambios de children). Para TaskFlow, donde usamos animaciones de entrada de tareas, `AnimatePresence`, drag, layout animations, y stagger, Framer Motion está justificado (usamos ~70% de sus features). Si solo usaras `whileHover` y `animate={{ opacity: 1 }}`, Framer Motion sería sobredimensionado.

**Por qué**: La decisión debe basarse en cuántas features usás. Si usás solo `motion.div`, CSS custom properties + `transition` pueden reemplazarlo (~80% del uso). Si usás `AnimatePresence`, `layout`, `drag`, y `staggerChildren`, Framer Motion justifica su peso. Para TaskFlow, evaluá con `rollup-plugin-visualizer`: si Framer Motion es >5% del bundle y solo usás fade + hover, considerá alternativas. Si usás múltiples features, mantenelo. Fuente: bundlejs.com para comparar tamaños, "Alternatives to Framer Motion" en el blog de LogRocket, y la discusión en el repo de Framer Motion.

---

### 10. [Cuestionar] ¿Animaciones en React: lujo o necesidad? Algunos desarrolladores argumentan que las animaciones distraen y ralentizan la UI. Otros las consideran esenciales para la UX. ¿Qué dice la investigación de UX sobre el impacto de las animaciones en la usabilidad?

**Respuesta**: La investigación de UX (Nielsen Norman Group, Baymard Institute) muestra que las animaciones mejoran la usabilidad cuando: (1) comunican relaciones espaciales (dónde fue un elemento que desapareció), (2) indican cambios de estado (transición entre páginas, feedback de acción), (3) reducen la carga cognitiva (transiciones suaves vs saltos abruptos). Las animaciones empeoran la UX cuando: (1) son lentas (>300ms — hacen la UI sentirse lenta), (2) son meramente decorativas sin propósito informativo, (3) no respetan `prefers-reduced-motion`. La regla: animaciones funcionales (comunicar, guiar, dar feedback) = sí. Animaciones decorativas (rebotes, giros, brillos sin sentido) = no.

**Por qué**: En TaskFlow, animaciones funcionales: (1) tareas que entran/salen de la lista comunican adición/eliminación, (2) sidebar que se expande muestra relación espacial, (3) badge de completado que cambia de color da feedback de acción. Animaciones innecesarias que evitar: (1) animar el logo en cada página, (2) efectos de parallax en el fondo del dashboard, (3) transiciones excesivamente lentas (>500ms). La duración ideal para animaciones de UI funcionales es 150-300ms. Fuente: "Animation in UX" por Nielsen Norman Group, "The Role of Animation in UX" por Val Head, y "Motion Design Manifesto" por Issara Willenskomer.
