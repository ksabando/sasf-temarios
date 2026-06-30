---
sidebar_label: "Clase"
---

## Ejemplo de Violación: EmployeeService

Observa esta clase típica que viola SRP:

```java
public class EmployeeService {

    private Connection connection;

    public EmployeeService() {
        try {
            this.connection = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/company", "root", "admin");
        } catch (SQLException e) {
            throw new RuntimeException("Error conectando a BD", e);
        }
    }

    // Responsabilidad 1: Validación
    public boolean validarEmpleado(Empleado emp) {
        if (emp.getNombre() == null || emp.getNombre().trim().isEmpty()) {
            System.out.println("Nombre inválido");
            return false;
        }
        if (emp.getEmail() == null || !emp.getEmail().contains("@")) {
            System.out.println("Email inválido");
            return false;
        }
        if (emp.getSalarioBase() <= 0) {
            System.out.println("Salario debe ser positivo");
            return false;
        }
        return true;
    }

    // Responsabilidad 2: Cálculo de nómina
    public double calcularSalarioNeto(Empleado emp) {
        double salario = emp.getSalarioBase();
        double impuesto = 0;

        if (salario <= 1000000) {
            impuesto = salario * 0.05;
        } else if (salario <= 3000000) {
            impuesto = salario * 0.10;
        } else if (salario <= 6000000) {
            impuesto = salario * 0.20;
        } else {
            impuesto = salario * 0.30;
        }

        double salud = salario * 0.04;
        double pension = salario * 0.04;
        return salario - impuesto - salud - pension;
    }

    // Responsabilidad 3: Persistencia
    public void guardarEmpleado(Empleado emp) {
        String sql = "INSERT INTO empleados (nombre, email, salario) VALUES (?, ?, ?)";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, emp.getNombre());
            ps.setString(2, emp.getEmail());
            ps.setDouble(3, emp.getSalarioBase());
            ps.executeUpdate();
            System.out.println("Empleado guardado en BD");
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    // Responsabilidad 4: Notificación
    public void notificarBienvenida(Empleado emp) {
        String asunto = "Bienvenido a la empresa";
        String cuerpo = "Estimado " + emp.getNombre()
            + ", su salario base es $" + emp.getSalarioBase();
        System.out.println("Enviando email a " + emp.getEmail());
        System.out.println("Asunto: " + asunto);
        System.out.println("Cuerpo: " + cuerpo);
    }

    // Responsabilidad 5: Generación de documentos
    public void generarContrato(Empleado emp) {
        String contrato = "CONTRATO LABORAL\n\n"
            + "Nombre: " + emp.getNombre() + "\n"
            + "Email: " + emp.getEmail() + "\n"
            + "Salario: $" + emp.getSalarioBase() + "\n"
            + "Fecha: " + new Date() + "\n";
        try (FileWriter fw = new FileWriter("contrato_" + emp.getNombre() + ".txt")) {
            fw.write(contrato);
            System.out.println("Contrato generado");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // Responsabilidad 6: Reportes
    public void generarReporteNomina() {
        String sql = "SELECT * FROM empleados";
        try (Statement st = connection.createStatement()) {
            ResultSet rs = st.executeQuery(sql);
            double totalSalarios = 0;
            System.out.println("=== REPORTE DE NÓMINA ===");
            while (rs.next()) {
                String nombre = rs.getString("nombre");
                double salario = rs.getDouble("salario");
                System.out.println(nombre + ": $" + salario);
                totalSalarios += salario;
            }
            System.out.println("TOTAL: $" + totalSalarios);
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
```

### Razones para Cambiar en EmployeeService

1. Cambio en reglas de validación (RRHH)
2. Cambio en cálculos de impuestos (Contabilidad)
3. Cambio en esquema de BD (TI)
4. Cambio en plantillas de email (Marketing)
5. Cambio en formato de contratos (Legal)
6. Cambio en reportes (Gerencia)

**6 razones para cambiar = 6 violaciones a SRP.**

---

## Refactorización Aplicando SRP

Dividimos `EmployeeService` en 5 clases con responsabilidades únicas:

```java
// Responsabilidad: Validación de empleados
public class EmployeeValidator {
    public boolean validar(Empleado emp) {
        Objects.requireNonNull(emp, "Empleado no puede ser null");
        validarNombre(emp.getNombre());
        validarEmail(emp.getEmail());
        validarSalario(emp.getSalarioBase());
        return true;
    }

    private void validarNombre(String nombre) {
        if (nombre == null || nombre.trim().isEmpty()) {
            throw new ValidationException("Nombre inválido");
        }
    }

    private void validarEmail(String email) {
        if (email == null || !email.contains("@")) {
            throw new ValidationException("Email inválido");
        }
    }

    private void validarSalario(double salario) {
        if (salario <= 0) {
            throw new ValidationException("Salario debe ser positivo");
        }
    }
}

// Responsabilidad: Cálculo de nómina
public class NominaCalculator {
    public double calcularSalarioNeto(Empleado emp) {
        double salario = emp.getSalarioBase();
        double impuesto = calcularImpuesto(salario);
        double salud = salario * 0.04;
        double pension = salario * 0.04;
        return salario - impuesto - salud - pension;
    }

    private double calcularImpuesto(double salario) {
        if (salario <= 1000000) return salario * 0.05;
        if (salario <= 3000000) return salario * 0.10;
        if (salario <= 6000000) return salario * 0.20;
        return salario * 0.30;
    }
}

// Responsabilidad: Persistencia
public class EmployeeRepository {
    private final Connection connection;

    public EmployeeRepository(Connection connection) {
        this.connection = connection;
    }

    public void guardar(Empleado emp) {
        String sql = "INSERT INTO empleados (nombre, email, salario) VALUES (?, ?, ?)";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, emp.getNombre());
            ps.setString(2, emp.getEmail());
            ps.setDouble(3, emp.getSalarioBase());
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new PersistenceException("Error guardando empleado", e);
        }
    }
}

// Responsabilidad: Notificaciones
public class NotificationService {
    public void notificarBienvenida(Empleado emp) {
        String mensaje = String.format(
            "Estimado %s, bienvenido a la empresa. Su salario base es $%.2f",
            emp.getNombre(), emp.getSalarioBase());
        enviarEmail(emp.getEmail(), "Bienvenido a la empresa", mensaje);
    }

    private void enviarEmail(String to, String asunto, String cuerpo) {
        System.out.println("Email enviado a " + to + ": " + asunto);
    }
}

// Responsabilidad: Orquestación
public class EmployeeService {
    private final EmployeeValidator validator;
    private final NominaCalculator calculator;
    private final EmployeeRepository repository;
    private final NotificationService notifier;

    public EmployeeService(EmployeeValidator validator,
                           NominaCalculator calculator,
                           EmployeeRepository repository,
                           NotificationService notifier) {
        this.validator = validator;
        this.calculator = calculator;
        this.repository = repository;
        this.notifier = notifier;
    }

    public void registrarEmpleado(Empleado emp) {
        validator.validar(emp);
        double salarioNeto = calculator.calcularSalarioNeto(emp);
        emp.setSalarioNeto(salarioNeto);
        repository.guardar(emp);
        notifier.notificarBienvenida(emp);
    }
}
```

**Beneficios:**
- Cada clase tiene 1 razón para cambiar
- Se pueden probar individualmente
- Se pueden reemplazar implementaciones sin afectar otras clases
- El código es más legible (clases pequeñas)
- Colaboración en paralelo (distintos desarrolladores en distintas clases)

---

## SRP en Spring Framework

Spring promueve SRP mediante sus anotaciones de estereotipo:

```java
// SRP: Solo maneja requests HTTP
@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService service;

    public EmployeeController(EmployeeService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<EmployeeDTO> create(@RequestBody @Valid EmployeeDTO dto) {
        EmployeeDTO created = service.create(dto);
        return ResponseEntity.status(201).body(created);
    }
}

// SRP: Solo lógica de negocio
@Service
public class EmployeeService {
    private final EmployeeRepository repository;
    private final EmployeeMapper mapper;

    public EmployeeService(EmployeeRepository repository, EmployeeMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public EmployeeDTO create(EmployeeDTO dto) {
        Employee employee = mapper.toEntity(dto);
        employee = repository.save(employee);
        return mapper.toDTO(employee);
    }
}

// SRP: Solo acceso a datos
@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
}

// SRP: Solo mapeo entre entidades y DTOs
@Component
public class EmployeeMapper {
    public Employee toEntity(EmployeeDTO dto) {
        // mapeo
    }
    public EmployeeDTO toDTO(Employee entity) {
        // mapeo
    }
}
```

### Anti-patrón: Controller haciendo lógica de negocio
```java
@RestController
public class BadController {

    @Autowired
    private JdbcTemplate jdbc;

    @PostMapping("/employees")
    public String create(@RequestParam String name, @RequestParam String email) {
        // Validación manual
        if (name == null || name.isEmpty()) return "Error: nombre requerido";

        // Lógica de negocio en el controller
        String sql = "INSERT INTO employees (name, email) VALUES (?, ?)";
        jdbc.update(sql, name, email);

        // Envío de email desde el controller
        sendEmail(email, "Bienvenido " + name);

        return "OK";
    }

    private void sendEmail(String to, String body) {
        // lógica de email
    }
}
```

**Problemas:** Violación masiva de SRP. Mezcla validación, persistencia, y notificación.

---

## SRP en React

En React, SRP se aplica a nivel de componentes y hooks:

```tsx
// MAL: Componente Dios que hace todo
function BadUserProfile({ userId }: { userId: string }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/users/${userId}`)
            .then(r => r.json())
            .then(u => { setUser(u); setLoading(false); });
    }, [userId]);

    if (loading) return <div>Cargando...</div>;
    if (!user) return <div>Usuario no encontrado</div>;

    function handleSave() {
        fetch(`/api/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(user)
        });
    }

    return (
        <div>
            <h1>{user.name}</h1>
            <p>Email: {user.email}</p>
            <input value={user.name} onChange={e =>
                setUser({ ...user, name: e.target.value })} />
            <button onClick={handleSave}>Guardar</button>
        </div>
    );
}
```

**Refactorizado con SRP:**

```tsx
// Hook: responsabilidad única de obtener datos
function useUser(userId: string) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/users/${userId}`)
            .then(r => r.json())
            .then(u => { setUser(u); setLoading(false); });
    }, [userId]);

    return { user, setUser, loading };
}

// Hook: responsabilidad única de guardar datos
function useSaveUser() {
    const [saving, setSaving] = useState(false);

    const save = async (user: User) => {
        setSaving(true);
        await fetch(`/api/users/${user.id}`, {
            method: 'PUT',
            body: JSON.stringify(user)
        });
        setSaving(false);
    };

    return { save, saving };
}

// Componente: solo presentación
function UserInfo({ user }: { user: User }) {
    return (
        <div>
            <h1>{user.name}</h1>
            <p>Email: {user.email}</p>
        </div>
    );
}

// Componente: solo edición
function UserEditor({ user, onChange }: {
    user: User;
    onChange: (u: User) => void;
}) {
    return (
        <input
            value={user.name}
            onChange={e => onChange({ ...user, name: e.target.value })}
        />
    );
}

// Componente principal: solo orquesta
function GoodUserProfile({ userId }: { userId: string }) {
    const { user, setUser, loading } = useUser(userId);
    const { save, saving } = useSaveUser();

    if (loading) return <Loader />;
    if (!user) return <NotFound />;

    return (
        <div>
            <UserInfo user={user} />
            <UserEditor user={user} onChange={setUser} />
            <Button onClick={() => save(user)} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
            </Button>
        </div>
    );
}
```

---

## Anti-patrón: La Clase "Suiza" (Todo en Uno)

```java
public class SwissArmyKnife {
    // Validación
    public boolean validarEmail(String email) { ... }
    public boolean validarRFC(String rfc) { ... }

    // Cálculos financieros
    public double calcularISR(double salario) { ... }
    public double calcularIVA(double monto) { ... }

    // Conexión a base de datos
    public Connection getConnection() { ... }
    public void ejecutarQuery(String sql) { ... }

    // Generación de documentos
    public byte[] generarPDF(String contenido) { ... }
    public byte[] generarExcel(List<String[]> datos) { ... }

    // Envío de notificaciones
    public void enviarEmail(String to, String msg) { ... }
    public void enviarSMS(String num, String msg) { ... }

    // Procesamiento de archivos
    public List<String> leerArchivo(String path) { ... }
    public void escribirArchivo(String path, String content) { ... }

    // Logging
    public void log(String msg) { ... }
    public void logError(String msg, Exception e) { ... }
}
```

**Esta clase tiene 15+ responsabilidades.** Cualquier cambio en cualquier área de la empresa
puede requerir modificar esta clase. Es inmantenible.

---

## Resumen: Guía Práctica de SRP

### ¿Cómo saber si una clase viola SRP?

1. **La prueba del "y también":** Si al describir la clase dices "hace X y también Y y también Z",
   viola SRP.
2. **La prueba de los actores:** Si más de un tipo de persona (contador, gerente, TI) podría
   pedir un cambio en esta clase, viola SRP.
3. **La prueba del tamaño:** Si la clase tiene más de 200-300 líneas, probablemente viola SRP.
4. **La prueba de los imports:** Si importa de paquetes no relacionados (java.sql, java.io,
   javax.mail), probablemente viola SRP.
5. **La prueba del nombre:** Si no puedes darle un nombre simple y descriptivo (termina siendo
   "Util", "Manager", "Helper", "Service" genérico), probablemente viola SRP.

### ¿Cuándo relajar SRP?

- En prototipos o pruebas de concepto
- En scripts pequeños y desechables
- Cuando separar introduce más complejidad que la violación misma
- Cuando el costo de la abstracción supera el beneficio (YAGNI)

### Beneficios de aplicar SRP

| Beneficio | Descripción |
|-----------|-------------|
| Testabilidad | Clases pequeñas se prueban en aislamiento |
| Mantenibilidad | Cambios localizados sin efectos colaterales |
| Legibilidad | Clases con propósito claro y tamaño manejable |
| Reusabilidad | Componentes específicos se reutilizan fácilmente |
| Paralelismo | Varios desarrolladores trabajan en distintas clases |
| Bajo acoplamiento | Clases independientes con interfaces claras |
