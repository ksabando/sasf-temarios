---
sidebar_label: "Clase"
---

## 1. Generics

Los generics permiten escribir codigo que funciona con cualquier tipo manteniendo seguridad de tipos en compilacion. Sin generics, usariamos `object` y perderiamos verificacion de tipos.

```csharp
// Sin generics: casteo manual, propenso a errores
public class Caja
{
    private object _contenido;
    public void Guardar(object contenido) => _contenido = contenido;
    public object Obtener() => _contenido;
}

// Con generics: tipado seguro
public class Caja<T>
{
    private T _contenido;
    public void Guardar(T contenido) => _contenido = contenido;
    public T Obtener() => _contenido;
}

// Uso
var cajaEntero = new Caja<int>();
cajaEntero.Guardar(42);
int valor = cajaEntero.Obtener();  // sin casteo
```

### Metodos genericos

```csharp
public T Primero<T>(List<T> lista) => lista[0];

public TResult Transformar<TEntrada, TResult>(TEntrada entrada, Func<TEntrada, TResult> transformacion)
    => transformacion(entrada);
```

### Restricciones (constraints)

```csharp
public class Repositorio<T> where T : class, new()
{
    public T Crear()
    {
        return new T();  // requiere new() constraint
    }
}

public interface IComparable<T>
{
    int CompareTo(T other);
}

public T Maximo<T>(T a, T b) where T : IComparable<T>
{
    return a.CompareTo(b) > 0 ? a : b;
}
```

| Constraint | Descripcion |
|------------|-------------|
| `where T : class` | Tipo por referencia |
| `where T : struct` | Tipo por valor |
| `where T : new()` | Debe tener constructor sin parametros |
| `where T : IComparable<T>` | Implementa la interfaz |
| `where T : U` | Es o hereda de otro tipo generico |

---

## 2. Delegates

Un delegate es un tipo que referencia un metodo. Permite pasar metodos como parametros.

```csharp
// Declaracion
public delegate void Notificacion(string mensaje);

// Metodos compatibles
public void EnviarEmail(string msg) => Console.WriteLine($"Email: {msg}");
public void EnviarSMS(string msg) => Console.WriteLine($"SMS: {msg}");

// Uso
Notificacion notificar = EnviarEmail;
notificar("Stock bajo");          // llama a EnviarEmail
notificar += EnviarSMS;           // multicast: agrega otro metodo
notificar("Producto agotado");    // llama a ambos
notificar -= EnviarEmail;         // remueve
```

### Delegados predefinidos

| Tipo | Firma | Uso |
|------|-------|-----|
| `Action` | `void()` | Sin parametros ni retorno |
| `Action<T>` | `void(T)` | Un parametro, sin retorno |
| `Action<T1,T2>` | `void(T1,T2)` | Dos parametros, sin retorno |
| `Func<TResult>` | `TResult()` | Sin parametros, retorna valor |
| `Func<T,TResult>` | `TResult(T)` | Un parametro, retorna valor |
| `Predicate<T>` | `bool(T)` | Retorna bool (equivalente a `Func<T,bool>`) |

```csharp
// Action y Func en accion
Action<string> loguear = msg => Console.WriteLine($"[LOG] {msg}");
loguear("Inicio del proceso");

Func<Producto, decimal> calcularTotal = p => p.Precio * p.Stock;
decimal total = calcularTotal(producto);

Predicate<Producto> sinStock = p => p.Stock == 0;
var agotados = productos.FindAll(sinStock);
```

### Lambdas como delegados

```csharp
// Lambda en linea en vez de declarar delegate explicitamente
var caros = productos.Where(p => p.Precio > 1000).ToList();

// Action/Func con lambda
Action<string> mostrar = mensaje => Console.WriteLine(mensaje);
Func<int, int, int> sumar = (a, b) => a + b;
```

---

## 3. Eventos

Los eventos son delegates multicaste que permiten notificar cambios sin que el emisor conozca a los suscriptores.

```csharp
// Declaracion del evento
public class Inventario
{
    // EventHandler<T> es un delegate predefinido de .NET
    public event EventHandler<StockBajoEventArgs>? StockBajo;

    public void ReducirStock(string producto, int cantidad)
    {
        // logica de reduccion...
        int stockRestante = ObtenerStock(producto) - cantidad;

        if (stockRestante > 0 && stockRestante <= 5)
            OnStockBajo(new StockBajoEventArgs(producto, stockRestante));
    }

    protected virtual void OnStockBajo(StockBajoEventArgs e)
    {
        StockBajo?.Invoke(this, e);  // ?.Invoke es seguro (evita null si no hay suscriptores)
    }
}

// Argumentos del evento
public class StockBajoEventArgs : EventArgs
{
    public string Producto { get; }
    public int StockRestante { get; }

    public StockBajoEventArgs(string producto, int stockRestante)
    {
        Producto = producto;
        StockRestante = stockRestante;
    }
}
```

### Suscripcion

```csharp
var inventario = new Inventario();

// Suscribir
inventario.StockBajo += (sender, e) =>
    Console.WriteLine($"ALERTA: {e.Producto} tiene solo {e.StockRestante} unidades");

// Evento tambien puede tener suscriptor de metodo (no solo lambda)
inventario.StockBajo += EnviarAlertaEmail;
```

### Patron INotifyPropertyChanged (para UI/WPF)

```csharp
public class ProductoViewModel : INotifyPropertyChanged
{
    private decimal _precio;
    public event PropertyChangedEventHandler? PropertyChanged;

    public decimal Precio
    {
        get => _precio;
        set
        {
            if (_precio != value)
            {
                _precio = value;
                PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Precio)));
            }
        }
    }
}
```

---

## 4. Ejemplo Completo: Notificaciones de Inventario

```csharp
public class SistemaNotificaciones
{
    private readonly List<INotificable> _canales = new();

    public void AgregarCanal(INotificable canal) => _canales.Add(canal);

    public void NotificarTodos(string mensaje)
    {
        foreach (var canal in _canales)
            canal.Enviar(mensaje);
    }
}

public interface INotificable
{
    void Enviar(string mensaje);
}

public class EmailNotificable : INotificable
{
    public void Enviar(string mensaje)
        => Console.WriteLine($"[EMAIL] {mensaje}");
}

public class SmsNotificable : INotificable
{
    public void Enviar(string mensaje)
        => Console.WriteLine($"[SMS] {mensaje}");
}

// Uso con eventos
public class Programa
{
    static void Main()
    {
        var inventario = new Inventario();
        var notificador = new SistemaNotificaciones();

        inventario.StockBajo += (s, e) =>
            notificador.NotificarTodos($"Stock bajo: {e.Producto} ({e.StockRestante} uds)");

        // Simular reduccion de stock
        inventario.ReducirStock("Mouse", 45);
    }
}
```

---

## 5. Buenos Practicas

- Usar restricciones genericas para documentar el contrato del tipo
- Preferir `Func<T>`/`Action<T>` sobre delegates personalizados (salvo que necesites semantica especifica)
- Usar `event EventHandler<TArgs>` en vez de delegates directos para eventos publicos
- La convencion es: sender como `object`, EventArgs con sufijo `EventArgs`
- Siempre usar `?.Invoke()` para invocar eventos (evita null reference si no hay suscriptores)
- `Predicate<T>` es funcionalmente equivalente a `Func<T,bool>`

## Resumen

- Generics permiten reutilizar codigo sin perder tipado.
- Delegates (`Action`, `Func`, `Predicate`) representan metodos como valores.
- Las lambdas son la forma mas concisa de crear delegates.
- Eventos permiten notificacion desacoplada entre emisor y suscriptores.
- El patron `EventHandler<TEventArgs>` es el estandar para eventos en .NET.
