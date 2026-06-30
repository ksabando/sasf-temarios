---
sidebar_label: "Clase"
---

# Módulo 02 — Nombres Significativos

## Los Nombres Revelan Intención

El nombre de una variable, función o clase debe responder **por qué existe**, **qué hace** y **cómo se usa**.

```java
// MAL: no revela nada
int d;
// BIEN: revela intención
int elapsedTimeInDays;
int daysSinceLastUpdate;
int daysToExpiration;

// MAL: ¿qué cuenta?
int c;
// BIEN: revela qué cuenta
int totalTransactionCount;

// MAL: magia
if (flag == 1)
// BIEN: nombre con significado
if (userIsActive)
```

## Evitar Desinformación

No uses nombres que den información equivocada.

```java
// MAL: sugiere que es java.util.List pero no lo es
List<String> accountList = getAccountsAsSet();

// BIEN: el nombre refleja el tipo real
Set<String> accounts = getAccountsAsSet();
// O simplemente:
Collection<String> accounts = getAccounts();

// MAL: se parece a otro nombre
User userVsAccount = new User();

// MAL: 0 y O, 1 y l se confunden
int l = 1;  // parece 11
int O = 0;  // parece 00
```

## Distinciones Significativas

No uses nombres que son apenas diferentes.

```java
// MAL: ¿cuál es la diferencia?
Product product;
ProductInfo productInfo;
ProductData productData;

// BIEN: cada uno expresa su propósito
Product product;
ProductSummary productSummary;
ProductDetails productDetails;

// MAL: ruido verbal
getActiveAccount();
getActiveAccountInfo();
getActiveAccountData();
```

## Nombres Pronunciables

Si no puedes pronunciarlo en una conversación, cámbialo.

```java
// MAL
private Date genymdhms;  // generation year month day hour minute second

// BIEN
private Date generationTimestamp;

// MAL
private String vnm;  // variable nombre

// BIEN
private String variableName;
```

## Nombres Buscables

Los nombres de una letra solo sirven como variables locales temporales en métodos muy cortos.

```java
// MAL: no se puede buscar
int e = 2;

// BIEN: se puede buscar en todo el proyecto
static final double EULER_NUMBER = 2.71828;

// MAL: buscar "s" encuentra todo
double s = 0;

// BIEN
double totalAmount = 0;
```

## Una Palabra por Concepto

Usa una palabra consistente para cada concepto abstracto.

| Concepto | Palabra Única | Palabras Confusas |
|----------|---------------|-------------------|
| Obtener dato | `get` | `fetch`, `retrieve`, `obtain`, `acquire` |
| Crear instancia | `create` | `build`, `construct`, `make`, `new` |
| Agregar elemento | `add` | `append`, `insert`, `push`, `put` |
| Eliminar elemento | `remove` | `delete`, `erase`, `clear`, `pop` |
| Actualizar | `update` | `modify`, `change`, `set`, `edit` |

```java
// MAL: tres palabras para lo mismo
User getUser(int id);
Employee fetchEmployee(int id);
Account retrieveAccount(int id);

// BIEN: consistente
User getUser(int id);
Employee getEmployee(int id);
Account getAccount(int id);
```

## Nombres de Clases y Métodos

```java
// CLASES → sustantivos
class Customer {}
class AccountParser {}
class PaymentProcessor {}

// NO → verbos, gerundios, nombres genéricos
class Manager {}      // ¿qué manager?
class Data {}         // ¿qué datos?
class ProcessInfo {}  // ¿qué información?

// MÉTODOS → verbos
void save();          // bien
void delete();        // bien
boolean isEmpty();    // bien (accesor)
Customer findById();  // bien

// NO → sustantivos confusos
void customer();      // parece propiedad
void data();          // ¿qué hace?
```

## Evitar Codificaciones

### Prefijos Húngaros

```java
// MAL
String strName;
int iCount;
boolean bFlag;
List<String> listNames;

// BIEN
String name;
int count;
boolean active;
List<String> names;
```

### Prefijos de Miembro

```java
// MAL
public class Customer {
    private String m_name;      // prefijo húngaro
    private String _name;       // underscore innecesario
    private String name_;       // sufijo
}

// BIEN
public class Customer {
    private String name;
}
```

### Interfaces

```java
// MAL: "I" prefijo innecesario
interface IShape {}
class ShapeImpl implements IShape {}

// BIEN: sin prefijo
interface Shape {}
class ShapeFactory implements Shape {}
// O con "Impl" si es necesario distinguir
```

## Refactorización en Proyecto de Nóminas

```java
// ANTES
public class emp {
    private String n;       // nombre
    private double s;       // salary
    private String d;       // department
    private int he;         // horas extra
    private double th;      // tarifa hora

    public void proc() { /* ... */ }
    public double calc() { return s * 30; }
}

// DESPUÉS
public class Employee {
    private String name;
    private double baseSalary;
    private String department;
    private int overtimeHours;
    private double hourlyRate;

    public void processPayment() { /* ... */ }
    public double calculateMonthlySalary() { return baseSalary * 30; }
}
```

## Regla de Oro

> Un nombre debe revelar la intención sin necesidad de leer el código que lo implementa.
