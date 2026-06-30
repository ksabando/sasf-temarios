---
sidebar_label: "Cuestionario"
---

# Cuestionario M06 — Formularios Controlados y React Hook Form

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué es TanStack Form y cómo se compara con React Hook Form? Tanner Linsley (creador de TanStack Query) lanzó TanStack Form como alternativa. ¿Qué problemas de RHF intenta resolver y qué enfoque usa para el manejo de estado de formularios?

**Respuesta**: TanStack Form es una librería de formularios headless agnóstica de framework (React, Vue, Solid, etc.) creada por Tanner Linsley. A diferencia de RHF (que usa inputs no controlados con refs y delega el estado al DOM), TanStack Form mantiene el estado del formulario en un store interno observable (como Zustand) y ofrece: (1) type safety completa con TypeScript inferido desde el schema, (2) soporte nativo para arrays y objetos anidados sin APIs especiales como `useFieldArray`, (3) validación asíncrona integrada sin necesidad de `trigger`, (4) integración profunda con TanStack Query para submit asíncrono.

**Por qué**: Tanner Linsley argumenta que RHF es excelente para performance pero su API se volvió compleja con el tiempo (`Controller`, `useFieldArray`, `useWatch`, `FormProvider`), y que la decisión de delegar el estado al DOM hace que el estado del formulario no sea "observable" desde fuera (difícil de integrar con stores, sincronizar con URL, o testear). TanStack Form usa un store observable (basado en `@tanstack/store`) que permite suscribirse a cualquier parte del estado del formulario. Sin embargo, RHF sigue siendo más performante en formularios extremadamente grandes (cientos de campos) porque evita re-renders. Fuente: tanstack.com/form, "Introducing TanStack Form" en el blog de Tanner Linsley, y la comparación en el repo de TanStack.

---

### 2. [Investigar] ¿Qué es Conform y cómo aprovecha la Web API `FormData` y la validación nativa del navegador para simplificar formularios en React? ¿Cómo se compara su filosofía "use the platform" con el enfoque de RHF?

**Respuesta**: Conform es una librería creada por Edmund Hung que se basa en la API nativa `FormData` del navegador y en la Constraint Validation API (`checkValidity`, `setCustomValidity`). En lugar de abstraer los formularios, Conform los potencia: usa `<form>` nativos con `action` y `method`, valida usando la validación nativa del navegador + Zod para lógica compleja, y maneja la serialización automática via `FormData`. La filosofía es "use the platform" — trabajar CON el navegador, no contra él.

**Por qué**: Mientras RHF reemplaza el sistema de formularios nativo con uno propio (refs, store interno, register), Conform lo extiende. Ventajas de Conform: (1) funciona sin JavaScript (progressive enhancement), (2) los formularios son submitables con `Enter` naturalmente, (3) integración con Server Actions de React 19 (`action` prop), (4) menos API que aprender (usa `FormData` que es estándar). Desventajas: menos control fino sobre re-renders (similar a RHF con `mode: 'onSubmit'`), menos madurez de ecosistema. Para TaskFlow con React Hook Form, ambos enfoques son válidos — RHF es más popular y documentado, Conform es más "nativo". Fuente: conform.guide, "Conform: A new form library for React" en el blog de Edmund Hung, y la charla "Embracing the Platform" en React Summit.

---

### 3. [Investigar] ¿Cómo funciona internamente React Hook Form con `useSyncExternalStore` y el sistema de Proxy para `formState`? Investigá la arquitectura interna de RHF: ¿cómo logra que `formState.errors.title` cause re-render solo en el componente que lo consume y no en todo el formulario?

**Respuesta**: RHF mantiene un store interno (fuera de React) implementado como un objeto mutable con un sistema pub-sub basado en Proxy. Cuando accedés a `formState.errors.title`, el Proxy de `formState` registra tu componente como suscriptor de la propiedad `errors.title`. Cuando la validación produce un cambio en `errors.title`, RHF notifica solo a los componentes suscritos a esa propiedad específica. Para la integración con React, RHF usa `useSyncExternalStore` (en React 18+) o un polyfill que fuerza re-renders selectivos.

**Por qué**: Esta arquitectura es similar a Zustand con selectores. Internamente, RHF tiene: (1) un `_formState` mutable que almacena `errors`, `isDirty`, `isValid`, etc., (2) un `_proxyFormState` que es un Proxy que intercepta accesos y registra suscripciones, (3) un sistema de `_subjects` (observers) que notifican cambios. Cuando un componente renderiza y lee `formState.errors.title`, el Proxy registra `['errors', 'title']` como dependencia. Cuando `trigger('title')` completa la validación, RHF compara el nuevo error con el anterior via `Object.is`, y si cambió, notifica solo a los suscriptores de `['errors', 'title']`. Esto permite que cientos de campos validándose simultáneamente solo causen re-renders en los componentes afectados. Fuente: Código fuente de RHF en github.com/react-hook-form/react-hook-form, "React Hook Form Internals" por Bill Luo en YouTube, y discusiones en el repo de RHF sobre performance.

---

### 4. [Investigar] ¿Qué es Modular Forms y cómo se diferencia en su enfoque de type-safety? Compará Modular Forms, React Hook Form y TanStack Form en términos de inferencia de tipos TypeScript y experiencia de desarrollo.

**Respuesta**: Modular Forms (creado por Fabian Hiller) es una librería de formularios para React y Preact que pone la type-safety como prioridad máxima. A diferencia de RHF (donde los tipos de `register('name')` se infieren del schema pero no hay conexión entre el nombre del campo y su tipo), Modular Forms usa una API donde cada campo se define con su tipo explícito y el acceso es type-safe incluso sin schema externo. Para validación, se integra con Valibot (alternativa a Zod del mismo autor, más ligera y con mejor tree-shaking).

**Por qué**: La diferencia clave en type-safety: en RHF, `register('title')` retorna props genéricas, pero TypeScript no puede verificar que `title` sea un campo válido del schema a menos que uses `useForm<TaskFormData>`. En Modular Forms, cada campo es explícito y tipado:
```ts
const [titleField, titleValue] = useField<string>({ name: 'title', validate: ... })
// titleValue es string (no string | undefined) porque el valor inicial es requerido
```
Además, Modular Forms usa Valibot en lugar de Zod, que es más rápida y tree-shakeable (diferencia de ~1KB vs ~5KB en bundle final). Para TaskFlow, RHF sigue siendo la opción más madura y con más recursos, pero Modular Forms es una alternativa prometedora para proyectos que priorizan type-safety extrema. Fuente: modularforms.dev, "Why Valibot?" en el blog de Fabian Hiller, y la comparación en el repo de Modular Forms.

---

### 5. [Conectar] La clase usa `zodResolver` para integrar Zod con RHF. Investigá cómo funciona el sistema de resolvers de RHF a nivel técnico y cómo podrías escribir un resolver para una librería de validación custom. ¿Qué contrato debe cumplir un resolver?

**Respuesta**: Un resolver es una función que cumple el contrato `Resolver<T>`: `(values: T, context: object | undefined, options: ResolverOptions<T>) => ResolverResult<T>`. `ResolverResult` es `{ values: T, errors: FieldErrors<T> }` o una promesa de esto. El resolver recibe los valores actuales del formulario, ejecuta la validación (típicamente delegando a Zod, Yup, Valibot, etc.), y retorna el resultado en el formato que RHF espera. Si la validación pasa, retorna `{ values, errors: {} }`. Si falla, retorna `{ values: {}, errors: { campo: { type, message } } }`.

**Por qué**: El resolver es agnóstico a RHF — RHF solo espera un objeto con formato específico. Esto permite integrar cualquier librería de validación. Para escribir un resolver custom, necesitás: (1) ejecutar la validación sobre `values`, (2) si hay errores, construir un objeto `FieldErrors` donde cada key es el `path` del campo (en notación de puntos para campos anidados: `'user.address.street'`), (3) cada error debe tener `type` (string) y `message` (string). El path es crítico: RHF lo usa para asignar el error al campo correcto. Fuente: Documentación de RHF sobre resolvers, código fuente de `@hookform/resolvers`, y la guía "Writing a custom resolver" en react-hook-form.com.

---

### 6. [Conectar] La clase menciona `useRef` para inputs no controlados. Investigá el patrón "uncontrolled with form action" de React 19: ¿cómo los Server Actions y el prop `action` de `<form>` cambian la forma de manejar formularios, y cómo se relaciona con lo que vimos de `useRef` y `FormData`?

**Respuesta**: React 19 introdujo Server Actions: funciones async que pueden pasarse directamente al prop `action` de `<form>`. Cuando el formulario se envía, React serializa los campos a `FormData` y llama a la Server Action. Esto elimina la necesidad de `useState` o `useRef` para formularios de submit simple — los campos son no controlados y el `FormData` se construye automáticamente con los `name` de los inputs:

```tsx
async function createTask(formData: FormData) {
  'use server'
  const title = formData.get('title')
  // ...
}
function TaskForm() {
  return <form action={createTask}>
    <input name="title" />
    <button type="submit">Crear</button>
  </form>
}
```

Esto se relaciona con `useRef` porque ambos evitan re-renders, pero Server Actions van más allá: llevan la lógica al servidor.

**Por qué**: Este patrón es el opuesto a los formularios controlados con RHF — es "uncontrolled + progressive enhancement". Funciona sin JavaScript (el formulario submittea normalmente), pero con JavaScript React lo intercepta y llama a la Server Action. Para formularios con validación en tiempo real, seguís necesitando RHF o un enfoque client-side. Pero para formularios simples, Server Actions eliminan boilerplate. Esto es parte de la visión de React de "full-stack components" donde la lógica del servidor y cliente coexisten en el mismo archivo. Fuente: React 19 release notes sobre Server Actions, "React Server Components and Forms" en react.dev, y la talk de Dan Abramov en React Conf 2024.

---

### 7. [Conectar] Zod ofrece `.refine()` y `.superRefine()` para validaciones complejas. Investigá cómo usar `.superRefine()` para validaciones asíncronas (ej: verificar si un username ya existe contra una API) integradas con RHF. ¿Qué pasa con `isSubmitting` durante una validación asíncrona?

**Respuesta**: `.superRefine()` permite validaciones asíncronas con acceso a todo el objeto y al contexto. Para verificar username uniqueness:

```ts
const schema = z.object({
  username: z.string().min(3),
}).superRefine(async (data, ctx) => {
  const exists = await api.checkUsername(data.username)
  if (exists) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El username ya está en uso',
      path: ['username'],
    })
  }
})
```

Cuando RHF ejecuta este resolver, la validación asíncrona se ejecuta y `isSubmitting` sigue siendo relevante solo durante el submit, no durante la validación de campos individuales. Para validación asíncrona por campo (en `onChange` o `onBlur`), usás `trigger('username')` que ejecuta el schema completo (incluyendo `superRefine`).

**Por qué**: Zod ejecuta `.superRefine()` después de que todas las validaciones sincrónicas pasan. Si la función es async, Zod la espera. Internamente, `zodResolver` de RHF ejecuta `schema.safeParseAsync(data)` y maneja la promesa. Durante `trigger` o `handleSubmit`, RHF espera la resolución del resolver asíncrono antes de actualizar `formState.errors`. Esto significa que hay un delay entre que el usuario deja de escribir y ve "username disponible/no disponible" — por eso se suele combinar con debounce (evitar llamadas API en cada tecla). Fuente: Zod docs sobre `.superRefine()`, "Async Validation with React Hook Form" en la documentación de RHF, y ejemplos en el repo de RHF.

---

### 8. [Cuestionar] La clase dice que React Hook Form es "más performante que `useState` por campo". Pero para formularios pequeños (3-5 campos), ¿es realmente significativa la diferencia? ¿No introduce RHF una complejidad innecesaria y un acoplamiento a una librería externa para formularios simples?

**Respuesta**: Para formularios pequeños (<5 campos), la diferencia de performance entre RHF y `useState` es imperceptible. RHF brilla con formularios grandes (>20 campos) o dinámicos (field arrays). Usar RHF para un login form (2 campos) es sobre-ingeniería — `useState` es más simple y no requiere dependencia externa. Sin embargo, la comunidad (especialmente tutoriales y cursos) promueve RHF como "default", lo que puede llevar a usarlo innecesariamente.

**Por qué**: Kent C. Dodds y otros educadores han señalado que RHF es excelente para formularios complejos pero overkill para formularios simples. Un login form con `useState` son ~15 líneas de código; con RHF son ~25 líneas (más la instalación y setup del resolver). La recomendación pragmática: empezá con `useState` o `useRef` + `FormData`, y migrá a RHF cuando: (1) tengas más de 5 campos, (2) necesites validación cross-field, (3) necesites field arrays dinámicos, (4) necesites optimizar re-renders en un formulario grande. Para TaskFlow (formularios de 2-3 campos), `useState` sería suficiente para las fases iniciales; RHF se justifica cuando agregamos validación Zod compleja y formularios multi-paso. Fuente: "Don't use React Hook Form" (clickbait, pero con argumentos válidos) por Kent C. Dodds, discusiones en reddit.com/r/reactjs, y "When to use controlled vs uncontrolled" en el blog de Josh Comeau.

---

### 9. [Cuestionar] Existe un debate histórico entre Formik y React Hook Form. Aunque RHF es más popular hoy, Formik sigue siendo mantenido y usado en proyectos legacy. ¿Qué diferencias fundamentales de diseño hacen que RHF sea preferido en nuevos proyectos? ¿Qué casos de uso justificarían aún elegir Formik?

**Respuesta**: La diferencia fundamental es que Formik usa inputs controlados (cada campo es un `useState` interno, cada keystroke causa re-render), mientras que RHF usa inputs no controlados con refs (el DOM es la fuente de verdad, no React). Esto hace que RHF sea más performante en formularios grandes. Formik tiene una API más simple para formularios pequeños sin validación compleja y su enfoque controlado es más "React-like" (todo pasa por state de React). Casos donde Formik podría justificarse: migración de proyectos legacy, equipos que prefieren el patrón controlado, o integraciones con librerías que esperan `value`/`onChange` sincrónicos.

**Por qué**: Jared Palmer (creador de Formik) ha dicho que Formik fue diseñado en una era pre-hooks (2017) y que su arquitectura refleja eso (render props, `useField` hook agregado después). RHF (2019) fue diseñado desde cero con hooks y con la premisa de performance. En benchmarks, RHF es consistentemente más rápido en formularios con >30 campos. Pero la diferencia de DX (developer experience) es subjetiva: algunos desarrolladores prefieren el modelo mental de "estado en React" de Formik, especialmente si vienen de un background de Redux Form. Para proyectos nuevos, RHF es la elección del ecosistema. Fuente: npm trends comparando Formik vs RHF, "Formik vs React Hook Form" en el blog de LogRocket, y comentarios de Jared Palmer en twitter.

---

### 10. [Cuestionar] La clase muestra `register()` para inputs nativos y `Controller` para componentes de librerías. Hay un debate sobre si deberías evitar `Controller` completamente diseñando tus componentes para que expongan `ref` nativa (`forwardRef`). ¿Es `Controller` un "escape hatch" o una herramienta de primera clase? ¿Qué dice Bill Luo (creador de RHF)?

**Respuesta**: Bill Luo recomienda `register` siempre que sea posible, y `Controller` solo cuando el componente no puede exponer una `ref` al input nativo (como `<Select>` de librerías UI que renderizan múltiples elementos). La razón: `Controller` convierte el input en controlado (pasa `value` y `onChange` que disparan re-renders via `setValue` de RHF), perdiendo la ventaja de performance de los inputs no controlados. Si diseñás tus componentes con `forwardRef`, podés usar `register` directamente y mantener la performance óptima.

**Por qué**: Internamente, `Controller` crea un componente wrapper que usa `useWatch` y `useFormContext`, causando re-renders cuando el valor cambia. `register`, en cambio, solo adjunta una callback ref al input y RHF lee/escribe el valor directamente del DOM sin pasar por el estado de React. Para componentes de librerías como MUI que no exponen `ref` al input subyacente, `Controller` es inevitable. Pero para tus propios componentes (`Input`, `Select`, `Textarea`), diseñarlos con `forwardRef` que pase la ref al `<input>` real te permite usar `register` y evita la sobrecarga de `Controller`. Esta es la razón por la que en el módulo la clase crea `Input` con `forwardRef`. Fuente: Documentación de RHF sobre `register` vs `Controller`, "Why Controller is slower" en el repo de RHF, y la discusión en github.com/react-hook-form/react-hook-form.
