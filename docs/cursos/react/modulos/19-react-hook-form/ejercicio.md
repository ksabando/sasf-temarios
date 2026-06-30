---
sidebar_label: "Ejercicio"
---

# Ejercicio — React Hook Form Avanzado en TaskFlow

**Proyecto:** `taskflow/`
**Objetivo:** Implementar formularios complejos con validación Zod, useFieldArray, wizard y persistencia.

---

## 1. Formulario de registro con validación Zod

Crear `src/schemas/authSchema.ts`:

```ts
const registerSchema = z.object({
  name: z.string().min(2, 'Nombre muy corto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});
```

En `RegisterPage.tsx`:
- Usar `useForm` con `zodResolver(registerSchema)`
- Mostrar errores de validación debajo de cada campo
- Al submit exitoso, llamar `authStore.register(name, email, password)`

## 2. Wizard de tarea multi-paso

Crear `src/components/TaskWizard/` con:
- `TaskWizard.tsx` — componente contenedor con `FormProvider`
- `BasicInfoStep.tsx` — título, descripción, categoría (Controller), prioridad
- `SubtasksStep.tsx` — useFieldArray para subtareas
- `ReviewStep.tsx` — muestra todos los datos antes de guardar

Cada paso debe validar solo los campos de ese paso (`trigger`).

## 3. Controller para select de categoría

Usar `Controller` de RHF para el campo `category`. El select debe mostrar opciones: `trabajo`, `personal`, `estudio`.

## 4. Persistir draft del wizard en Zustand

En `store/uiStore.ts` ya existe `taskDraft`. Cuando el usuario escribe en el wizard:
- Usar `useWatch` para observar cambios
- Con debounce de 1s, guardar en `uiStore.saveTaskDraft(draft)`
- Al montar el wizard, recuperar el draft guardado
- Al enviar exitosamente, limpiar el draft

## 5. Verificar

- `npm run dev` sin errores
- Registro con validación: campos vacíos, email inválido, passwords diferentes
- Wizard: navegar pasos, validación por paso, agregar/remover subtareas
- Cerrar y reabrir el navegador: el draft del wizard se recupera
