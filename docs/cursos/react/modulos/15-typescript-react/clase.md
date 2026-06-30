---
sidebar_label: "Clase"
---

# TypeScript con React

## Estado Actual

El proyecto tiene TypeScript pero puede tener `any` y tipos flojos.

## Utility Types

Operan sobre tipos existentes para crear variaciones.

### Partial\<T\>

Todas las propiedades se vuelven opcionales.

```tsx
interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'completed';
}

function updateTask(id: number, updates: Partial<Task>) {
  // Solo envía los campos que cambian
}
```

### Pick\<T, K\>

Selecciona solo las propiedades especificadas.

```tsx
type TaskPreview = Pick<Task, 'id' | 'title' | 'status'>;
```

### Omit\<T, K\>

Excluye propiedades específicas.

```tsx
type CreateTask = Omit<Task, 'id'>;
```

### Record\<K, V\>

Crea un tipo con claves K y valores V.

```tsx
type TaskMap = Record<number, Task>;
type StatusCounts = Record<'pending' | 'completed', number>;
```

## satisfies operator

Verifica que un tipo cumpla una condición sin cambiar su tipo inferido.

```tsx
const config = {
  api: 'https://api.example.com',
  timeout: 5000,
} satisfies Record<string, string | number>;

// api es string, timeout es number (tipos específicos preservados)
```

## as const

Marca un valor como readonly y sus tipos como literales.

```tsx
const STATUS = ['pending', 'completed'] as const;
type TaskStatus = (typeof STATUS)[number]; // 'pending' | 'completed'
```

## Genéricos en Componentes

Componentes que se adaptan al tipo de datos que reciben.

```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <>{items.map((item, i) => renderItem(item, i))}</>;
}

// Uso - T se infiere automáticamente
<List items={tasks} renderItem={(task) => <TaskCard task={task} />} />
```

## Discriminated Unions en Reducers

Uniones discriminadas para acciones de reducer.

```tsx
type TaskAction =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: number; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: number }
  | { type: 'SET_TASKS'; payload: Task[] };

function taskReducer(state: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case 'ADD_TASK':
      return [...state, action.payload];
    case 'DELETE_TASK':
      return state.filter(t => t.id !== action.payload);
    case 'UPDATE_TASK':
      return state.map(t =>
        t.id === action.payload.id
          ? { ...t, ...action.payload.updates }
          : t
      );
    case 'SET_TASKS':
      return action.payload;
    default:
      return state;
  }
}
```

## Tipado Estricto de Eventos

```tsx
// ChangeEvent para inputs, selects, textareas
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

// FormEvent para formularios
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
};

// MouseEvent para clics
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log(e.clientX, e.clientY);
};

// KeyboardEvent para teclas
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') search();
};
```

## ApiResponse\<T\> Genérico

```tsx
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// Uso
type TaskResponse = ApiResponse<Task[]>;
type UserResponse = ApiResponse<User>;
```

## Eliminar any

- Usar `unknown` cuando no se conoce el tipo
- Usar genéricos en lugar de `any`
- Tipar correctamente eventos y callbacks

## Resumen

- **Utility types**: Partial, Pick, Omit, Record para manipular tipos
- **satisfies**: verifica tipos sin cambiar inferencia
- **as const**: crea tipos literales readonly
- **Genéricos**: componentes y hooks reutilizables con tipos dinámicos
- **Discriminated unions**: actions tipadas para useReducer
- **Eventos**: ChangeEvent, FormEvent, MouseEvent, KeyboardEvent
- **ApiResponse\<T\>**: patrón genérico para respuestas de API
- **Eliminar any**: usar unknown, genéricos y tipos específicos
