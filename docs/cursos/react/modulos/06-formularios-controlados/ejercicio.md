---
sidebar_label: "Ejercicio"
---

# Ejercicio 06: Formularios Controlados

## Objetivo
Reemplazar el formulario inline del proyecto `taskflow/` por un formulario controlado con React Hook Form + Zod.

## Pasos

1. **Instalar dependencias**
   ```bash
   cd taskflow
   npm install react-hook-form @hookform/resolvers zod
   ```

2. **Crear esquema Zod** en `src/utils/validations.ts`
   - Definir `taskSchema` con `title` (min 3, max 100) y `description` (max 500, opcional)
   - Exportar tipo `TaskFormData`

3. **Actualizar `Input.tsx`**
   - Envolver con `forwardRef` para que funcione con RHF
   - Recibir prop `error` para mostrar mensaje de error

4. **Reemplazar formulario en `App.tsx`** (o crear `TaskForm.tsx`)
   - Usar `useForm<TaskFormData>` con `zodResolver`
   - Vincular inputs con `{...register('title')}`
   - Manejar submit con `handleSubmit`
   - Mostrar `errors.title?.message` bajo cada campo

5. **Modal o formulario visible**
   - Si usas modal, mostrar/ocultar con estado `isEditing`
   - Si es inline, reemplazar la fila de la tabla por inputs

## Validación esperada
- Título vacío → "Mínimo 3 caracteres"
- Título menor a 3 caracteres → "Mínimo 3 caracteres"
- Título mayor a 100 caracteres → "Máximo 100"
- Descripción mayor a 500 caracteres → error de Zod
