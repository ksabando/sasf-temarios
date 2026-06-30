---
sidebar_label: "Clase"
---

# Módulo 12 — Patrones en React + TypeScript

## Introducción

React no es un framework MVC tradicional, sino una biblioteca para construir interfaces de usuario mediante **componentes**. Los patrones en React se enfocan en composición, reutilización de lógica y manejo de estado.

## Compound Components

Permite crear componentes que trabajan juntos compartiendo estado implícito mediante `React.Children` y `Context`.

```tsx
// Tabs con Compound Components
interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = React.createContext<TabsContextType | null>(null);

function Tabs({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = React.useState('');

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function Tab({ id, children }: { id: string; children: React.ReactNode }) {
  const ctx = React.useContext(TabsContext)!;
  return (
    <button
      className={ctx.activeTab === id ? 'active' : ''}
      onClick={() => ctx.setActiveTab(id)}
    >
      {children}
    </button>
  );
}

function Panel({ id, children }: { id: string; children: React.ReactNode }) {
  const ctx = React.useContext(TabsContext)!;
  return ctx.activeTab === id ? <div>{children}</div> : null;
}

Tabs.Tab = Tab;
Tabs.Panel = Panel;

// Uso
function App() {
  return (
    <Tabs>
      <Tabs.Tab id="perfil">Perfil</Tabs.Tab>
      <Tabs.Tab id="config">Configuración</Tabs.Tab>
      <Tabs.Panel id="perfil">Contenido del perfil</Tabs.Panel>
      <Tabs.Panel id="config">Opciones de configuración</Tabs.Panel>
    </Tabs>
  );
}
```

## Render Props

Comparte lógica entre componentes usando una prop que es una función que retorna JSX.

```tsx
interface MouseTrackerProps {
  render: (position: { x: number; y: number }) => React.ReactNode;
}

function MouseTracker({ render }: MouseTrackerProps) {
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handler = (e: MouseEvent) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return <>{render(position)}</>;
}

// Uso
<MouseTracker
  render={({ x, y }) => <h1>Mouse: {x}, {y}</h1>}
/>
```

## Higher-Order Components (HOC)

Función que toma un componente y retorna un nuevo componente con funcionalidad adicional.

```tsx
// HOC: withAuth
interface WithAuthProps {
  isAuthenticated: boolean;
  user: { name: string } | null;
}

function withAuth<P extends object>(
  Component: React.ComponentType<P & WithAuthProps>
) {
  return function AuthenticatedComponent(props: P) {
    const [user, setUser] = React.useState<{ name: string } | null>(null);

    React.useEffect(() => {
      // Simular verificación de autenticación
      const token = localStorage.getItem('token');
      if (token) setUser({ name: 'Usuario' });
    }, []);

    return (
      <Component
        {...props}
        isAuthenticated={user !== null}
        user={user}
      />
    );
  };
}

// Componente base
function Dashboard({ isAuthenticated, user }: WithAuthProps) {
  if (!isAuthenticated) return <div>Por favor inicia sesión</div>;
  return <div>Bienvenido, {user?.name}</div>;
}

const DashboardWithAuth = withAuth(Dashboard);

// HOC: withLogger
function withLogger<P extends object>(Component: React.ComponentType<P>) {
  return function WithLogger(props: P) {
    React.useEffect(() => {
      console.log(`[LOG] ${Component.displayName || Component.name} montado`);
      return () => console.log(`[LOG] ${Component.displayName || Component.name} desmontado`);
    }, []);
    return <Component {...props} />;
  };
}

// Composición de HOCs
const DashboardWithAuthAndLogger = withLogger(withAuth(Dashboard));
```

## Custom Hooks (Strategy funcional)

Los Custom Hooks son el patrón Strategy en su forma funcional: encapsulan lógica intercambiable.

```tsx
// useFetch (Strategy: diferentes estrategias de fetching)
interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useFetch<T>(url: string, options?: RequestInit): FetchState<T> {
  const [state, setState] = React.useState<FetchState<T>>({
    data: null, loading: true, error: null
  });

  React.useEffect(() => {
    let cancelled = false;
    setState(prev => ({ ...prev, loading: true }));

    fetch(url, options)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch(err => {
        if (!cancelled) setState({ data: null, loading: false, error: err.message });
      });

    return () => { cancelled = true; };
  }, [url]);

  return state;
}

// useLocalStorage
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    setStoredValue(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue];
}

// Uso
function UserList() {
  const { data, loading, error } = useFetch<User[]>('/api/users');
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  return (
    <div className={theme}>
      {data?.map(user => <div key={user.id}>{user.name}</div>)}
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Cambiar tema
      </button>
    </div>
  );
}
```

## Provider Pattern (Context API)

Centraliza el estado compartido usando React Context.

```tsx
// AuthProvider
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    setUser(data.user);
    localStorage.setItem('token', data.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: user !== null }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}

// Uso
function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
```

## State Reducer (Inversión de Control)

Permite que los usuarios del componente controlen las transiciones de estado internas.

```tsx
type CounterAction = { type: 'INCREMENT' } | { type: 'DECREMENT' } | { type: 'RESET' };

interface CounterState {
  count: number;
}

const defaultReducer = (state: CounterState, action: CounterAction): CounterState => {
  switch (action.type) {
    case 'INCREMENT': return { count: state.count + 1 };
    case 'DECREMENT': return { count: Math.max(0, state.count - 1) };
    case 'RESET': return { count: 0 };
    default: return state;
  }
};

interface CounterProps {
  initial?: number;
  reducer?: (state: CounterState, action: CounterAction) => CounterState;
  children: (state: CounterState, dispatch: React.Dispatch<CounterAction>) => React.ReactNode;
}

function Counter({ initial = 0, reducer = defaultReducer, children }: CounterProps) {
  const [state, dispatch] = React.useReducer(reducer, { count: initial });
  return <>{children(state, dispatch)}</>;
}

// Uso con reducer personalizado (State Reducer)
const customReducer = (state: CounterState, action: CounterAction): CounterState => {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 2 }; // incrementa de 2 en 2
    default:
      return defaultReducer(state, action);
  }
};

<Counter initial={5} reducer={customReducer}>
  {(state, dispatch) => (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
    </div>
  )}
</Counter>
```
