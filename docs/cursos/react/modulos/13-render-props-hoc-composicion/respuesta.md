---
sidebar_label: "Soluciones"
---

# Soluciones M13 — Render Props, HOC y Composición

## Tabs.tsx

**Solución esperada**:

```tsx
import { createContext, useContext, useState } from 'react';

interface TabsContextType {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs subcomponents must be used within <Tabs>');
  return ctx;
}

interface TabsProps {
  defaultIndex?: number;
  children: React.ReactNode;
}

function Tabs({ defaultIndex = 0, children }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

interface TabProps {
  index: number;
  children: React.ReactNode;
}

function Tab({ index, children }: TabProps) {
  const { activeIndex, setActiveIndex } = useTabsContext();
  return (
    <button
      className={`tab-btn ${activeIndex === index ? 'tab-active' : ''}`}
      onClick={() => setActiveIndex(index)}
    >
      {children}
    </button>
  );
}

interface TabPanelProps {
  index: number;
  children: React.ReactNode;
}

function TabPanel({ index, children }: TabPanelProps) {
  const { activeIndex } = useTabsContext();
  if (activeIndex !== index) return null;
  return <div className="tab-panel">{children}</div>;
}

Tabs.Tab = Tab;
Tabs.TabPanel = TabPanel;

export default Tabs;
```

**Posibles mejoras**:
- Agregar soporte controlado con props `index` y `onChange` en `Tabs` para integrar con estado externo (URL, redux).
- Incluir `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected` y `aria-controls` para accesibilidad completa con teclado.
- Implementar navegación por teclado (ArrowLeft/Right, Home/End) dentro de la lista de tabs usando `onKeyDown`.

---

## Accordion.tsx

**Solución esperada**:

```tsx
import { createContext, useContext, useState } from 'react';

interface AccordionContextType {
  openIndex: number | null;
  setOpenIndex: (index: number | null) => void;
}

const AccordionContext = createContext<AccordionContextType | null>(null);

function useAccordionContext() {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('Accordion.Item must be used within <Accordion>');
  return ctx;
}

interface AccordionProps {
  children: React.ReactNode;
}

function Accordion({ children }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <AccordionContext.Provider value={{ openIndex, setOpenIndex }}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
}

interface ItemProps {
  index: number;
  header: React.ReactNode;
  children: React.ReactNode;
}

function Item({ index, header, children }: ItemProps) {
  const { openIndex, setOpenIndex } = useAccordionContext();
  const isOpen = openIndex === index;

  return (
    <div className="accordion-item">
      <button
        className="accordion-header"
        onClick={() => setOpenIndex(isOpen ? null : index)}
      >
        {header}
        <span className={`accordion-arrow ${isOpen ? 'open' : ''}`}>▾</span>
      </button>
      {isOpen && <div className="accordion-panel">{children}</div>}
    </div>
  );
}

Accordion.Item = Item;

export default Accordion;
```

**Posibles mejoras**:
- Agregar modo `allowMultiple` con estado `Set<number>` para permitir múltiples paneles abiertos simultáneamente.
- Incluir animaciones de altura con `useRef` para medir contenido y transicionar `max-height` o usar `@keyframes`.
- Agregar `role="region"`, `aria-labelledby` y `aria-expanded` en el botón para accesibilidad.

---

## Modal.tsx (Compound)

**Solución esperada**:

```tsx
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );
}

interface HeaderProps {
  children: React.ReactNode;
  onClose?: () => void;
}

function Header({ children, onClose }: HeaderProps) {
  return (
    <div className="modal-header">
      <h2>{children}</h2>
      {onClose && (
        <button className="modal-close" onClick={onClose}>&times;</button>
      )}
    </div>
  );
}

interface BodyProps {
  children: React.ReactNode;
}

function Body({ children }: BodyProps) {
  return <div className="modal-body">{children}</div>;
}

interface FooterProps {
  children: React.ReactNode;
}

function Footer({ children }: FooterProps) {
  return <div className="modal-footer">{children}</div>;
}

Modal.Header = Header;
Modal.Body = Body;
Modal.Footer = Footer;

export default Modal;
```

**Posibles mejoras**:
- Compartir `onClose` entre `Modal` y `Modal.Header` usando Context para no tener que pasar la prop manualmente.
- Agregar animaciones de entrada/salida con Framer Motion `AnimatePresence` o transiciones CSS.
- Exponer `Modal.Overlay` y `Modal.Content` como subcomponentes para control granular del renderizado.

---

## DashboardPage.tsx (con Tabs)

**Solución esperada**:

```tsx
import Tabs from '../components/ui/Tabs';
import { useTasks } from '../hooks/useTasks';
import TaskCard from '../components/tasks/TaskCard';

function DashboardPage() {
  const { tasks, loading, deleteTask } = useTasks();

  if (loading) return <div className="spinner" />;

  const pending = tasks.filter(t => t.status === 'pending');
  const completed = tasks.filter(t => t.status === 'completed');

  return (
    <div className="dashboard">
      <h1>Mis Tareas</h1>
      <Tabs defaultIndex={0}>
        <div className="tabs-header">
          <Tabs.Tab index={0}>Pendientes ({pending.length})</Tabs.Tab>
          <Tabs.Tab index={1}>Completadas ({completed.length})</Tabs.Tab>
          <Tabs.Tab index={2}>Todas ({tasks.length})</Tabs.Tab>
        </div>
        <Tabs.TabPanel index={0}>
          <TaskList tasks={pending} onDelete={deleteTask} />
        </Tabs.TabPanel>
        <Tabs.TabPanel index={1}>
          <TaskList tasks={completed} onDelete={deleteTask} />
        </Tabs.TabPanel>
        <Tabs.TabPanel index={2}>
          <TaskList tasks={tasks} onDelete={deleteTask} />
        </Tabs.TabPanel>
      </Tabs>
    </div>
  );
}

function TaskList({ tasks, onDelete }: { tasks: Task[]; onDelete: (id: number) => void }) {
  if (tasks.length === 0) return <p className="empty-state">No hay tareas</p>;
  return (
    <div className="task-list">
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} onDelete={onDelete} />
      ))}
    </div>
  );
}

export default DashboardPage;
```

**Posibles mejoras**:
- Sincronizar `defaultIndex` / `activeIndex` con query string de la URL (`?tab=0`) para que el estado de tabs sea bookmarkeable y sobreviva a navegación.
- Memorizar los filtrados de `pending`, `completed` con `useMemo` para evitar recalcular en cada render.
- Agregar transición CSS entre paneles para suavizar el cambio visual.

---

## Accordion en TaskDetailPage

**Solución esperada**:

```tsx
import { useParams, useNavigate } from 'react-router-dom';
import Accordion from '../components/ui/Accordion';
import { useTasks } from '../hooks/useTasks';

function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks } = useTasks();
  const task = tasks.find(t => t.id === Number(id));

  if (!task) {
    return (
      <div className="not-found">
        <h2>Tarea no encontrada</h2>
        <button onClick={() => navigate('/dashboard')}>Volver</button>
      </div>
    );
  }

  return (
    <div className="task-detail">
      <button onClick={() => navigate(-1)} className="back-btn">← Volver</button>
      <h1>{task.title}</h1>
      <span className={`task-status status-${task.status}`}>{task.status}</span>
      <Accordion>
        <Accordion.Item index={0} header={<strong>Descripción</strong>}>
          <p>{task.description}</p>
        </Accordion.Item>
        <Accordion.Item index={1} header={<strong>Detalles</strong>}>
          <p>Creada: {new Date(task.createdAt).toLocaleDateString()}</p>
          <p>Prioridad: {task.priority || 'Normal'}</p>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

export default TaskDetailPage;
```

**Posibles mejoras**:
- Agregar un `Accordion.Item` adicional para "Historial de cambios" mostrando un timeline de modificaciones de la tarea.
- Implementar animación de altura con `max-height` transition para expandir/colapsar suavemente.
- Usar `defaultOpenIndex` prop en `Accordion` para abrir automáticamente la primera sección al cargar la página.

---

## Button.tsx (Polymorphic)

**Solución esperada**:

```tsx
type Variant = 'primary' | 'secondary' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  as?: React.ElementType;
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
  [key: string]: any;
}

function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: ButtonProps) {
  return (
    <Component className={`btn btn-${variant} btn-${size}`} {...props}>
      {children}
    </Component>
  );
}

export default Button;
```

**Posibles mejoras**:
- Tipar correctamente con genéricos para que TypeScript infiera las props válidas según el `as`: `function Button<C extends React.ElementType = 'button'>({ as, ... })`.
- Agregar soporte para `forwardRef` polimórfico (requiere type assertion compleja con `PolymorphicRef`).
- Incluir estados `loading` y `disabled` con estilos visuales específicos y `aria-busy` para accesibilidad.
