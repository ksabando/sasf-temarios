---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: LSP + ISP — Tabla Genérica
**Solución esperada**:

```tsx
interface Column<T> {
    key: string; header: string;
    render: (item: T) => React.ReactNode;
    sortable?: boolean;
}

function GenericTable<T>({ data, columns, onRowClick }: {
    data: T[]; columns: Column<T>[]; onRowClick?: (item: T) => void;
}) {
    return (<table><thead><tr>{columns.map(col => <th key={col.key}>{col.header}</th>)}</tr></thead>
    <tbody>{data.map((item, i) => (<tr key={i} onClick={() => onRowClick?.(item)}>
        {columns.map(col => <td key={col.key}>{col.render(item)}</td>)}
    </tr>))}</tbody></table>);
}

// Uso con LSP: cualquier Column<T> es sustituible
const userColumns: Column<User>[] = [
    { key: 'name', header: 'Name', render: u => u.name, sortable: true },
    { key: 'email', header: 'Email', render: u => u.email },
    { key: 'role', header: 'Role', render: u => <Badge label={u.role} /> },
    { key: 'actions', header: 'Actions', render: u => <button onClick={() => deleteUser(u.id)}>Delete</button> },
];

const productColumns: Column<Product>[] = [
    { key: 'name', header: 'Product', render: p => p.name },
    { key: 'price', header: 'Price', render: p => `$${p.price}` },
    { key: 'stock', header: 'Stock', render: p => <StockBadge value={p.stock} /> },
];
```

**Posibles mejoras**:
- Agregar **columnas ordenables** usando el campo `sortable` y un estado interno `sortConfig` en `GenericTable`, permitiendo ordenar por cualquier columna sin modificar la interfaz `Column<T>`.
- Implementar **columnas anidadas** (grupos de columnas) con una interfaz `ColumnGroup<T>` que contenga `Column<T>[]`, manteniendo ISP: las tablas simples usan solo `Column<T>`.
- Agregar **selección de filas** con checkboxes y un callback `onSelectionChange`, opcional y controlado por una prop `selectable`, sin forzar a los clientes que no necesitan selección.

---

## Ejercicio 4: DIP — Inyección de Dependencias
**Solución esperada**:

```tsx
// Abstracciones
interface UserApi { getUsers(): Promise<User[]>; deleteUser(id: string): Promise<void>; createUser(data: CreateUserDTO): Promise<User>; }
interface ProductApi { getProducts(): Promise<Product[]>; updateStock(id: string, stock: number): Promise<Product>; }
interface OrderApi { getOrders(): Promise<Order[]>; }

// Implementaciones concretas
class HttpUserApi implements UserApi {
    async getUsers() { const res = await fetch('/api/users'); return res.json(); }
    async deleteUser(id: string) { await fetch(`/api/users/${id}`, { method: 'DELETE' }); }
    async createUser(data: CreateUserDTO) { const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); return res.json(); }
}

// Mock para pruebas
class MockUserApi implements UserApi {
    private users = new Map<string, User>();
    async getUsers() { return Array.from(this.users.values()); }
    async deleteUser(id: string) { this.users.delete(id); }
    async createUser(data: CreateUserDTO) { const user: User = { ...data, id: String(Date.now()) }; this.users.set(user.id, user); return user; }
}

// Context para inyeccion
interface ApiContext {
    userApi: UserApi; productApi: ProductApi; orderApi: OrderApi;
}

const ApiCtx = createContext<ApiContext | null>(null);

function ApiProvider({ children, apis }: { children: React.ReactNode; apis?: Partial<ApiContext> }) {
    const defaultApis: ApiContext = {
        userApi: new HttpUserApi(),
        productApi: { getProducts: async () => { const r = await fetch('/api/products'); return r.json(); }, updateStock: async (id, stock) => { const r = await fetch(`/api/products/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stock }) }); return r.json(); } },
        orderApi: { getOrders: async () => { const r = await fetch('/api/orders'); return r.json(); } },
        ...apis,
    };
    return <ApiCtx.Provider value={defaultApis}>{children}</ApiCtx.Provider>;
}

function useApi(): ApiContext {
    const ctx = useContext(ApiCtx);
    if (!ctx) throw new Error('ApiProvider not found');
    return ctx;
}

// Componente que depende de la abstraccion
function UserList() {
    const { userApi } = useApi();
    const [users, setUsers] = useState<User[]>([]);
    useEffect(() => { userApi.getUsers().then(setUsers); }, [userApi]);
    return <UserTable users={users} onDelete={id => userApi.deleteUser(id).then(() => setUsers(prev => prev.filter(u => u.id !== id)))} />;
}

// Uso en produccion
<ApiProvider>
    <Dashboard />
</ApiProvider>

// Uso en pruebas
<ApiProvider apis={{ userApi: new MockUserApi() }}>
    <UserList />
</ApiProvider>
```

**Posibles mejoras**:
- Usar **Axios** en `HttpUserApi` en lugar de `fetch` para tener interceptores, timeouts y manejo de errores centralizado, encapsulado dentro de la implementación concreta sin afectar la interfaz `UserApi`.
- Implementar **caché en MockUserApi** para simular latencia de red con `setTimeout` y probar estados de loading en tests de integración.
- Agregar **`useApi` con genéricos** para tipado estricto (`useApi<'userApi'>('userApi')`) y evitar errores de tipeo en los nombres de API, usando un hook tipado que retorne la API correcta.

