---
sidebar_label: "Soluciones"
---

# Soluciones M20 — Animaciones con Framer Motion

## `src/components/TaskCard.tsx`

**Solución esperada**:

```tsx
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/taskService';
import type { Task } from '../types';

interface TaskCardProps {
  task: Task;
}

const cardVariants = {
  hidden: { opacity: 0, x: -50, scale: 0.95 },
  visible: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 50, scale: 0.95 },
};

function getDragColor(x: number) {
  if (x > 80) return 'rgba(34, 197, 94, 0.2)';
  if (x > 40) return 'rgba(34, 197, 94, 0.1)';
  return 'transparent';
}

export function TaskCard({ task }: TaskCardProps) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: () =>
      taskService.update(task.id, { completed: !task.completed }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueryData<Task[]>(['tasks']);
      queryClient.setQueryData<Task[]>(['tasks'], (old) =>
        old?.map((t) =>
          t.id === task.id ? { ...t, completed: !t.completed } : t
        )
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['tasks'], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => taskService.delete(task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return (
    <motion.li
      className={`task-card ${task.completed ? 'completed' : ''}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
      drag="x"
      dragConstraints={{ left: 0, right: 100 }}
      dragElastic={0.3}
      onDragEnd={(_, info) => {
        if (info.offset.x > 80) {
          toggleMutation.mutate();
        }
      }}
      whileDrag={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
      style={{ background: getDragColor(0) }}
    >
      <motion.button
        className="complete-btn"
        whileTap={{ scale: 0.8 }}
        onClick={() => toggleMutation.mutate()}
        aria-label={task.completed ? 'Desmarcar' : 'Completar'}
      >
        {task.completed ? '✓' : '○'}
      </motion.button>

      <span className="task-title">{task.title}</span>

      <motion.button
        className="delete-btn"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => deleteMutation.mutate()}
        disabled={deleteMutation.isPending}
      >
        ✕
      </motion.button>
    </motion.li>
  );
}
```

**Posibles mejoras**:
- Usar `useReducedMotion()` para deshabilitar animaciones si el usuario prefiere movimiento reducido (accesibilidad).
- Implementar drag-to-delete hacia la izquierda con feedback de color rojo además del verde para toggle.
- Agregar `onAnimationStart` y `onAnimationComplete` para analytics de interacciones (tracking de gestos).

---

## `src/components/TaskList.tsx`

**Solución esperada**:

```tsx
import { AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { taskService } from '../services/taskService';
import { TaskCard } from './TaskCard';
import { Spinner } from './Spinner';
import { ErrorMessage } from './ErrorMessage';

export function TaskList() {
  const { data: tasks, isLoading, isError, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskService.getAll(),
  });

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorMessage message={(error as Error).message} />;

  return (
    <ul className="task-list">
      <AnimatePresence mode="popLayout">
        {tasks?.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </AnimatePresence>
    </ul>
  );
}
```

**Posibles mejoras**:
- Agregar `staggerChildren` en un contenedor `motion.ul` para animar la entrada de los items en cascada al cargar la lista.
- Usar `mode="sync"` para crossfade entre lista vacía y con items.
- Agregar `layout` en el `ul` para animar el reordenamiento de elementos cuando cambia el filtro.

---

## `src/components/Sidebar.tsx`

**Solución esperada**:

```tsx
import { motion } from 'framer-motion';
import { useUIStore } from '../store/uiStore';
import { NavLink } from 'react-router-dom';

const sidebarVariants = {
  open: { width: 250, opacity: 1 },
  closed: { width: 0, opacity: 0, overflow: 'hidden' as const },
};

export function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <motion.aside
      className="sidebar"
      animate={sidebarOpen ? 'open' : 'closed'}
      variants={sidebarVariants}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <nav>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/tasks">Tareas</NavLink>
        <NavLink to="/profile">Perfil</NavLink>
      </nav>
    </motion.aside>
  );
}
```

**Posibles mejoras**:
- Agregar `initial={false}` para que no se anime al cargar la página (solo al togglear).
- Implementar animación stagger para los items del menú dentro del sidebar al abrir.
- Usar `useReducedMotion()` para reemplazar la animación de ancho por opacidad simple si el usuario prefiere menos movimiento.

---

## `src/components/Layout.tsx` (para el toggle sidebar)

**Solución esperada**:

```tsx
import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useUIStore } from '../store/uiStore';

export function Layout() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <div className="layout">
      <Sidebar />
      <motion.main
        className="main-content"
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <motion.button
          className="menu-toggle"
          whileTap={{ scale: 0.9 }}
          onClick={toggleSidebar}
        >
          ☰
        </motion.button>
        <Outlet />
      </motion.main>
    </div>
  );
}
```

**Posibles mejoras**:
- Agregar `aria-expanded` y `aria-controls` en el botón de menú vinculado al sidebar para accesibilidad.
- Animar el ícono del menú (☰ → ✕) con `AnimatePresence` y un `motion.span` con `rotate` y `opacity`.
- Agregar un overlay con `motion.div` y `opacity` sobre el contenido cuando el sidebar está abierto en mobile.

---

## `src/components/AddTaskForm.tsx` (entrada animada)

**Solución esperada**:

```tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/taskService';

export function AddTaskForm() {
  const [title, setTitle] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (title: string) =>
      taskService.create({ title, completed: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setTitle('');
    },
  });

  return (
    <motion.form
      className="add-task-form"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={(e) => {
        e.preventDefault();
        if (title.trim()) mutation.mutate(title.trim());
      }}
    >
      <motion.input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nueva tarea..."
        whileFocus={{ scale: 1.02 }}
      />
      <motion.button
        type="submit"
        disabled={mutation.isPending || !title.trim()}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {mutation.isPending ? '...' : 'Agregar'}
      </motion.button>
    </motion.form>
  );
}
```

**Posibles mejoras**:
- Agregar `exit` animation con `AnimatePresence` envolviendo la renderización condicional del form.
- Implementar animación de shake con `x: [0, -10, 10, -10, 0]` y `transition: { duration: 0.3 }` si el submit falla.
- Usar `motion.textarea` con auto-resize animado en lugar de un `motion.input`.
