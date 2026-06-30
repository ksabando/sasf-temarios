---
sidebar_label: "Soluciones"
---

# Soluciones M19 — React Hook Form Avanzado

## `src/schemas/authSchema.ts`

**Solución esperada**:

```ts
import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Nombre muy corto'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterForm = z.infer<typeof registerSchema>;
```

**Posibles mejoras**:
- Agregar validación de fuerza de contraseña con `.regex()` para requerir mayúsculas, números y caracteres especiales.
- Separar en schemas individuales `loginSchema` y `registerSchema` con requisitos diferentes.
- Incluir `.transform()` para sanitizar datos (trim, lowercase de email) automáticamente al validar.

---

## `src/components/TaskWizard/schema.ts`

**Solución esperada**:

```ts
import { z } from 'zod';

export const taskWizardSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres'),
  description: z.string().optional(),
  category: z.enum(['trabajo', 'personal', 'estudio'], {
    errorMap: () => ({ message: 'Selecciona una categoría' }),
  }),
  priority: z.enum(['baja', 'media', 'alta']),
  subtasks: z
    .array(z.object({ title: z.string().min(1, 'La subtarea necesita título') }))
    .max(10, 'Máximo 10 subtareas'),
});

export type TaskWizardForm = z.infer<typeof taskWizardSchema>;
```

**Posibles mejoras**:
- Agregar `z.date()` para un campo `dueDate` con validación de fecha futura.
- Usar `.default()` para `priority: z.enum(['baja', 'media', 'alta']).default('media')` y `subtasks: z.array(...).default([{ title: '' }])`.
- Definir `.superRefine()` para validaciones complejas como "no más de 3 tareas de prioridad alta por día".

---

## `src/pages/RegisterPage.tsx`

**Solución esperada**:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterForm } from '../schemas/authSchema';
import { useAuthStore } from '../store/authStore';

export function RegisterPage() {
  const { register: authRegister, loading, error } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    await authRegister(data.name, data.email, data.password);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Nombre</label>
        <input {...register('name')} />
        {errors.name && <span>{errors.name.message}</span>}
      </div>

      <div>
        <label>Email</label>
        <input type="email" {...register('email')} />
        {errors.email && <span>{errors.email.message}</span>}
      </div>

      <div>
        <label>Contraseña</label>
        <input type="password" {...register('password')} />
        {errors.password && <span>{errors.password.message}</span>}
      </div>

      <div>
        <label>Confirmar contraseña</label>
        <input type="password" {...register('confirmPassword')} />
        {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}
      </div>

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Registrando...' : 'Registrarse'}
      </button>
    </form>
  );
}
```

**Posibles mejoras**:
- Agregar `autoComplete` attributes: `autoComplete="name"`, `autoComplete="email"`, `autoComplete="new-password"`.
- Incluir un medidor de fortaleza de contraseña reactivo usando `watch('password')`.
- Usar `mode: 'onBlur'` en `useForm` para mostrar errores al salir del campo, mejor UX que solo al submit.

---

## `src/components/TaskWizard/TaskWizard.tsx`

**Solución esperada**:

```tsx
import { useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskWizardSchema, type TaskWizardForm } from './schema';
import { useUIStore } from '../../store/uiStore';
import { BasicInfoStep } from './BasicInfoStep';
import { SubtasksStep } from './SubtasksStep';
import { ReviewStep } from './ReviewStep';
import { useTaskStore } from '../../store/taskStore';

const steps = [
  { component: BasicInfoStep, fields: ['title', 'description', 'category', 'priority'] },
  { component: SubtasksStep, fields: ['subtasks'] },
  { component: ReviewStep, fields: [] },
];

export function TaskWizard() {
  const [step, setStep] = useState(0);
  const saveTaskDraft = useUIStore((s) => s.saveTaskDraft);
  const addTask = useTaskStore((s) => s.addTask);

  const methods = useForm<TaskWizardForm>({
    resolver: zodResolver(taskWizardSchema),
    defaultValues: useUIStore.getState().taskDraft || {
      title: '',
      description: '',
      category: undefined,
      priority: 'media',
      subtasks: [{ title: '' }],
    },
  });

  useWatch({ control: methods.control }).then((values) => {
    saveTaskDraft(values);
  });

  const StepComponent = steps[step].component;

  const next = async () => {
    const fields = steps[step].fields;
    const valid = await methods.trigger(fields as any);
    if (valid) setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const prev = () => setStep((s) => Math.max(0, s - 1));

  const onSubmit = async (data: TaskWizardForm) => {
    await addTask(data.title);
    useUIStore.getState().clearTaskDraft();
    setStep(0);
    methods.reset();
  };

  return (
    <FormProvider {...methods}>
      <div className="wizard">
        <StepComponent />
        <div className="wizard-nav">
          {step > 0 && <button onClick={prev}>Atrás</button>}
          {step < steps.length - 1 ? (
            <button onClick={next}>Siguiente</button>
          ) : (
            <button onClick={methods.handleSubmit(onSubmit)}>Guardar tarea</button>
          )}
        </div>
      </div>
    </FormProvider>
  );
}
```

**Posibles mejoras**:
- Agregar una barra de progreso visual (`step / steps.length`) y un stepper con números/títulos de pasos.
- Aplicar debounce a `saveTaskDraft` para no guardar en cada pulsación de tecla (usar `useDebounce`).
- Usar `getValues` en lugar de `useWatch` para el draft si no se necesita reactividad en el store de UI.

---

## `src/components/TaskWizard/BasicInfoStep.tsx`

**Solución esperada**:

```tsx
import { useFormContext, Controller } from 'react-hook-form';
import type { TaskWizardForm } from './schema';

export function BasicInfoStep() {
  const { register, control, formState: { errors } } = useFormContext<TaskWizardForm>();

  return (
    <div>
      <h3>Información básica</h3>

      <div>
        <label>Título</label>
        <input {...register('title')} />
        {errors.title && <span>{errors.title.message}</span>}
      </div>

      <div>
        <label>Descripción</label>
        <textarea {...register('description')} />
      </div>

      <div>
        <label>Categoría</label>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <select {...field}>
              <option value="">Seleccionar...</option>
              <option value="trabajo">Trabajo</option>
              <option value="personal">Personal</option>
              <option value="estudio">Estudio</option>
            </select>
          )}
        />
        {errors.category && <span>{errors.category.message}</span>}
      </div>

      <div>
        <label>Prioridad</label>
        <select {...register('priority')}>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </select>
      </div>
    </div>
  );
}
```

**Posibles mejoras**:
- Extraer el `<select>` de prioridad a un `Controller` si se usa un componente de UI library para consistencia.
- Agregar `aria-describedby` vinculando el mensaje de error con el input para accesibilidad.
- Usar `useWatch({ name: 'title' })` para mostrar un contador de caracteres en tiempo real cerca del input.

---

## `src/components/TaskWizard/SubtasksStep.tsx`

**Solución esperada**:

```tsx
import { useFieldArray, useFormContext } from 'react-hook-form';
import type { TaskWizardForm } from './schema';

export function SubtasksStep() {
  const { register, control, formState: { errors } } = useFormContext<TaskWizardForm>();
  const { fields, append, remove } = useFieldArray({ control, name: 'subtasks' });

  return (
    <div>
      <h3>Subtareas</h3>

      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...register(`subtasks.${index}.title`)} placeholder="Subtarea" />
          <button type="button" onClick={() => remove(index)}>Eliminar</button>
          {errors.subtasks?.[index]?.title && (
            <span>{errors.subtasks[index]?.title?.message}</span>
          )}
        </div>
      ))}

      {errors.subtasks?.root && <span>{errors.subtasks.root.message}</span>}

      <button type="button" onClick={() => append({ title: '' })}>
        + Agregar subtarea
      </button>
    </div>
  );
}
```

**Posibles mejoras**:
- Agregar drag-and-drop para reordenar subtareas usando `move(from, to)` de `useFieldArray`.
- Implementar animaciones de entrada/salida con Framer Motion `AnimatePresence` al agregar/remover subtareas.
- Limitar visualmente el botón de agregar cuando se alcanza el máximo (10).

---

## `src/components/TaskWizard/ReviewStep.tsx`

**Solución esperada**:

```tsx
import { useFormContext } from 'react-hook-form';
import type { TaskWizardForm } from './schema';

export function ReviewStep() {
  const { getValues } = useFormContext<TaskWizardForm>();
  const data = getValues();

  return (
    <div>
      <h3>Revisión</h3>
      <p><strong>Título:</strong> {data.title}</p>
      <p><strong>Descripción:</strong> {data.description || '(sin descripción)'}</p>
      <p><strong>Categoría:</strong> {data.category}</p>
      <p><strong>Prioridad:</strong> {data.priority}</p>
      <p><strong>Subtareas:</strong></p>
      <ul>
        {data.subtasks?.map((s, i) => (
          <li key={i}>{s.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

**Posibles mejoras**:
- Agregar un botón "Editar" junto a cada sección que navegue al paso correspondiente (`setStep` pasado como prop).
- Sincronizar `getValues` con `useWatch` si los datos cambian durante el review (no debería, pero es defensivo).
- Validar nuevamente con `methods.trigger()` en el paso de review antes de habilitar el botón de submit.

---

## `src/store/uiStore.ts` — actualizado con draft

**Solución esperada**:

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TaskWizardForm } from '../components/TaskWizard/schema';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  taskDraft: Partial<TaskWizardForm> | null;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  saveTaskDraft: (draft: Partial<TaskWizardForm>) => void;
  clearTaskDraft: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'light',
      taskDraft: null,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
      saveTaskDraft: (draft) => set({ taskDraft: draft }),
      clearTaskDraft: () => set({ taskDraft: null }),
    }),
    {
      name: 'taskflow-ui',
      partialize: (state) => ({
        theme: state.theme,
        taskDraft: state.taskDraft,
      }),
    }
  )
);
```

**Posibles mejoras**:
- Agregar `version` y `migrate` en `persist` para manejar cambios en la estructura del draft entre versiones de la app.
- Implementar un debounce en `saveTaskDraft` para evitar escrituras excesivas a localStorage.
- Agregar una acción `resetAll` que limpie draft, sidebar y tema en logout para evitar data leaks entre sesiones.
