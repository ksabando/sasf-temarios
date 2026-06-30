---
sidebar_label: "Clase"
---

## 1. Clases y Objetos

Una clase es la plantilla que define el estado (campos/propiedades) y el comportamiento (metodos) de un objeto. Cada instancia de la clase tiene su propia copia del estado.

```csharp
public class Producto
{
    // Campos (state interno)
    private string _nombre;
    private decimal _precio;
    private int _stock;

    // Constructor
    public Producto(string nombre, decimal precio, int stock)
    {
        _nombre = nombre;
        _precio = precio;
        _stock = stock;
    }

    // Propiedades (acceso controlado)
    public string Nombre => _nombre;

    public decimal Precio
    {
        get => _precio;
        set
        {
            if (value < 0)
                throw new ArgumentException("El precio no puede ser negativo");
            _precio = value;
        }
    }

    public int Stock
    {
        get => _stock;
        set
        {
            if (value < 0)
                throw new ArgumentException("El stock no puede ser negativo");
            _stock = value;
        }
    }

    // Metodos (comportamiento)
    public void ReducirStock(int cantidad)
    {
        if (cantidad > _stock)
            throw new InvalidOperationException("Stock insuficiente");
        _stock -= cantidad;
    }

    public decimal CalcularTotal(int cantidad)
    {
        return _precio * cantidad;
    }
}
```

### Propiedades auto-implementadas

Para casos sin validacion extra, C# ofrece sintaxis compacta:

```csharp
public class Categoria
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
}
```

---

## 2. Encapsulamiento y Modificadores de Acceso

| Modificador | Acceso | Uso tipico |
|-------------|--------|------------|
| `public` | Sin restriccion | API publica de la clase |
| `private` | Solo dentro de la clase | Estado interno |
| `protected` | Clase y subclases | Metodos de extension para herencia |
| `internal` | Mismo ensamblado | Componentes internos |
| `private protected` | Subclases en mismo ensamblado | Casos especificos |
| `public readonly` | Lectura publica, solo constructor | Campos inmutables expuestos |

---

## 3. Herencia

La herencia permite que una clase derive de otra, heredando sus miembros. C# soporta herencia simple (una clase solo puede heredar de una base).

```csharp
public class ProductoBase
{
    public string Nombre { get; set; }
    public decimal Precio { get; set; }

    public virtual string ObtenerDescripcion()
    {
        return $"{Nombre} - {Precio:C}";
    }
}

public class ProductoDigital : ProductoBase
{
    public string UrlDescarga { get; set; }

    public override string ObtenerDescripcion()
    {
        return $"{base.ObtenerDescripcion()} (Digital)";
    }
}
```

| Concepto | Explicacion |
|----------|-------------|
| `virtual` | Metodo que puede ser sobrescrito |
| `override` | Sobrescribe un metodo virtual |
| `base` | Referencia a la clase base |
| `sealed` | Evita que una clase sea heredada o que un metodo sea sobrescrito |
| `abstract` | Clase/metodo sin implementacion que debe implementarse en una derivada |

---

## 4. Clases Abstractas e Interfaces

### Clase abstracta

Define una base con implementacion parcial y metodos que las derivadas deben completar.

```csharp
public abstract class RepositorioBase
{
    protected string ConnectionString { get; }

    protected RepositorioBase(string connectionString)
    {
        ConnectionString = connectionString;
    }

    public abstract void Guardar(object entidad);
    public abstract object ObtenerPorId(int id);
}
```

### Interfaz

Define un contrato sin implementacion. Una clase puede implementar multiples interfaces.

```csharp
public interface IProductoRepository
{
    void Agregar(Producto producto);
    Producto BuscarPorId(int id);
    List<Producto> ListarTodos();
    void Eliminar(int id);
}
```

| Aspecto | Clase abstracta | Interfaz |
|---------|-----------------|----------|
| Implementacion | Puede tener metodos con codigo | Solo declaraciones (hasta C# 8: metodos default) |
| Estado | Puede tener campos | No (hasta C# 8) |
| Herencia multiple | No (herencia simple) | Si (multiples interfaces) |
| Uso tipico | Clases base con comportamiento compartido | Contratos intercambiables |

---

## 5. Polimorfismo

El polimorfismo permite tratar objetos de diferentes tipos a traves de una abstraccion comun.

```csharp
// Contrato comun
public interface INotificable
{
    void EnviarNotificacion(string mensaje);
}

// Implementaciones concretas
public class EmailNotificacion : INotificable
{
    public void EnviarNotificacion(string mensaje)
    {
        Console.WriteLine($"Email: {mensaje}");
    }
}

public class SmsNotificacion : INotificable
{
    public void EnviarNotificacion(string mensaje)
    {
        Console.WriteLine($"SMS: {mensaje}");
    }
}

// Uso polimorfico
var notificaciones = new List<INotificable>
{
    new EmailNotificacion(),
    new SmsNotificacion()
};

foreach (var n in notificaciones)
    n.EnviarNotificacion("Stock bajo"); // Cada uno ejecuta su version
```

---

## 6. Composicion vs Herencia

La composicion favorece "tiene un" sobre "es un". Preferir composicion cuando la relacion no es estrictamente jerarquica.

```csharp
// Herencia (uso cuando corresponde)
public class ProductoFisico : ProductoBase { }

// Composicion (preferida para reutilizacion)
public class ProductoFisico
{
    public ProductoBase Datos { get; set; }    // composicion
    public string CodigoBarras { get; set; }
}
```

---

## 7. Ejemplo Completo: Modelo de Inventario

```csharp
// Contrato
public interface IProductoRepository
{
    void Agregar(Producto producto);
    List<Producto> ListarTodos();
    Producto BuscarPorNombre(string nombre);
}

// Entidad
public class Producto
{
    public string Nombre { get; }
    public decimal Precio { get; private set; }
    public int Stock { get; private set; }

    public Producto(string nombre, decimal precio, int stock)
    {
        if (string.IsNullOrWhiteSpace(nombre))
            throw new ArgumentException("El nombre es requerido");
        if (precio <= 0)
            throw new ArgumentException("El precio debe ser mayor a cero");
        if (stock < 0)
            throw new ArgumentException("El stock no puede ser negativo");

        Nombre = nombre;
        Precio = precio;
        Stock = stock;
    }

    public void AjustarStock(int cantidad)
    {
        if (Stock + cantidad < 0)
            throw new InvalidOperationException("Stock insuficiente");
        Stock += cantidad;
    }
}

// Implementacion en memoria
public class ProductoRepositoryMemoria : IProductoRepository
{
    private readonly List<Producto> _productos = new();

    public void Agregar(Producto producto) => _productos.Add(producto);

    public List<Producto> ListarTodos() => _productos.ToList();

    public Producto BuscarPorNombre(string nombre)
        => _productos.FirstOrDefault(p =>
            p.Nombre.Contains(nombre, StringComparison.OrdinalIgnoreCase));
}
```

---

## 8. Buenos Practicas

- Preferir inyeccion de dependencias (recibir interfaces en el constructor) sobre new directo
- Encapsular validaciones dentro de la entidad, no en servicios externos
- Usar `readonly` para campos que no cambian despues de la construccion
- Preferir composicion sobre herencia a menos que la relacion sea claramente "es un"
- Mantener las clases pequenas y con una sola responsabilidad
- Usar `nameof` en vez de strings literales para nombres de propiedades

## Resumen

- Una clase define estado y comportamiento; cada objeto es una instancia con su propio estado.
- Encapsulamiento protege el estado interno mediante propiedades y modificadores de acceso.
- Herencia reutiliza comportamiento pero la composicion suele ser mas flexible.
- Interfaces definen contratos desacoplados de la implementacion.
- Polimorfismo permite variar el comportamiento segun el tipo concreto.
