---
sidebar_label: "Cuestionario"
---

# Cuestionario M02 — Componentes Base y Props

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué son React Server Components (RSC) y cómo cambia el concepto de "componente funcional con props" que vimos en clase? ¿Qué props son válidas en un Server Component y cuáles no, y por qué?

**Respuesta**: React Server Components (RSC) son componentes que se ejecutan exclusivamente en el servidor (build time o request time) y nunca se envían al cliente. A diferencia de los componentes funcionales tradicionales (Client Components), los RSC pueden ser `async`, acceder directamente a bases de datos, y no tienen acceso a hooks (`useState`, `useEffect`) ni a APIs del navegador. Las props de un RSC deben ser serializables (no pueden ser funciones, elementos React no serializables, ni objetos con métodos) porque viajan desde el servidor al cliente como JSON.

**Por qué**: RSC fue introducido en React 18 (experimental) y estabilizado en React 19. La arquitectura divide el árbol de componentes: los Server Components se ejecutan en el servidor y su output es un stream de "React Server Component Payload" (formato especial, no HTML), mientras que los Client Components (marcados con `'use client'`) se hidratan en el navegador. Las props de un RSC deben ser serializables porque React las serializa para enviarlas al cliente junto con los Client Components. Esto limita props como `onClick` o `children` que son funciones — deben ser pasadas a Client Components específicamente. Fuente: React RFC "React Server Components" (github.com/reactjs/rfcs), react.dev "Server Components", y la charla "Data Fetching with React Server Components" por Dan Abramov y Lauren Tan.

---

### 2. [Investigar] ¿Qué es el debate de "signals" vs React state? Explicá cómo librerías como Preact Signals o SolidJS implementan reactividad a nivel granular, y cómo esto contrasta con el modelo de re-renderizado de arriba hacia abajo de React con props. ¿Podrían los signals reemplazar `useState` en React?

**Respuesta**: Los signals son primitivas reactivas (como `signal(value)` en SolidJS o `useSignal(value)` en Preact) que rastrean automáticamente qué partes del DOM dependen de qué valores, y actualizan SOLO esos nodos DOM cuando el valor cambia — sin re-ejecutar componentes completos. En React, `useState` dispara un re-render del componente entero (y recursivamente de sus hijos), y luego el Virtual DOM hace diffing para determinar cambios mínimos. Los signals operan a nivel de granularidad de valor individual, no de componente.

**Por qué**: SolidJS (Ryan Carniato) construyó su modelo de reactividad sobre signals: los componentes se ejecutan UNA sola vez (no en cada cambio de estado), y las expresiones JSX que leen signals se convierten en suscripciones granulares. Preact Signals (de Marvin Hagemeister y el equipo de Preact) trae este modelo a React/Preact con `@preact/signals-react`. La ventaja es performance: si `user.name` cambia, solo se actualiza el nodo de texto que muestra `user.name`, no todo el componente `UserProfile`. La desventaja es que rompe el modelo mental de React (donde "la UI es una función del estado") y no hay compatibilidad directa con hooks que esperan re-renders. El equipo de React (Dan Abramov) ha dicho que los signals son una optimización interesante pero no reemplazarán el modelo de React, aunque sí influencian el diseño del React Compiler. Fuente: "Why Signals Are The Future" por Ryan Carniato (dev.to), "Signals in React" por Marvin Hagemeister, y discusiones en github.com/preactjs/signals/issues.

---

### 3. [Investigar] En React 19, `ref` pasa a ser una prop normal en componentes funcionales (ya no se necesita `forwardRef`). ¿Cómo funciona esto internamente y qué implicancias tiene para los componentes `Button`, `Input` y `Card` que creamos en la clase? ¿`forwardRef` queda obsoleto?

**Respuesta**: React 19 permite pasar `ref` como una prop normal a cualquier componente funcional (sin `forwardRef`). Internamente, React ahora trata `ref` como una prop más durante el render, extrayéndola antes de pasarla al elemento DOM. `forwardRef` no queda obsoleto — sigue siendo necesario para casos donde querés un nombre de prop diferente para la ref, o cuando necesitás compatibilidad con versiones anteriores de React, o cuando usás `useImperativeHandle` que requiere la firma de `forwardRef`.

**Por qué**: La propuesta fue impulsada por el equipo de React (Andrew Clark, Sebastian Markbage) para simplificar la API. Antes, `ref` era tratada de forma especial por el reconciler y requería `forwardRef` como wrapper. Ahora, durante el render, React detecta si un componente funcional acepta `ref` como prop y maneja el attachment automáticamente. Para nuestros componentes de TaskFlow: `function Input({ ref, ...props }: InputProps & { ref?: React.Ref<HTMLInputElement> })` funciona directamente sin `forwardRef`. Sin embargo, `useImperativeHandle` todavía requiere la firma `(props, ref) =>` que solo `forwardRef` provee. Fuente: React 19 release notes en react.dev/blog, PR "ref as a prop" en github.com/facebook/react/pull/25922, y discusiones en el React 19 WG.

---

### 4. [Investigar] ¿Qué es `htm` (Hyperscript Tagged Markup) y cómo se relaciona con JSX? Investigá por qué algunos proyectos (Preact, algunos demos de React) lo usan en lugar de JSX y qué implicancias tendría para el tipado con TypeScript en nuestros componentes `Button` y `Card`.

**Respuesta**: `htm` es una librería de Jason Miller (creador de Preact) que permite escribir JSX-like syntax usando tagged template literals en lugar de JSX: `html\`<div>Hello \${name}</div>\`` en lugar de `<div>Hello {name}</div>`. No requiere compilador ni build step (JSX sin transpilación). En TypeScript, `htm` puede tiparse mediante el plugin `typescript-lit-html-plugin` o manualmente con tipos genéricos, pero la experiencia de tipado es inferior al JSX nativo porque TypeScript no conoce la forma del template literal.

**Por qué**: `htm` es popular en demos, CodeSandbox, y entornos donde configurar un build step sería excesivo. Preact lo usa en su template sin build tools. Para TypeScript, la limitación es que los tagged templates no tienen type checking de props como JSX — no hay verificación de que `html\`<\${Button} variant="primry"\`\`` tenga un typo en `variant`. En TaskFlow, JSX con TypeScript es claramente superior por la verificación en tiempo de compilación y el autocompletado. Fuente: github.com/developit/htm, Preact docs sobre htm, y talk "JSX without a Build Step" por Jason Miller.

---

### 5. [Conectar] La clase muestra `interface` para props y menciona que siempre es preferible a `type`. Investigá el artículo "Interface vs Type in TypeScript" y explicá en qué casos concretos (más allá de declaration merging) un `type` es técnicamente superior para props de componentes React, citando ejemplos de librerías como Radix UI o TanStack.

**Respuesta**: `type` es superior a `interface` en props cuando necesitás: (1) uniones de tipos (`type ButtonProps = PropsA | PropsB` — las interfaces no soportan uniones), (2) tipos condicionales (`type ListProps<T> = T extends ... ? ... : ...`), (3) intersecciones complejas con `Omit` y `Pick` reutilizando tipos de `React.ComponentProps`, (4) mapeo sobre keys (`type Variants = { [K in Variant]: ... }`). Librerías como Radix UI usan casi exclusivamente `type` para props.

**Por qué**: Tanner Linsley (TanStack) y el equipo de Radix UI prefieren `type` porque permite composición con utility types de forma más natural: `type ButtonProps = React.ComponentPropsWithoutRef<'button'> & { variant?: Variant }`. Con `interface`, la intersección (`extends`) funciona pero es menos flexible con uniones y condicionales. Matt Pocock (Total TypeScript) recomienda: "Usá `interface` por defecto para objetos que representan modelos de datos y `type` para props de componentes porque frecuentemente necesitás unions e intersecciones". La clase dice `interface` es mejor — la realidad es más matizada. Fuente: "Interface vs Type" en Total TypeScript de Matt Pocock, Código fuente de Radix UI (github.com/radix-ui/primitives), y el style guide de TanStack.

---

### 6. [Conectar] La clase presenta el Layout Pattern con `children`. Investigá cómo librerías como Radix UI `Slot` y el patrón `asChild` extienden el concepto de composición de componentes más allá de lo que permite `children`. ¿Cómo implementarías un `Button` con `asChild` en TypeScript?

**Respuesta**: El patrón `asChild` (popularizado por Radix UI) permite que un componente delegue su renderizado a su hijo directo, fusionando props. En lugar de `<Button as="a" href="/">`, usás `<Button asChild><a href="/">Link</a></Button>`. El componente clona su único hijo con `React.cloneElement` y mergea sus props. En TypeScript, requiere tipado complejo con genéricos para inferir el tipo del hijo.

**Por qué**: `asChild` es más flexible que `as` (polymorphic) porque permite wrapper components arbitrarios sin que el componente padre necesite conocerlos. Implementación simplificada:
```tsx
function Slot({ children, ...props }: { children: React.ReactElement }) {
  if (!React.isValidElement(children)) return null
  return React.cloneElement(children, { ...props, ...children.props })
}
```
Radix UI usa este patrón extensivamente: `<Dialog.Trigger asChild><Button>Open</Button></Dialog.Trigger>`. La ventaja sobre `children` simple es que el padre puede inyectar event handlers, ARIA attributes, y estilos en cualquier hijo. La desventaja es que la inferencia de tipos es compleja (requiere overloads de TypeScript). Fuente: Radix UI docs sobre "Composition", código fuente de `@radix-ui/react-slot`, y la charla "Primitives: A React Story" por JJ Kasper (Radix UI).

---

### 7. [Conectar] La clase usa `React.ReactNode` para tipar `children`. Investigá qué otros tipos existen en `@types/react` para tipar children (`React.ReactElement`, `React.PropsWithChildren`, `React.FC`) y por qué `React.FC` es controversial. ¿Por qué el equipo de React desaconseja `React.FC`?

**Respuesta**: `React.FC` (o `React.FunctionComponent`) es un tipo genérico que incluye implícitamente `children?: ReactNode` y retorna `ReactElement | null`. El equipo de React lo desaconseja activamente porque: (1) incluye `children` implícito incluso cuando el componente no lo usa (lo que permite `<Button>texto</Button>` sin error de TypeScript aunque Button no tenga `children` en sus props), (2) no soporta genéricos bien, (3) no es compatible con `forwardRef` sin type assertions. La recomendación actual es tipar props explícitamente sin `React.FC`.

**Por qué**: El create-react-app original popularizó `React.FC` como template, pero Dan Abramov y el equipo de React han aclarado desde 2019 que fue una decisión del equipo de CRA, no de React core. En la documentación actual de react.dev, los ejemplos NO usan `React.FC` — simplemente tipan las props: `function Button({ label }: { label: string })`. La razón técnica principal es que `React.FC<Props>` automáticamente agrega `children?: ReactNode` a las props, lo que hace que TypeScript no reporte error si pasás children a un componente que no los declara. Fuente: "Why I don't use React.FC" en el blog de Dan Abramov, discusión en github.com/facebook/create-react-app/issues/8177, y react.dev/typescript.

---

### 8. [Cuestionar] Hay un debate intenso en la comunidad sobre Tailwind CSS vs CSS Modules vs styled-components. ¿Es compatible el enfoque de "componentes base + props" con Tailwind, o Tailwind promueve un estilo diferente de escribir componentes React? ¿Qué dicen los creadores de estas herramientas?

**Respuesta**: Tailwind es perfectamente compatible con componentes base + props — de hecho, es el enfoque recomendado. Componentes como `<Button variant="primary">` internamente usan clases de Tailwind condicionales (`variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500'`). Sin embargo, Tailwind promueve extraer patrones repetitivos en componentes en lugar de crear abstracciones CSS (`.btn-primary`), lo que alinea con el modelo de componentes de React. Adam Wathan (creador de Tailwind) argumenta que CSS Modules y styled-components crean una capa de indirección innecesaria cuando ya tenés componentes React.

**Por qué**: La diferencia filosófica: Tailwind dice "la fuente de verdad de los estilos debe estar en el markup (JSX)", mientras que CSS Modules dice "los estilos deben estar en archivos CSS separados junto al componente". Styled-components va más allá creando componentes wrapper con estilos. Para TaskFlow, Tailwind con `clsx` o `cva` (class-variance-authority, creado por el equipo de shadcn/ui) es el enfoque más mantenible: definís variantes como objetos, y el componente aplica clases condicionalmente. El debate real es si CSS-in-JS tiene costo de runtime (styled-components = sí, Tailwind = no porque genera CSS estático en build). Fuente: "CSS Utility Classes and Separation of Concerns" por Adam Wathan (adamwathan.me), "The styled-components vs Tailwind debate" en el blog de Josh Comeau, y github.com/joe-bell/cva.

---

### 9. [Cuestionar] Los `defaultProps` en componentes funcionales están oficialmente deprecados por el equipo de React. ¿Por qué los eliminaron y cuál es el reemplazo idiomático? ¿Afecta esto a los componentes que escribimos en clase con valores por defecto en la destructuración?

**Respuesta**: Los `defaultProps` fueron deprecados porque: (1) con el React Compiler, no se puede analizar estáticamente un valor asignado en `Component.defaultProps` (está fuera de la función), (2) la destructuración con valores por defecto (`function Button({ variant = 'primary' }`) es más simple y TypeScript-friendly, (3) `defaultProps` en componentes funcionales no funcionaban bien con `React.memo` y el React Compiler. El reemplazo idiomático es exactamente lo que hicimos en clase: default values en la destructuración de parámetros.

**Por qué**: React 18.3 empezó a emitir warnings de deprecación y React 19 los removió del tipado oficial. La destructuración con defaults (`{ size = 'md' }`) es superior porque: TypeScript infiere el tipo como no-undefined después del default, es visible en la firma de la función (no hay que buscar en otro lado), y es compatible con el React Compiler que analiza el cuerpo de la función. Nuestro código de clase ya sigue la práctica correcta. Fuente: React 19 changelog en react.dev/blog, issue "Deprecate defaultProps on function components" en github.com/facebook/react, y el tweet de Dan Abramov explicando la transición.

---

### 10. [Cuestionar] La clase enseña que los componentes funcionales reemplazan a los componentes de clase. Sin embargo, hay casos donde los componentes de clase son técnicamente necesarios (Error Boundaries). ¿Es esto una inconsistencia en el diseño de React o una decisión deliberada? ¿Qué dice el equipo de React sobre un posible `useErrorBoundary` hook?

**Respuesta**: Es una decisión deliberada, no una inconsistencia. React requiere Error Boundaries como componentes de clase porque `componentDidCatch` y `getDerivedStateFromError` son métodos del ciclo de vida que se ejecutan DURANTE el commit y después de un error — hooks como `useEffect` o `useState` se ejecutan durante el render y no pueden capturar errores de render porque, por definición, el render falló. El equipo de React ha discutido un posible hook `useErrorBoundary` pero requeriría cambios profundos en el reconciler para permitir que hooks se ejecuten en una "fase de error".

**Por qué**: Andrew Clark y Brian Vaughn (React core team) explicaron en el RFC de Error Boundaries que la razón es técnica: cuando un componente lanza durante el render, React aborta ese subárbol y busca un Error Boundary. Los hooks dependen del orden de llamada durante el render — si el render es aborteado, no hay oportunidad de ejecutar hooks. La librería `react-error-boundary` (de Brian Vaughn) envuelve un componente de clase y expone una API de hooks, pero internamente sigue siendo un componente de clase. React no ha priorizado un hook nativo porque el patrón actual (wrapper component) funciona. Fuente: React docs sobre Error Boundaries, RFC en github.com/reactjs/rfcs, y el código fuente de react-error-boundary.
