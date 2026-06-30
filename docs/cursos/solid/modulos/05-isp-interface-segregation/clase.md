---
sidebar_label: "Clase"
---

## Solución: Role Interfaces

En lugar de una interfaz gigante, creamos interfaces específicas por rol:

```java
// Interfaces pequeñas y cohesivas
public interface Workable {
    void work();
}

public interface Feedable {
    void eat();
}

public interface Restable {
    void sleep();
    void takeBreak();
}

public interface MeetingAttendable {
    void attendMeeting();
}

public interface Reportable {
    void submitReport();
}

public interface Clockable {
    void clockIn();
    void clockOut();
}

public interface Trainable {
    void train();
}

public interface Evaluable {
    void evaluate();
}
```

### Implementaciones:

```java
public class HumanEmployee implements Workable, Feedable, Restable,
    MeetingAttendable, Reportable, Clockable, Trainable, Evaluable {

    @Override public void work() { System.out.println("Working..."); }
    @Override public void eat() { System.out.println("Eating lunch"); }
    @Override public void sleep() { System.out.println("Sleeping..."); }
    @Override public void takeBreak() { System.out.println("Break time"); }
    @Override public void attendMeeting() { System.out.println("In meeting"); }
    @Override public void submitReport() { System.out.println("Submitting report"); }
    @Override public void clockIn() { System.out.println("Clock in"); }
    @Override public void clockOut() { System.out.println("Clock out"); }
    @Override public void train() { System.out.println("Training"); }
    @Override public void evaluate() { System.out.println("Evaluating"); }
}

public class RobotWorker implements Workable, Reportable, Clockable, Trainable {
    @Override public void work() { System.out.println("Robot working"); }
    @Override public void submitReport() { System.out.println("Robot report"); }
    @Override public void clockIn() { System.out.println("Robot clock in"); }
    @Override public void clockOut() { System.out.println("Robot clock out"); }
    @Override public void train() { System.out.println("Robot training"); }
}
```

### Clientes usan solo lo que necesitan:

```java
public class CafeteriaService {
    // Solo necesita Feedable, no Worker completa
    public void serveLunch(Feedable worker) {
        worker.eat();
    }
}

public class SecuritySystem {
    // Solo necesita Clockable
    public void registerEntry(Clockable worker) {
        worker.clockIn();
    }
}
```

---

## Header Interfaces vs Role Interfaces

### Header Interface (Mala práctica)
Una interfaz que agrupa todo "por si acaso":

```java
public interface EmployeeHeader {
    // 30 métodos agrupados solo porque pertenecen a "empleados"
    void work();
    void eat();
    void sleep();
    void manageTeam();
    void conductInterview();
    void processPayroll();
    void updateDatabase();
    // ...
}
```

### Role Interface (Buena práctica)
Interfaces que representan capacidades específicas:

```java
public interface TeamManager {
    void manageTeam();
}

public interface Interviewer {
    void conductInterview();
}

public interface PayrollProcessor {
    void processPayroll();
}

public interface DatabaseUpdater {
    void updateDatabase();
}
```

---

## ISP en Spring Framework

### CrudRepository vs JpaRepository

Spring Data JPA es un excelente ejemplo de ISP:

```java
// Interfaces pequeñas y específicas
public interface CrudRepository<T, ID> {
    Optional<T> findById(ID id);
    <S extends T> S save(S entity);
    void deleteById(ID id);
    // ... métodos CRUD básicos
}

public interface PagingAndSortingRepository<T, ID> extends CrudRepository<T, ID> {
    Page<T> findAll(Pageable pageable);
}

public interface JpaRepository<T, ID> extends PagingAndSortingRepository<T, ID> {
    List<T> findAll();
    void flush();
    <S extends T> S saveAndFlush(S entity);
    // ... métodos JPA específicos
}
```

Si un cliente solo necesita CRUD básico, depende de `CrudRepository`, no de `JpaRepository`.
Esto es ISP aplicado: el cliente no depende de métodos que no usa (flush, saveAndFlush).

### Interfaces Funcionales en Java

Java 8+ tiene interfaces funcionales que son el ejemplo máximo de ISP:

```java
@FunctionalInterface public interface Runnable { void run(); }
@FunctionalInterface public interface Callable<V> { V call(); }
@FunctionalInterface public interface Supplier<T> { T get(); }
@FunctionalInterface public interface Consumer<T> { void accept(T t); }
@FunctionalInterface public interface Function<T, R> { R apply(T t); }
@FunctionalInterface public interface Predicate<T> { boolean test(T t); }
```

Cada una tiene exactamente un método. Los clientes solo dependen del método que necesitan.

---

## ISP en React

### Props Mínimas por Componente

En React, ISP se aplica diseñando componentes con props mínimas:

```tsx
// MAL: Componente con props que no siempre usa
interface BadUserCardProps {
    user: User;
    onEdit?: () => void;
    onDelete?: () => void;
    onPromote?: () => void;
    onSuspend?: () => void;
    showAvatar?: boolean;
    showEmail?: boolean;
    showPhone?: boolean;
    showAddress?: boolean;
    variant?: 'compact' | 'detailed' | 'editable';
}

function BadUserCard(props: BadUserCardProps) {
    // Maneja todos los casos posibles
    // Complejidad innecesaria
}
```

```tsx
// BIEN: Componentes específicos con props mínimas
interface UserAvatarProps {
    url: string;
    size: number;
}

interface UserNameProps {
    name: string;
    isActive: boolean;
}

interface UserEmailProps {
    email: string;
    verified: boolean;
}

interface UserActionsProps {
    onEdit: () => void;
    onDelete: () => void;
}

// Uso: composición de componentes pequeños
function UserProfile({ user }: { user: User }) {
    return (
        <div>
            <UserAvatar url={user.avatarUrl} size={64} />
            <UserName name={user.name} isActive={user.active} />
            {user.showEmail && <UserEmail email={user.email} verified={user.verified} />}
            {user.isEditable && (
                <UserActions
                    onEdit={() => editUser(user.id)}
                    onDelete={() => deleteUser(user.id)}
                />
            )}
        </div>
    );
}
```

### Lógica Separada en Hooks Personalizados

```tsx
// ISP: hooks específicos en lugar de un hook gigante
function useUserData(userId: string) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/users/${userId}`)
            .then(r => r.json())
            .then(u => { setUser(u); setLoading(false); });
    }, [userId]);

    return { user, loading };
}

function useUserPermissions(userId: string) {
    const [permissions, setPermissions] = useState<string[]>([]);

    useEffect(() => {
        fetch(`/api/users/${userId}/permissions`)
            .then(r => r.json())
            .then(setPermissions);
    }, [userId]);

    return permissions;
}

// Componente usa solo los hooks que necesita
function UserDashboard({ userId }: { userId: string }) {
    const { user, loading } = useUserData(userId);
    const permissions = useUserPermissions(userId);

    if (loading) return <Spinner />;
    return (
        <div>
            <UserProfile user={user!} />
            {permissions.includes('ADMIN') && <AdminPanel />}
        </div>
    );
}
```

---

## Command Query Separation (CQS)

CQS es una aplicación de ISP a nivel de métodos: los métodos deben ser comandos (modifican
estado) o queries (retornan datos), pero no ambos.

```java
// Violación ISP + CQS
public interface UserService {
    User getAndUpdateUser(Long id, String newName); // Query + Command mezclado
    boolean saveAndNotify(User user); // Command + Query
}

// Correcto (ISP + CQS)
public interface UserReader {
    Optional<User> findById(Long id);
    List<User> findAll();
}

public interface UserWriter {
    void save(User user);
    void delete(Long id);
}
```

---

## Resumen: Guía Práctica de ISP

### Señales de Fat Interface

1. **Métodos que lanzan `UnsupportedOperationException`**
2. **Métodos con implementaciones vacías**
3. **Parámetros booleanos o flags que cambian el comportamiento**
4. **Interfaz con más de 5-7 métodos no relacionados**
5. **Clientes que solo usan una fracción de los métodos**
6. **Nombres de interfaz genéricos: `Worker`, `Manager`, `Handler`, `Util`**

### Criterios para Diseñar Interfaces

| Criterio | Pregunta Guía |
|----------|--------------|
| Cohesión | ¿Los métodos están relacionados? |
| Cliente | ¿Hay clientes que solo usan algunos métodos? |
| Tamaño | ¿La interfaz tiene más de 5-7 métodos? |
| Implementación | ¿Hay implementaciones con métodos vacíos o excepciones? |
| Estabilidad | ¿Cambios en un método afectan a clientes que no lo usan? |
