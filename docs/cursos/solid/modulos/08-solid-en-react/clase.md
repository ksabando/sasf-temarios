---
sidebar_label: "Clase"
---

## OCP en React

### Compound Components Pattern

```tsx
// Componente base: cerrado a modificación
interface SelectProps {
    children: React.ReactNode;
    value?: string;
    onChange?: (value: string) => void;
}

function Select({ children, value, onChange }: SelectProps) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(value);

    const handleSelect = (val: string) => {
        setSelected(val);
        setOpen(false);
        onChange?.(val);
    };

    return (
        <div className="select">
            <button onClick={() => setOpen(!open)}>
                {selected || 'Seleccionar...'}
            </button>
            {open && (
                <div className="select-options">
                    {React.Children.map(children, child => {
                        if (React.isValidElement<OptionProps>(child)) {
                            return React.cloneElement(child, {
                                onSelect: handleSelect,
                            });
                        }
                        return child;
                    })}
                </div>
            )}
        </div>
    );
}

// Opción: componente que se compone con Select
interface OptionProps {
    value: string;
    children: React.ReactNode;
    onSelect?: (value: string) => void;
}

function Option({ value, children, onSelect }: OptionProps) {
    return (
        <div className="select-option" onClick={() => onSelect?.(value)}>
            {children}
        </div>
    );
}

// Asignar Option como subcomponente de Select
Select.Option = Option;

// Uso: compuesto sin modificar Select
<Select value={country} onChange={setCountry}>
    <Select.Option value="CO">Colombia</Select.Option>
    <Select.Option value="MX">Mexico</Select.Option>
    <Select.Option value="AR">Argentina</Select.Option>
</Select>
```

### Render Props Pattern

```tsx
interface DataFetcherProps<T> {
    url: string;
    children: (data: { data: T | null; loading: boolean; error: Error | null }) => React.ReactNode;
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetch(url)
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(e => { setError(e); setLoading(false); });
    }, [url]);

    return <>{children({ data, loading, error })}</>;
}

// Uso: el componente se extiende mediante lo que se renderiza
<DataFetcher<User[]> url="/api/users">
    {({ data, loading, error }) => {
        if (loading) return <Spinner />;
        if (error) return <Error message={error.message} />;
        return <UserList users={data!} />;
    }}
</DataFetcher>
```

---

## LSP en React

### Interfaces de Props Bien Definidas

```tsx
// Interfase base para botones
interface ButtonProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;
}

// Botón primario (subtipo de ButtonProps)
function PrimaryButton({ label, onClick, disabled }: ButtonProps) {
    return (
        <button className="btn btn-primary" onClick={onClick} disabled={disabled}>
            {label}
        </button>
    );
}

// Botón secundario (también subtipo de ButtonProps)
function SecondaryButton({ label, onClick, disabled }: ButtonProps) {
    return (
        <button className="btn btn-secondary" onClick={onClick} disabled={disabled}>
            {label}
        </button>
    );
}

// Botón de icono (extiende ButtonProps pero no viola LSP)
interface IconButtonProps extends ButtonProps {
    icon: string;
}

function IconButton({ label, icon, onClick, disabled }: IconButtonProps) {
    return (
        <button className="btn btn-icon" onClick={onClick} disabled={disabled}>
            <span className="icon">{icon}</span>
            {label}
        </button>
    );
}

// Cliente que funciona con cualquier ButtonProps
function Toolbar({ buttons }: { buttons: ButtonProps[] }) {
    return (
        <div>
            {buttons.map((btn, i) => (
                <PrimaryButton key={i} {...btn} />
            ))}
        </div>
    );
}

// Uso: todos los botones son sustituibles
const buttons: ButtonProps[] = [
    { label: 'Save', onClick: () => save() },
    { label: 'Delete', onClick: () => del() },
    { label: 'Edit', onClick: () => edit(), disabled: true },
];
```

---

## ISP en React

### Props Mínimas por Componente

```tsx
// MAL: componente con muchas props opcionales
interface BadCardProps {
    title: string;
    description?: string;
    imageUrl?: string;
    onEdit?: () => void;
    onDelete?: () => void;
    onShare?: () => void;
    onFavorite?: () => void;
    isFavorite?: boolean;
    showActions?: boolean;
    variant?: 'compact' | 'detailed' | 'editable';
}

// BIEN: componentes atómicos con props específicas
interface CardTitleProps { title: string; }
interface CardDescriptionProps { description: string; }
interface CardImageProps { src: string; alt: string; }
interface CardActionsProps {
    onEdit: () => void;
    onDelete: () => void;
}

// Componentes atómicos
function CardTitle({ title }: CardTitleProps) {
    return <h2 className="card-title">{title}</h2>;
}

function CardDescription({ description }: CardDescriptionProps) {
    return <p className="card-description">{description}</p>;
}

function CardActions({ onEdit, onDelete }: CardActionsProps) {
    return (
        <div className="card-actions">
            <button onClick={onEdit}>Edit</button>
            <button onClick={onDelete}>Delete</button>
        </div>
    );
}

// Composición (no herencia)
function Card({ children }: { children: React.ReactNode }) {
    return <div className="card">{children}</div>;
}

// Uso: cada componente solo recibe lo que necesita
<Card>
    <CardTitle title="Mi Tarjeta" />
    <CardDescription description="Esto es una descripcion" />
    <CardActions onEdit={() => {}} onDelete={() => {}} />
</Card>
```

---

## DIP en React

### Hooks como Abstracción de Servicios

```tsx
// Abstracción: interfaz del servicio
interface UserService {
    getUsers(): Promise<User[]>;
    getUser(id: string): Promise<User | null>;
    createUser(data: CreateUserDTO): Promise<User>;
    updateUser(id: string, data: Partial<User>): Promise<User>;
    deleteUser(id: string): Promise<void>;
}

// Implementación con fetch
function useApiUserService(baseUrl: string = '/api/users'): UserService {
    return {
        getUsers: async () => {
            const res = await fetch(baseUrl);
            if (!res.ok) throw new Error('Failed to fetch users');
            return res.json();
        },
        getUser: async (id: string) => {
            const res = await fetch(`${baseUrl}/${id}`);
            if (res.status === 404) return null;
            if (!res.ok) throw new Error('Failed to fetch user');
            return res.json();
        },
        createUser: async (data: CreateUserDTO) => {
            const res = await fetch(baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return res.json();
        },
        updateUser: async (id: string, data: Partial<User>) => {
            const res = await fetch(`${baseUrl}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return res.json();
        },
        deleteUser: async (id: string) => {
            await fetch(`${baseUrl}/${id}`, { method: 'DELETE' });
        },
    };
}

// Implementación mock para testing
function useMockUserService(): UserService {
    const users = new Map<string, User>();

    return {
        getUsers: async () => Array.from(users.values()),
        getUser: async (id: string) => users.get(id) || null,
        createUser: async (data: CreateUserDTO) => {
            const user: User = { ...data, id: String(users.size + 1) };
            users.set(user.id, user);
            return user;
        },
        updateUser: async (id: string, data: Partial<User>) => {
            const existing = users.get(id);
            if (!existing) throw new Error('User not found');
            const updated = { ...existing, ...data };
            users.set(id, updated);
            return updated;
        },
        deleteUser: async (id: string) => {
            users.delete(id);
        },
    };
}

// Context para inyección de dependencias
const UserServiceContext = createContext<UserService>(useApiUserService());

function UserServiceProvider({ children, service }: {
    children: React.ReactNode;
    service?: UserService;
}) {
    const defaultService = useApiUserService();
    return (
        <UserServiceContext.Provider value={service || defaultService}>
            {children}
        </UserServiceContext.Provider>
    );
}

// Hook para consumir el servicio (DIP: depende de abstracción)
function useUserService(): UserService {
    return useContext(UserServiceContext);
}

// Componente que usa el servicio (no sabe si es API real o mock)
function UserList() {
    const userService = useUserService();
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        userService.getUsers().then(setUsers);
    }, [userService]);

    return (
        <ul>
            {users.map(u => <li key={u.id}>{u.name}</li>)}
        </ul>
    );
}

// En pruebas:
// <UserServiceProvider service={useMockUserService()}>
//     <UserList />
// </UserServiceProvider>
```

---

## Resumen: Mapeo SOLID ↔ React

| Principio | Patrón React | Ejemplo |
|-----------|-------------|---------|
| **SRP** | Componentes atómicos, custom hooks | Un hook por responsabilidad, componente solo renderiza |
| **OCP** | Compound Components, Render Props, HOCs | Select compuesto con Option, DataFetcher con render prop |
| **LSP** | Interfaces de props bien definidas | Botones que comparten ButtonProps, intercambiables |
| **ISP** | Props mínimas, composición atómica | CardTitle solo recibe title, no 10 props opcionales |
| **DIP** | Hooks de servicio, Context API, DI funcional | useContext(UserServiceContext) con implementación intercambiable |
