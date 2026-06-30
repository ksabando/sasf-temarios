---
sidebar_label: "Clase"
---

## 1. Inmutabilidad y Efectos Secundarios

La programacion funcional se basa en funciones puras: sin efectos secundarios y que siempre devuelven el mismo resultado para los mismos argumentos.

```csharp
// Funcion impura (tiene efectos secundarios)
public void AgregarLog(string mensaje)
{
    File.AppendAllText("log.txt", mensaje);   // efecto: escribe archivo
}

// Funcion pura (sin efectos)
public string FormatearMensaje(string nombre, decimal total)
{
    return $"Cliente: {nombre}, Total: {total:C}";
}
```

### Beneficios de la inmutabilidad

| Beneficio | Explicacion |
|-----------|-------------|
| Thread-safe | No hay race conditions porque el estado no cambia |
| Rastreable | Sabes que un valor no cambiara inesperadamente |
| Compartible | Puedes pasar el mismo objeto a multiples metodos sin riesgo |
| Cacheable | Si el resultado no cambia, puedes cachearlo |

---

## 2. Higher-Order Functions

Funciones que reciben funciones como parametro o devuelven funciones.

```csharp
// Funcion que recibe otra funcion
public List<T> Filtrar<T>(List<T> items, Func<T, bool> criterio)
{
    return items.Where(criterio).ToList();
}

// Funcion que devuelve otra funcion
public Func<decimal, decimal> CrearCalculadorImpuesto(decimal tasa)
{
    return (decimal monto) => monto * tasa;
}

// Uso
var calcularIva = CrearCalculadorImpuesto(0.21m);
decimal iva = calcularIva(1000m);  // 210
```

---

## 3. Composition with Func y Action

```csharp
// Composicion de funciones
Func<int, int> duplicar = x => x * 2;
Func<int, int> sumarUno = x => x + 1;

Func<int, int> duplicarYSumar = x => sumarUno(duplicar(x));

// Usar AndThen (composicion a izquierda)
public static Func<T, TResult2> AndThen<T, TResult1, TResult2>(
    this Func<T, TResult1> first, Func<TResult1, TResult2> second)
    => x => second(first(x));

var procesar = duplicar.AndThen(sumarUno);
Console.WriteLine(procesar(5));  // (5*2)+1 = 11
```

### Curry

```csharp
// Currying: transformar funcion de multiples parametros en cadena de funciones
Func<int, Func<int, int>> sumar = x => y => x + y;
var sumarCinco = sumar(5);
Console.WriteLine(sumarCinco(3));  // 8
```

---

## 4. Option Pattern (Maybe)

Simula tipos opcionales sin usar null, evitando NullReferenceException.

```csharp
public class Option<T>
{
    private readonly T? _valor;
    public bool TieneValor { get; }

    private Option(T? valor, bool tieneValor)
    {
        _valor = valor;
        TieneValor = tieneValor;
    }

    public static Option<T> Some(T valor) => new(valor, true);
    public static Option<T> None() => new(default, false);

    public TResult Match<TResult>(Func<T, TResult> some, Func<TResult> none)
        => TieneValor ? some(_valor!) : none();

    public Option<TResult> Map<TResult>(Func<T, TResult> mapper)
        => TieneValor ? Option<TResult>.Some(mapper(_valor!)) : Option<TResult>.None();

    public T ValueOr(T defaultValue)
        => TieneValor ? _valor! : defaultValue;
}

// Uso
public Option<Producto> BuscarProducto(string nombre)
{
    var producto = _productos.FirstOrDefault(p => p.Nombre == nombre);
    return producto is not null
        ? Option<Producto>.Some(producto)
        : Option<Producto>.None();
}

var resultado = BuscarProducto("Laptop");
var precio = resultado.Match(
    some: p => p.Precio,
    none: () => 0
);
```

---

## 5. Pipelines Funcionales

```csharp
// Pipeline de transformacion
public class Pipeline<T>
{
    private readonly List<Func<T, T>> _pasos = new();

    public Pipeline<T> AgregarPaso(Func<T, T> paso)
    {
        _pasos.Add(paso);
        return this;
    }

    public T Ejecutar(T entrada)
    {
        return _pasos.Aggregate(entrada, (actual, paso) => paso(actual));
    }
}

// Uso
var pipeline = new Pipeline<Producto>()
    .AgregarPaso(p => p with { Precio = p.Precio * 0.9m })   // 10% descuento
    .AgregarPaso(p => p with { Stock = p.Stock + 50 })       // reposicion
    .AgregarPaso(p => p with { Descripcion = $"Oferta: {p.Nombre}" });

var procesado = pipeline.Ejecutar(producto);
```

---

## 6. Tuplas y Deconstruccion

```csharp
// Tuplas con nombres semanticos
var resultado = (Suma: 1500m, Cantidad: 10, Promedio: 150m);

// Deconstruccion
var (suma, cant, prom) = resultado;

// Tuplas como retorno de metodos
public (bool Exito, string Mensaje) ProcesarPago(decimal monto)
{
    if (monto <= 0) return (false, "Monto invalido");
    return (true, "Pago procesado");
}

// Deconstruir en tipos personalizados
public record Direccion(string Calle, string Ciudad, string Pais);
var (calle, ciudad, pais) = new Direccion("Av. Siempre Viva", "Springfield", "USA");
```

---

## 7. Ejemplo Completo: Procesamiento Funcional de Pedidos

```csharp
public record Pedido(
    string Cliente,
    List<(string Producto, int Cantidad, decimal PrecioUnitario)> Items,
    decimal Descuento = 0
);

public static class ProcesadorPedidos
{
    public static Func<Pedido, decimal> CalcularSubtotal =>
        p => p.Items.Sum(i => i.Cantidad * i.PrecioUnitario);

    public static Func<decimal, decimal> AplicarDescuento(decimal porcentaje) =>
        subtotal => subtotal * (1 - porcentaje);

    public static Func<decimal, decimal> CalcularIva(decimal tasa = 0.21m) =>
        subtotal => subtotal * tasa;

    public static Func<Pedido, decimal> CalcularTotal =>
        p =>
        {
            var subtotal = CalcularSubtotal(p);
            var conDescuento = AplicarDescuento(p.Descuento)(subtotal);
            var iva = CalcularIva()(conDescuento);
            return conDescuento + iva;
        };

    public static Func<Pedido, Pedido> AplicarDescuentoPorMonto =>
        p => p.Descuento == 0 && CalcularSubtotal(p) > 1000
            ? p with { Descuento = 0.1m }
            : p;
}
```

---

## 8. Buenos Practicas

- Preferir inmutabilidad: usar `record`, `init`, `readonly` donde tenga sentido
- Las funciones puras son mas faciles de probar y razonar
- Usar tuplas con nombres para retornos multiples (antes de crear DTOs especificos)
- Evitar mutacion de parametros dentro de metodos
- Preferir expresiones LINQ sobre ciclos mutables
- El patron Option es mejor que devolver null cuando "no hay resultado" es un caso esperado

## Resumen

- Funciones puras: sin efectos secundarios, deterministas, faciles de probar.
- Higher-order functions permiten composicion y reutilizacion.
- Tuplas permiten retornar multiples valores sin crear tipos especificos.
- El patron Option evita null y fuerza al consumidor a manejar ambos casos.
- Los pipelines funcionales componen operaciones de forma legible.
- C# soporta el paradigma funcional aunque sea multiparadigma.
