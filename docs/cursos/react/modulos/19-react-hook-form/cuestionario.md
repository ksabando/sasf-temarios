---
sidebar_label: "Cuestionario"
---

# Cuestionario M19 — React Hook Form Avanzado

**Instrucción**: Estas preguntas evalúan si investigaste más allá del
contenido de la clase. No alcanza con lo visto en `clase.md`.
Fundamentá tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] ¿Qué es TanStack Form y cómo se compara con React Hook Form? TanStack Form, creado por Tanner Linsley, es un "headless form state manager" que usa un store observable. ¿Qué ventajas tiene sobre RHF y en qué casos RHF sigue siendo preferible?

**Respuesta**: TanStack Form mantiene el estado del formulario en un store observable (basado en `@tanstack/store`) accesible desde cualquier parte de la app, no solo desde el formulario. Ventajas sobre RHF: (1) type safety superior (tipos inferidos automáticamente sin necesidad de `useForm<T>` genérico), (2) estado del formulario es "observable" fuera del formulario (otros componentes pueden suscribirse a cambios sin estar dentro del FormProvider), (3) arrays y objetos anidados funcionan sin APIs especiales (`useFieldArray` no es necesario — los arrays son ciudadanos de primera clase), (4) validación asíncrona integrada con el ciclo de vida de la query (se integra naturalmente con React Query). RHF sigue siendo preferible por: (1) performance superior en formularios muy grandes (cientos de campos, RHF usa refs vs TanStack Form que usa state), (2) ecosistema más maduro, (3) menos abstracción.

**Por qué**: Tanner Linsley diseñó TanStack Form para resolver problemas que RHF no aborda bien: estado del formulario accesible fuera del árbol de React (útil para guardar drafts en Zustand, sincronizar con URL, o testear), y formularios con validación asíncrona compleja. Para TaskFlow, RHF sigue siendo la elección correcta (formularios de tamaño mediano, ecosistema estable), pero TanStack Form es una alternativa a observar en el futuro. Fuente: tanstack.com/form, "Introducing TanStack Form" en el blog de Tanner Linsley, y comparaciones en el repo de TanStack.

---

### 2. [Investigar] ¿Qué es Modular Forms y cómo se compara con React Hook Form? Modular Forms (de Fabian Hiller) prioriza la type-safety y usa Valibot (alternativa ligera a Zod del mismo autor). ¿Qué diferencia fundamental de API tiene con RHF?

**Respuesta**: Modular Forms invierte el flujo: en lugar de `useForm` + `register`, usás hooks individuales por campo. Cada campo retorna sus props, valor, y errores tipados:

```ts
const [titleField, titleValue] = useField<string>({
  name: 'title',
  validate: val => val.length >= 3 ? '' : 'Mínimo 3 caracteres',
})
// titleField: { name, value, onChange, onBlur, ref } — props para spread
// titleValue: string — tipo inferido, no string | undefined
```

Esto da type safety superior porque TypeScript conoce exactamente el tipo de cada valor de campo sin necesidad de un schema Zod (aunque Zod/Valibot se integran). RHF usa `register('title')` que retorna props genéricas y el tipo depende del genérico `useForm<T>`.

**Por qué**: Fabian Hiller creó Modular Forms como alternativa a RHF para desarrolladores que valoran type safety extrema. La desventaja es más boilerplate (cada campo requiere `useField`) y menos madurez (comunidad más pequeña). Para TaskFlow, RHF es más simple y conocido. Modular Forms podría ser preferible para proyectos greenfield que priorizan type safety y tree-shaking sobre ecosistema. Fuente: modularforms.dev, "Why Modular Forms?" en el blog de Fabian Hiller, y la comparación en el repo de Modular Forms.

---

### 3. [Investigar] ¿Qué es Conform y cómo usa la Web API nativa para formularios? Conform (de Edmund Hung) se basa en `FormData`, Constraint Validation API, y el prop `action` de React 19. ¿Cómo afecta el enfoque "use the platform" a la necesidad de RHF?

**Respuesta**: Conform usa `<form>` nativos con `FormData` y validación nativa del navegador + Zod para validación custom. Genera automáticamente los atributos `name`, `form`, `aria-invalid` del schema Zod, y soporta progressive enhancement (el formulario funciona sin JavaScript). Con Server Actions de React 19, la integración es natural: `action={createTask}` recibe el `FormData`. Esto reduce significativamente la necesidad de RHF para formularios que no requieren validación en tiempo real compleja.

**Por qué**: Para muchos formularios (login, registro, creación simple de tareas), Conform + Server Actions es suficiente y más simple que RHF. RHF sigue siendo necesario para: (1) validación en tiempo real (`mode: 'onChange'`), (2) field arrays dinámicos complejos, (3) formularios multi-paso con estado compartido, (4) integración con componentes de UI que no son inputs nativos. La tendencia es: formularios simples → Conform o Server Actions nativos; formularios complejos → RHF o TanStack Form. Fuente: conform.guide, "Embracing the Platform: Forms in React 19" por Edmund Hung, y la charla "The Future of Forms" en React Summit.

---

### 4. [Investigar] Investigá cómo React 19 Server Actions cambian el manejo de formularios. ¿Cómo la prop `action` de `<form>` acepta una función async y maneja el estado de submit (loading, error) sin necesidad de RHF? ¿Cuándo seguirías necesitando RHF?

**Respuesta**: Server Actions permiten pasar una función async directamente al prop `action` de `<form>`:

```tsx
async function createTask(formData: FormData) {
  'use server'
  const title = formData.get('title')
  await db.task.create({ data: { title } })
}

function TaskForm() {
  return (
    <form action={createTask}>
      <input name="title" required />
      <button type="submit">Crear</button>
    </form>
  )
}
```

React maneja automáticamente: (1) serialización a FormData, (2) estado de pending (`useFormStatus` hook), (3) reset del formulario en éxito, (4) errores (via `useFormState`). No necesitás RHF para este caso. Necesitás RHF cuando: (1) querés validación client-side reactiva (antes de enviar al servidor), (2) necesitás field arrays dinámicos, (3) querés debounce en búsqueda, (4) el formulario es puramente client-side (sin backend).

**Por qué**: Server Actions + React 19 simplifican drásticamente los formularios que solo envían datos al servidor. Pero si necesitás UX rica (validación en tiempo real, auto-save, campos dinámicos), RHF sigue siendo necesario. La combinación ideal: Server Action para el submit final, RHF para la experiencia de llenado del formulario. Fuente: React 19 docs "Server Actions", "useFormStatus" en react.dev, y la charla "Full-Stack React Forms" por Dan Abramov.

---

### 5. [Conectar] La clase usa `useWatch` para suscribirse a cambios y persistir el draft. Conectá esto con `useSyncExternalStore`. ¿Cómo implementaría RHF internamente `useWatch` con `useSyncExternalStore` para evitar re-renders innecesarios?

**Respuesta**: RHF internamente podría implementar `useWatch` con `useSyncExternalStore` suscribiéndose solo a los campos especificados:

```ts
function useWatch({ name, control }) {
  const getSnapshot = () => control._formValues[name]
  const subscribe = (callback) => {
    const unsubscribe = control._subjects.values.subscribe(({ name: changedName }) => {
      if (changedName === name) callback()
    })
    return unsubscribe
  }
  return useSyncExternalStore(subscribe, getSnapshot)
}
```

Actualmente RHF no usa `useSyncExternalStore` directamente, sino su propio sistema de Proxy + suscripciones. Pero el patrón es el mismo: suscripción selectiva y snapshot sincrónico.

**Por qué**: `useSyncExternalStore` es el hook canónico de React para suscribirse a fuentes de datos externas (y el store interno de RHF es técnicamente externo al ciclo de render de React). RHF implementa su propio sistema porque necesita compatibilidad con React <18 (donde `useSyncExternalStore` no existía) y porque el sistema de Proxy es más granular (puede suscribirse a `formState.errors.title` como propiedad de un objeto anidado, no solo valores simples). La migración a `useSyncExternalStore` puro es posible y Bill Luo (creador de RHF) lo ha considerado para futuras versiones. Fuente: Código fuente de RHF, React docs "useSyncExternalStore", y discusiones en el repo de RHF.

---

### 6. [Conectar] La clase integra Zod con RHF via `zodResolver`. Conectá esto con el concepto de "parse, don't validate". ¿Cómo garantiza Zod que los datos que llegan al `onSubmit` sean del tipo `TaskFormData` sin necesidad de type assertion?

**Respuesta**: Zod no solo VALIDA (retorna true/false), sino que PARSEA (transforma y asegura tipos en runtime). `zodResolver` usa `schema.safeParse(data)` que retorna `{ success: true, data: TaskFormData }` o `{ success: false, error: ZodError }`. En `handleSubmit`, si `safeParse` retorna éxito, RHF pasa `data` al callback `onSubmit` — y `data` está GARANTIZADO por Zod como `TaskFormData` (no solo tipado en TypeScript, sino validado en runtime). Esto significa que dentro de `onSubmit`, podés confiar en que `data.title` es string (no undefined), `data.subtasks` es array, etc. — validado en runtime, no solo en compilación.

**Por qué**: El lema "parse, don't validate" (de Alexis King, popularizado en el ecosistema TypeScript) significa que la validación debería producir datos tipados, no solo booleanos. Zod es una librería de "parsing": `schema.parse(input)` devuelve datos tipados. El `zodResolver` de RHF aplica este principio: convierte los valores del formulario en datos tipados y validados. Si el formulario tiene `dueDate: string` pero tu tipo espera `Date`, podrías usar `z.coerce.date()` para que Zod convierta el string a Date durante el parseo. Fuente: "Parse, don't validate" en el blog de Alexis King, Zod docs "Parsing vs Validating", y la charla "Type-Safe Forms with Zod" por Colin McDonnell.

---

### 7. [Conectar] La clase implementa un wizard con `useState` para el paso actual y `FormProvider` para compartir el formulario. Conectá esto con el patrón "State Machine for Wizards". ¿Cómo usarías XState o un reducer para modelar los pasos del wizard con transiciones explícitas?

**Respuesta**: En lugar de `useState(0)` para el paso actual, modelás el wizard como una máquina de estados:

```ts
type WizardState =
  | { value: 'basic'; context: { title: string } }
  | { value: 'subtasks'; context: { title: string; subtasks: Subtask[] } }
  | { value: 'review'; context: TaskFormData }
  | { value: 'submitting'; context: TaskFormData }
  | { value: 'success' }
  | { value: 'error'; context: { message: string } }

type WizardEvent =
  | { type: 'NEXT'; data: Partial<TaskFormData> }
  | { type: 'PREV' }
  | { type: 'SUBMIT' }
  | { type: 'RETRY' }
```

Esto garantiza que: (1) solo podés avanzar si el paso actual está validado, (2) 'SUBMIT' solo es válido desde 'review', (3) no podés saltar a 'success' sin pasar por 'submitting'.

**Por qué**: Un reducer o XState hace explícitas las transiciones. Con `useState(0)`, podrías accidentalmente setear `setStep(-1)` o avanzar sin validación. Con una state machine, las transiciones inválidas son imposibles (el modelo no las permite). Para TaskFlow con 3 pasos, `useState` es suficiente. Para un wizard de 7+ pasos con pasos condicionales (si el usuario es admin, mostrar paso extra), una state machine reduce drásticamente los bugs. Fuente: "State Machines for UI" por David Khourshid, XState docs "Wizard Pattern", y "Building a Multi-Step Form with XState" en el blog de Stately.

---

### 8. [Cuestionar] ¿RHF vs Formik en 2026? Aunque RHF domina, Formik sigue siendo mantenido. ¿Hay casos donde Formik es preferible (ej: formularios controlados que necesitan `enableReinitialize`, integración con librerías legacy)? ¿O RHF ya cubre todos los casos?

**Respuesta**: Formik tiene ventajas en dos casos específicos: (1) formularios que necesitan reinicializarse cuando las props cambian (`enableReinitialize: true` — RHF usa `reset()` + `useEffect` que es más verboso), (2) integración con librerías MUI antiguas que no soportan refs (Formik usa inputs controlados, por lo que no necesita refs). RHF cubre el 95% de casos y es más performante. Para proyectos legacy que YA usan Formik y tienen cientos de formularios, migrar a RHF puede no justificar el costo. Para proyectos nuevos, RHF es la elección clara.

**Por qué**: Jared Palmer (creador de Formik) tuiteó en 2023: "If I were starting a new React form library today, I'd build it on top of uncontrolled inputs like RHF." Formik resolvió problemas de su época (2017, pre-hooks), RHF resolvió problemas de la siguiente (2019, performance con hooks). La industria se movió a RHF. La excepción son los formularios controlados que dependen de `enableReinitialize` (como dashboards con filtros que vienen de la URL y deben reflejarse en el formulario cuando la URL cambia). Fuente: npm trends Formik vs RHF, tweet de Jared Palmer, y "Why we moved from Formik to RHF" en múltiples blogs.

---

### 9. [Cuestionar] ¿Es `Controller` de RHF un mal necesario o un patrón legítimo? La clase dice que `Controller` causa más re-renders que `register`. ¿Deberíamos diseñar TODOS los componentes de UI para que funcionen con `register` (evitando `Controller`), o aceptar el costo de `Controller` en algunos casos?

**Respuesta**: `Controller` es un mal necesario para componentes que no exponen una ref al input nativo subyacente (ej: Select de MUI que renderiza múltiples divs, o DatePicker que renderiza un popover + input). Para tus propios componentes (`Input`, `Select`, `Textarea` custom), SIEMPRE deberías diseñarlos con `forwardRef` para que funcionen con `register` (más performante). `Controller` es aceptable para componentes de librerías de terceros donde no controlás la implementación. No deberías normalizar el uso de `Controller` — es una señal de que el componente no está bien diseñado para RHF.

**Por qué**: Bill Luo (creador de RHF) recomienda: "If you find yourself using Controller for your own components, reconsider your component design." La razón técnica: `Controller` convierte el input en controlado (usa `value` + `onChange` que pasan por `setValue` de RHF), perdiendo la ventaja de performance. `register` usa `ref` para leer/escribir el input sin pasar por React state. La diferencia es: `register` = 0 re-renders por keystroke (el DOM mantiene el valor). `Controller` = 1 re-render por keystroke (el estado de React se actualiza). Para formularios chicos, la diferencia es imperceptible. Para formularios grandes, es significativa. Fuente: Documentación de RHF "Register vs Controller", "Why Controller is slower" en el repo de RHF, y la charla "Building Performant Forms" por Bill Luo.

---

### 10. [Cuestionar] `mode: 'onChange'`, `'onBlur'`, `'onSubmit'` — ¿cuál es el "mejor" default? La clase usa `onSubmit` como default. Pero hay un debate sobre UX: ¿deberían los usuarios ver errores inmediatamente (`onChange`) o solo al submit (`onSubmit`)? ¿Qué recomiendan estudios de UX?

**Respuesta**: Estudios de UX (Nielsen Norman Group) recomiendan validación "early" pero no "premature": validar al salir del campo (`onBlur`) o con un pequeño delay (`onChange` con debounce). Validar en cada keystroke (`onChange`) es molesto (errores aparecen antes de que el usuario termine de escribir) y puede degradar performance. Validar solo al submit (`onSubmit`) es frustrante (el usuario llena 10 campos, hace submit, y ve 5 errores que podría haber corregido antes). La recomendación balanceada: `mode: 'onBlur'` (o `'onTouched'`) con `reValidateMode: 'onChange'` (una vez que un campo tuvo error, se re-valida en cada cambio para mostrar que se corrigió).

**Por qué**: La UX óptima es: mientras el usuario escribe → sin errores. Al salir del campo → validar y mostrar error si hay. Al volver a entrar y corregir → limpiar error inmediatamente. RHF con `mode: 'onBlur'` y `criteriaMode: 'all'` logra esto. `onSubmit` está bien para formularios muy cortos (login: 2 campos, el usuario espera validación al submit). `onChange` está bien para formularios con feedback instantáneo necesario (búsqueda, password strength meter). Fuente: "Inline Validation in Forms" por Nielsen Norman Group, RHF docs sobre `mode`, y "Designing Better Forms" por Luke Wroblewski.
