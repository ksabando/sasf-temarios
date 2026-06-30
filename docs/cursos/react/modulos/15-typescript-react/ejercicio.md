---
sidebar_label: "Ejercicio"
---

# Ejercicios: TypeScript con React - TaskFlow

Projecto base: `taskflow/`

## Ejercicio 1: Refactorizar tipos con utility types

En `src/types/index.ts` (o donde estén los tipos):

- Usar `Pick<Task, 'id' | 'title' | 'status'>` para `TaskCardProps`
- Usar `Omit<Task, 'id'>` para `CreateTaskInput`
- Usar `Partial<Task>` para `UpdateTaskInput`
- Usar `Record<TaskStatus, number>` para conteo de tareas por estado

## Ejercicio 2: Tipar eventos correctamente

En toda la aplicación:

- `onChange` en inputs: `React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>`
- `onSubmit` en formularios: `React.FormEvent<HTMLFormElement>`
- `onClick` en botones: `React.MouseEvent<HTMLButtonElement>`
- `onKeyDown` en input de búsqueda: `React.KeyboardEvent<HTMLInputElement>`

## Ejercicio 3: Crear componente List\<T\> genérico

Crear `src/components/ui/List.tsx`:

- Genérico `<T>` con props `items: T[]` y `renderItem: (item: T, index: number) => React.ReactNode`
- Prop opcional `emptyMessage: string`
- Usarlo en DashboardPage para renderizar TaskCard
- Usarlo en otra parte con diferente tipo (ej: usuarios)

## Ejercicio 4: Tipar ApiResponse\<T\> genérico

Crear `src/types/api.ts`:

```tsx
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
```

- Usarlo en hooks de datos (`useTasks`, `useAuth`)
- Refactorizar fetch calls para usar `ApiResponse<Task[]>` y `ApiResponse<User>`

## Ejercicio 5: Strict mode y eliminar any

Verificar `tsconfig.json`:

- Asegurar `"strict": true`
- Buscar y eliminar todos los `any` del proyecto:
  - Reemplazar con tipos específicos
  - Usar `unknown` cuando no se conozca el tipo
  - Usar genéricos donde sea necesario

## Ejercicio 6: Discriminated union para taskReducer

Si useTasks usa useReducer internamente:

- Crear tipo `TaskAction` con uniones discriminadas
- Cada action debe tener `type` literal y `payload` tipado
- El reducer debe ser type-safe sin `any`
