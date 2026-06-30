---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Sistema de Archivos
**Solución esperada**:

### Violaciones Identificadas
1. `ReadOnlyFile.write()` lanza `UnsupportedOperationException`
2. `ReadOnlyFile.delete()` lanza `UnsupportedOperationException`
3. `ReadOnlyFile.compress()` no comprime realmente
4. `SymlinkFile.compress()` lanza `UnsupportedOperationException`
5. `SymlinkFile.getSize()` retorna 0 (viola postcondición: el padre retorna tamaño real)

### Solución con Interfaces

```java
public interface Readable {
    byte[] read();
}

public interface Writable {
    void write(byte[] data);
}

public interface Compressible {
    byte[] compress();
}

public interface Encryptable {
    byte[] encrypt(byte[] data);
    byte[] decrypt(byte[] data);
}

public interface Deletable {
    void delete();
}

// Archivo normal: implementa todo
public class RegularFile implements Readable, Writable, Compressible, Deletable {
    private final String name;
    private byte[] content;

    public RegularFile(String name) { this.name = name; }

    @Override
    public byte[] read() {
        System.out.println("Reading: " + name);
        return content;
    }

    @Override
    public void write(byte[] data) {
        this.content = data;
        System.out.println("Writing: " + name);
    }

    @Override
    public byte[] compress() {
        System.out.println("Compressing: " + name);
        return content; // Simulación
    }

    @Override
    public void delete() { System.out.println("Deleting: " + name); }

    public long getSize() { return content != null ? content.length : 0; }
}

// Solo lectura
public class ReadOnlyFile implements Readable {
    private final String name;
    private final byte[] content;

    public ReadOnlyFile(String name, byte[] content) {
        this.name = name;
        this.content = content;
    }

    @Override
    public byte[] read() {
        System.out.println("Reading readonly: " + name);
        return content;
    }
}

// Archivo encriptado
public class EncryptedFile implements Readable, Writable {
    private final String name;
    private byte[] encryptedContent;

    public EncryptedFile(String name) { this.name = name; }

    @Override
    public byte[] read() {
        System.out.println("Reading encrypted: " + name);
        return decrypt(encryptedContent);
    }

    @Override
    public void write(byte[] data) {
        this.encryptedContent = encrypt(data);
        System.out.println("Writing encrypted: " + name);
    }

    private byte[] encrypt(byte[] data) { return data; }
    private byte[] decrypt(byte[] data) { return data; }
}

// Symlink: delega y no expone operaciones no soportadas
public class SymlinkFile implements Readable, Writable, Deletable {
    private final String name;
    private final Readable readable;
    private final Writable writable;

    public SymlinkFile(String name, Readable readable, Writable writable) {
        this.name = name;
        this.readable = readable;
        this.writable = writable;
    }

    @Override
    public byte[] read() { return readable.read(); }

    @Override
    public void write(byte[] data) { writable.write(data); }

    @Override
    public void delete() { System.out.println("Deleting symlink: " + name); }
}
```

**Posibles mejoras**:
- Implementar **patrón Proxy** para `SymlinkFile` en lugar de composición manual, delegando todas las operaciones al archivo real y agregando comportamiento específico (logging de acceso, control de permisos) sin modificar el archivo destino.
- Usar **patrón Decorator** para las capacidades del sistema de archivos: `CompressedFile(Readable)`, `EncryptedFile(Writable)`, `AuditedFile(Deletable)`, permitiendo componer comportamientos en capas sin una jerarquía rígida.
- Agregar **métricas y monitoreo** con un decorador `MonitoredFile` que registre tiempos de lectura/escritura y tasas de error, aplicable a cualquier implementación de `Readable`/`Writable` sin modificar su código.

---

## Ejercicio 4: Sistema de Empleados
**Solución esperada**:

### Violaciones Identificadas
1. `Contractor.calculatePay()` funciona pero `receiveBenefits()` lanza excepción
2. `Intern.calculatePay()` lanza `UnsupportedOperationException`
3. `Intern.saveToDatabase()` no guarda realmente
4. `Contractor.receiveBenefits()` lanza excepción
5. `PayrollService` asume que todos los empleados tienen `calculatePay()`, `saveToDatabase()` y `receiveBenefits()`

### Solución con Interfaces y Composición

```java
// Interfaces de comportamiento
public interface PayCalculator {
    double calculatePay();
}

public interface Persistable {
    void save();
}

public interface ProjectAssignable {
    void assignToProject(String project);
}

public interface LeaveRequestable {
    boolean requestLeave(int days);
}

public interface BenefitsEligible {
    void receiveBenefits();
}

// Comportamientos concretos
public class FullTimePayCalculator implements PayCalculator {
    private final double baseSalary;

    public FullTimePayCalculator(double baseSalary) {
        this.baseSalary = baseSalary;
    }

    @Override
    public double calculatePay() {
        return baseSalary * 1.10;
    }
}

public class ContractorPayCalculator implements PayCalculator {
    private final double baseSalary;

    public ContractorPayCalculator(double baseSalary) {
        this.baseSalary = baseSalary;
    }

    @Override
    public double calculatePay() {
        return baseSalary;
    }
}

public class NoPayCalculator implements PayCalculator {
    @Override
    public double calculatePay() { return 0; }
}

public class DatabasePersistence implements Persistable {
    private final String name;

    public DatabasePersistence(String name) { this.name = name; }

    @Override
    public void save() { System.out.println("Saving to database: " + name); }
}

public class ExternalSystemPersistence implements Persistable {
    private final String name;

    public ExternalSystemPersistence(String name) { this.name = name; }

    @Override
    public void save() { System.out.println("Saving to external system: " + name); }
}

public class NoPersistence implements Persistable {
    @Override
    public void save() { /* no operation */ }
}

public class FullBenefits implements BenefitsEligible {
    @Override
    public void receiveBenefits() { System.out.println("Full benefits granted"); }
}

public class NoBenefits implements BenefitsEligible {
    @Override
    public void receiveBenefits() { /* no operation */ }
}

// Clase Employee con composición
public class Employee {
    private final String name;
    private final PayCalculator payCalc;
    private final Persistable persistence;
    private final BenefitsEligible benefits;
    private final ProjectAssignable projectAssigner;
    private final LeaveRequestable leaveHandler;

    private Employee(Builder builder) {
        this.name = builder.name;
        this.payCalc = builder.payCalc;
        this.persistence = builder.persistence;
        this.benefits = builder.benefits;
        this.projectAssigner = builder.projectAssigner;
        this.leaveHandler = builder.leaveHandler;
    }

    public double calculatePay() { return payCalc.calculatePay(); }
    public void save() { persistence.save(); }
    public void receiveBenefits() { benefits.receiveBenefits(); }
    public void assignToProject(String project) { projectAssigner.assignToProject(project); }
    public boolean requestLeave(int days) { return leaveHandler.requestLeave(days); }

    // Builder pattern
    public static class Builder {
        private String name;
        private PayCalculator payCalc = new NoPayCalculator();
        private Persistable persistence = new NoPersistence();
        private BenefitsEligible benefits = new NoBenefits();
        private ProjectAssignable projectAssigner = p -> {};
        private LeaveRequestable leaveHandler = days -> false;

        public Builder name(String name) { this.name = name; return this; }
        public Builder payCalc(PayCalculator pc) { this.payCalc = pc; return this; }
        public Builder persistence(Persistable p) { this.persistence = p; return this; }
        public Builder benefits(BenefitsEligible b) { this.benefits = b; return this; }
        public Builder projectAssigner(ProjectAssignable pa) { this.projectAssigner = pa; return this; }
        public Builder leaveHandler(LeaveRequestable lh) { this.leaveHandler = lh; return this; }
        public Employee build() { return new Employee(this); }
    }
}

// PayrollService que funciona con cualquier Employee (LSP)
public class PayrollService {
    public void processPayroll(List<Employee> employees) {
        for (Employee emp : employees) {
            double pay = emp.calculatePay();
            emp.save();
            emp.receiveBenefits();
            System.out.println("Processed: $" + pay);
        }
    }
}

// Uso
Employee fullTime = new Employee.Builder()
    .name("Alice")
    .payCalc(new FullTimePayCalculator(5000000))
    .persistence(new DatabasePersistence("Alice"))
    .benefits(new FullBenefits())
    .leaveHandler(days -> days <= 30)
    .build();

Employee intern = new Employee.Builder()
    .name("Bob")
    .payCalc(new NoPayCalculator())
    .leaveHandler(days -> days <= 3)
    .build();
```

**Posibles mejoras**:
- Migrar de **Builder Pattern manual a Lombok** `@Builder` con valores por defecto para reducir boilerplate, manteniendo la misma flexibilidad de composición.
- Extraer las interfaces de comportamiento en un **patrón Strategy con registro centralizado**: un `EmployeeBehaviorRegistry` que mapea `EmployeeType` → conjunto de comportamientos, eliminando la necesidad de configurar cada empleado manualmente.
- Agregar **validación de invariantes** en el método `build()` del Builder que verifique que la combinación de comportamientos sea válida para el tipo de empleado (ej. un `FULL_TIME` sin `BenefitsEligible` debería lanzar error en construcción).

