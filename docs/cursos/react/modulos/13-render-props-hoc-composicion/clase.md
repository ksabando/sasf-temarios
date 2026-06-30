---
sidebar_label: "Clase"
---

# Render Props, HOC y Composición

## Estado Actual

Componentes simples. Los filtros y tabs son botones independientes sin patrón de composición.

## Compound Components

Patrón donde varios componentes trabajan juntos compartiendo estado implícitamente mediante Context.

### Tabs compuesto

```tsx
const TabsContext = createContext<TabsContextType | null>(null);

function Tabs({ defaultIndex = 0, children }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>
      {children}
    </TabsContext.Provider>
  );
}

function Tab({ index, children }: TabProps) {
  const ctx = useContext(TabsContext)!;
  return (
    <button
      className={ctx.activeIndex === index ? 'tab-active' : ''}
      onClick={() => ctx.setActiveIndex(index)}
    >
      {children}
    </button>
  );
}

function TabPanel({ index, children }: TabPanelProps) {
  const ctx = useContext(TabsContext)!;
  if (ctx.activeIndex !== index) return null;
  return <div className="tab-panel">{children}</div>;
}

Tabs.Tab = Tab;
Tabs.TabPanel = TabPanel;
```

Uso:

```tsx
<Tabs>
  <Tabs.Tab index={0}>Pendientes</Tabs.Tab>
  <Tabs.Tab index={1}>Completadas</Tabs.Tab>
  <Tabs.TabPanel index={0}><TaskList tasks={pending} /></Tabs.TabPanel>
  <Tabs.TabPanel index={1}><TaskList tasks={completed} /></Tabs.TabPanel>
</Tabs>
```

### Accordion

Similar a Tabs pero con expansión individual.

## React.cloneElement

Clona un elemento y permite inyectar props adicionales.

```tsx
function RadioGroup({ children, name }: { children: React.ReactNode; name: string }) {
  return (
    <div>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { name });
        }
        return child;
      })}
    </div>
  );
}
```

## Children como función (Render Props)

El componente expone estado o métodos mediante una función children.

```tsx
function Toggle({ children }: { children: (args: { on: boolean; toggle: () => void }) => React.ReactNode }) {
  const [on, setOn] = useState(false);
  const toggle = () => setOn(prev => !prev);
  return <>{children({ on, toggle })}</>;
}
```

## Polymorphic Components (as prop)

Componente que puede renderizarse como diferentes elementos HTML.

```tsx
function Button({ as: Component = 'button', children, ...props }: ButtonProps) {
  return <Component {...props}>{children}</Component>;
}

<Button as="a" href="/tasks">Link como botón</Button>
<Button as={Link} to="/tasks">React Router Link</Button>
```

## State Reducer Pattern

Externaliza el control de estado interno permitiendo al consumidor modificar cómo se actualiza.

```tsx
function Toggle({
  children,
  stateReducer = (state, action) => action
}: ToggleProps) {
  const [on, setOn] = useState(false);
  const toggle = () => {
    const newState = stateReducer({ on }, { type: 'toggle' });
    setOn(newState.on);
  };
  return children({ on, toggle });
}
```

## Resumen

- **Compound Components**: conjunto de componentes que comparten estado implícito vía Context
- **React.cloneElement**: clona elementos y agrega props adicionales
- **Render Props**: comparten estado mediante funciones como children
- **Polymorphic Components**: renderizan como diferentes elementos via `as` prop
- **State Reducer**: externaliza el control de estado interno
