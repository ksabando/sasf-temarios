---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Soluciones M12 — Patrones en React

## Ejercicio 1: Accordion (Compound Components)

**Solución esperada**:

```tsx
interface AccordionContextType {
  openItem: string | null;
  setOpenItem: (id: string | null) => void;
}

const AccordionContext = React.createContext<AccordionContextType | null>(null);

function Accordion({ children, defaultOpen }: { children: React.ReactNode; defaultOpen?: string }) {
  const [openItem, setOpenItem] = React.useState<string | null>(defaultOpen ?? null);
  return (
    <AccordionContext.Provider value={{ openItem, setOpenItem }}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({ id, children }: { id: string; children: React.ReactNode }) {
  return <div className="accordion-item">{children}</div>;
}

function AccordionHeader({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(AccordionContext)!;
  const id = React.useContext(ItemIdContext)!;
  return (
    <button className="accordion-header" onClick={() => ctx.setOpenItem(ctx.openItem === id ? null : id)}>
    </button>
  );
}

const ItemIdContext = React.createContext<string | null>(null);

function AccordionPanel({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(AccordionContext)!;
  const id = React.useContext(ItemIdContext)!;
  return (
    <div className={`accordion-panel ${ctx.openItem === id ? 'open' : ''}`}>
      {ctx.openItem === id && children}
    </div>
  );
}

Accordion.Item = function({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <ItemIdContext.Provider value={id}>
      <AccordionItem id={id}>{children}</AccordionItem>
    </ItemIdContext.Provider>
  );
};

Accordion.Header = AccordionHeader;
Accordion.Panel = AccordionPanel;
```

**Posibles mejoras**:
- **Soporte múltiple (varios items abiertos simultáneamente)**: cambiar `openItem: string | null` a `openItems: Set<string>` con `toggleItem(id)`. Agregar prop `multiple = false` al `Accordion` y condicionar la lógica: si `multiple`, toggle en el Set; si no, reemplazar el Set con un solo elemento.
- **Animaciones con altura dinámica**: `AccordionPanel` debería medir el `scrollHeight` de su contenido con `useRef` y `useLayoutEffect`, y animar `max-height` con CSS transitions en lugar de `display: none`/`block`. Esto requiere manejar `isAnimating` state para evitar race conditions entre clicks rápidos.
- **Accesibilidad ARIA**: agregar `role="button"`, `aria-expanded`, `aria-controls`, `id` únicos generados con `useId()`, y soporte de teclado (Enter/Space para toggle, Arrow keys para navegar entre headers). Esto convierte el Accordion en un componente accesible según WCAG 2.1.

## Ejercicio 2: HOCs — withTheme y withPermissions

**Solución esperada**:

```tsx
// withTheme
interface ThemeProps { theme: 'light' | 'dark'; toggleTheme: () => void; }

function withTheme<P extends object>(Component: React.ComponentType<P & ThemeProps>) {
  return function WithTheme(props: P) {
    const [theme, setTheme] = React.useState<'light' | 'dark'>(() =>
      (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
    );
    const toggleTheme = () => {
      const next = theme === 'light' ? 'dark' : 'light';
      setTheme(next);
      localStorage.setItem('theme', next);
    };
    return <Component {...props} theme={theme} toggleTheme={toggleTheme} />;
  };
}

// withPermissions
interface PermissionProps { canAccess: boolean; userRole: string; }

function withPermissions<P extends object>(Component: React.ComponentType<P & PermissionProps>) {
  return function WithPermissions(props: P) {
    const { user } = useAuth(); // del provider
    return (
      <Component
        {...props}
        canAccess={user?.role === 'admin' || user?.role === 'editor'}
        userRole={user?.role || 'guest'}
      />
    );
  };
}

// Composición
function Dashboard({ theme, toggleTheme, canAccess, userRole }: ThemeProps & PermissionProps) {
  if (!canAccess) return <div className={theme}>Acceso denegado (rol: {userRole})</div>;
  return (
    <div className={theme}>
      <h1>Dashboard</h1>
      <button onClick={toggleTheme}>Cambiar a {theme === 'light' ? 'dark' : 'light'}</button>
    </div>
  );
}

const EnhancedDashboard = withTheme(withPermissions(Dashboard));
```

**Posibles mejoras**:
- **Reescribir como hooks personalizados**: extraer la lógica de `withTheme` a `useTheme()` y `withPermissions` a `usePermissions()`. Esto elimina los HOCs y su nesting, haciendo el código más mantenible y compatible con hooks modernos.
- **Hoisting de estáticos con hoist-non-react-statics**: los HOCs pierden `displayName`, `propTypes` y `defaultProps` del componente envuelto. Usar la librería `hoist-non-react-statics` o copiar manualmente estas propiedades para debugging en React DevTools.
- **Agregar `displayName` para debugging**: `WithTheme.displayName = `WithTheme(${getDisplayName(Component)})``. Esto hace que en React DevTools se muestre `WithTheme(Dashboard)` en lugar de `Anonymous`.

## Ejercicio 3: useWebSocket Hook

**Solución esperada**:

```tsx
interface WebSocketState<T> {
  data: T | null;
  isConnected: boolean;
  error: string | null;
}

function useWebSocket<T = unknown>(url: string): WebSocketState<T> & { send: (data: unknown) => void } {
  const [state, setState] = React.useState<WebSocketState<T>>({
    data: null, isConnected: false, error: null
  });
  const wsRef = React.useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = React.useRef<number>(0);
  const attemptRef = React.useRef(0);

  const connect = React.useCallback(() => {
    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = () => {
      setState(prev => ({ ...prev, isConnected: true, error: null }));
      attemptRef.current = 0;
    };

    wsRef.current.onmessage = (event) => {
      try { setState(prev => ({ ...prev, data: JSON.parse(event.data) })); }
      catch { setState(prev => ({ ...prev, data: event.data as T })); }
    };

    wsRef.current.onerror = () => setState(prev => ({ ...prev, error: 'WebSocket error' }));

    wsRef.current.onclose = () => {
      setState(prev => ({ ...prev, isConnected: false }));
      const delay = Math.min(1000 * Math.pow(2, attemptRef.current), 30000);
      attemptRef.current++;
      reconnectTimeoutRef.current = window.setTimeout(connect, delay);
    };
  }, [url]);

  React.useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connect]);

  const send = React.useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { ...state, send };
}

// Chat en tiempo real
function ChatRoom() {
  const { data, isConnected, send } = useWebSocket<{ user: string; message: string }>('wss://chat.example.com');
  const [input, setInput] = React.useState('');

  return (
    <div>
      <div>Estado: {isConnected ? 'Conectado' : 'Desconectado'}</div>
      {data && <div><strong>{data.user}:</strong> {data.message}</div>}
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={() => { send({ message: input }); setInput(''); }}>Enviar</button>
    </div>
  );
}
```

**Posibles mejoras**:
- **Agregar cola de mensajes offline**: si la conexión no está establecida, `send()` debería encolar los mensajes en una `Queue` y enviarlos automáticamente cuando `onopen` se dispare. Esto simula el comportamiento "offline-first" de apps como WhatsApp Web.
- **Tipos genéricos para mensajes entrantes y salientes**: `useWebSocket<TIncoming, TOutgoing>` para que `data` sea de tipo `TIncoming` y `send()` acepte `TOutgoing`. Esto da type-safety completa en TypeScript evitando enviar objetos con campos incorrectos.
- **Heartbeat con ping/pong**: implementar un `setInterval` que envíe un mensaje `{"type": "ping"}` cada 30 segundos. Si no recibe `pong` en 10 segundos, asumir desconexión y reconectar. Esto evita que proxies y load balancers cierren la conexión por inactividad.

## Ejercicio 4: Shopping Cart (Provider + useReducer)

**Solución esperada**:

```tsx
interface CartItem { id: string; name: string; price: number; quantity: number; }
type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR' };

interface CartState { items: CartItem[]; total: number; }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i => i.id === action.payload.id
            ? { ...i, quantity: i.quantity + 1 } : i)
        };
      }
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(i => i.id === action.payload.id
          ? { ...i, quantity: action.payload.quantity } : i)
      };
    case 'CLEAR':
      return { items: [], total: 0 };
    default:
      return state;
  }
}

const CartContext = React.createContext<{
  state: CartState; dispatch: React.Dispatch<CartAction>;
} | null>(null);

function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(cartReducer, { items: [], total: 0 },
    () => JSON.parse(localStorage.getItem('cart') || '{"items":[],"total":0}')
  );

  React.useEffect(() => {
    const total = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    localStorage.setItem('cart', JSON.stringify({ ...state, total }));
  }, [state]);

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>;
}

function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
```

**Posibles mejoras**:
- **Middleware de logging y analytics**: interceptar el `dispatch` con un `useReducer` envuelto que llame a `analytics.track(action.type, action.payload)` y `logger.debug(action)` antes de llamar al reducer real. Esto es el State Reducer Pattern aplicado: `const enhancedDispatch = (action) => { logger(action); dispatch(action); }`.
- **Optimistic updates con rollback**: para `UPDATE_QUANTITY`, actualizar el estado local instantáneamente (optimistic) y sincronizar con el servidor en background. Si el server falla, hacer rollback al estado anterior guardado en `useRef`. Esto mejora la UX percibida (sin spinners) manteniendo consistencia eventual.
- **Dividir Context para evitar re-renders innecesarios**: separar `CartStateContext` y `CartDispatchContext` en dos providers. Componentes que solo despachan acciones (botones "Agregar al carrito") no se re-renderizan cuando el estado cambia. Solo los que leen `state` se actualizan. Este es el patrón "Split Context" para optimización.

## Ejercicio 5: Todo List (State Reducer)

**Solución esperada**:

```tsx
type TodoAction = { type: 'ADD_TODO'; text: string } | { type: 'TOGGLE_TODO'; id: number }
  | { type: 'DELETE_TODO'; id: number } | { type: 'CLEAR_COMPLETED' };

interface Todo { id: number; text: string; completed: boolean; }
interface TodoState { todos: Todo[]; }

const defaultTodoReducer = (state: TodoState, action: TodoAction): TodoState => {
  switch (action.type) {
    case 'ADD_TODO':
      return { todos: [...state.todos, { id: Date.now(), text: action.text, completed: false }] };
    case 'TOGGLE_TODO':
      return { todos: state.todos.map(t => t.id === action.id ? { ...t, completed: !t.completed } : t) };
    case 'DELETE_TODO':
      return { todos: state.todos.filter(t => t.id !== action.id) };
    case 'CLEAR_COMPLETED':
      return { todos: state.todos.filter(t => !t.completed) };
    default:
      return state;
  }
};

// Validación personalizada (State Reducer)
const validatedReducer = (state: TodoState, action: TodoAction): TodoState => {
  console.log('[ACTION]', action.type);
  if (action.type === 'ADD_TODO' && action.text.trim() === '') return state;
  if (action.type === 'ADD_TODO') {
    const activeCount = state.todos.filter(t => !t.completed).length;
    if (activeCount >= 10) {
      console.warn('Límite de 10 tareas activas alcanzado');
      return state;
    }
  }
  return defaultTodoReducer(state, action);
};

function TodoList({ reducer = defaultTodoReducer }: { reducer?: (s: TodoState, a: TodoAction) => TodoState }) {
  const [state, dispatch] = React.useReducer(reducer, { todos: [] });
  const [text, setText] = React.useState('');

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={() => { dispatch({ type: 'ADD_TODO', text }); setText(''); }}>Agregar</button>
      <button onClick={() => dispatch({ type: 'CLEAR_COMPLETED' })}>Limpiar completados</button>
      <ul>
        {state.todos.map(t => (
          <li key={t.id} style={{ textDecoration: t.completed ? 'line-through' : 'none' }}>
            <span onClick={() => dispatch({ type: 'TOGGLE_TODO', id: t.id })}>{t.text}</span>
            <button onClick={() => dispatch({ type: 'DELETE_TODO', id: t.id })}>OK</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Posibles mejoras**:
- **Composición de reducers con reduceReducers**: permitir que el usuario pase un array de reducers que se encadenan. Cada reducer puede modificar la acción y pasarla al siguiente. Esto permite "plugins" de comportamiento: `[loggingReducer, validationReducer, defaultTodoReducer]`.
- **Middleware al estilo Redux**: en lugar de solo un reducer custom, aceptar un `middleware` array que envuelva `dispatch`: `const enhancedDispatch = applyMiddleware(dispatch, logger, analytics, thunk)`. Esto permite actions asíncronas y side effects controlados.
- **Persistencia del reducer custom en URL**: serializar el estado del todo list en query params (`?filter=active&sort=date`). El reducer custom puede leer la URL inicial y aplicar filtros. Esto permite compartir vistas filtradas del todo list mediante URL sin backend.

