---
sidebar_label: "Clase"
---

## 1. Estructura de un Programa en C#

Todo programa C# se organiza en archivos `.cs`. El punto de entrada tradicional es el metodo `Main` dentro de una clase. Desde C# 9 se pueden usar instrucciones de nivel superior (*top-level statements*) que eliminan parte del boilerplate, pero aqui usaremos la estructura clasica para entender cada elemento.

```csharp
using System;

namespace MiAplicacion
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hola, C#!");
        }
    }
}
```

| Elemento | Proposito |
|----------|-----------|
| `using System;` | Importa el espacio de nombres base con `Console`, `String`, etc. |
| `namespace` | Agrupa clases relacionadas y evita conflictos de nombres |
| `class Program` | Define el tipo que contiene el punto de entrada |
| `static void Main` | Metodo que el runtime ejecuta al iniciar |
| `string[] args` | Argumentos de linea de comandos |

---

## 2. Tipos de Dato y Variables

C# es un lenguaje **fuertemente tipado**: toda variable tiene un tipo conocido en compilacion.

### Tipos por valor (value types)

| Tipo | Tamano | Rango | Uso tipico |
|------|--------|-------|------------|
| `int` | 32 bits | ±2.147 millones | Contadores, IDs |
| `long` | 64 bits | ±9 cuatrillones | Valores grandes |
| `decimal` | 128 bits | 28-29 digitos | Dinero, precios |
| `double` | 64 bits | ±10^308 | Calculos cientificos |
| `float` | 32 bits | ±10^38 | Graficos 3D |
| `bool` | 1 bit | true/false | Condiciones |
| `char` | 16 bits | Unicode | Un solo caracter |

### Tipos por referencia (reference types)

| Tipo | Descripcion |
|------|-------------|
| `string` | Cadena de texto inmutable |
| `object` | Tipo base de todos los tipos |
| `dynamic` | Tipado dinamico en tiempo de ejecucion |

### Declaracion de variables

```csharp
int edad = 30;
string nombre = "Ana";
decimal precio = 19.99m;          // sufijo m para decimal
double tasa = 0.05;
bool activo = true;
var saldo = 1000.50m;             // inferencia de tipo, equivalente a decimal
```

La palabra clave `var` infiere el tipo en compilacion. No es `variant` ni `dynamic`: el compilador determina el tipo exacto.

---

## 3. Constantes y Literales

```csharp
const decimal IVA = 0.21m;
const string Empresa = "Tienda SA";
```

Las constantes son inmutables y deben inicializarse en la declaracion.

---

## 4. Operadores

| Categoria | Operadores | Ejemplo |
|-----------|------------|---------|
| Aritmeticos | `+`, `-`, `*`, `/`, `%` (modulo) | `total = precio * cantidad` |
| Comparacion | `==`, `!=`, `<`, `>`, `<=`, `>=` | `if (edad >= 18)` |
| Logicos | `&&`, `||`, `!` | `if (activo && saldo > 0)` |
| Incremento | `++`, `--` | `contador++` |
| Asignacion | `=`, `+=`, `-=`, `*=`, `/=` | `total += impuesto` |
| Ternario | `?:` | `var msg = edad >= 18 ? "Mayor" : "Menor"` |

### Interpolacion de cadenas

```csharp
string saludo = $"Hola, {nombre}. Tu saldo es {saldo:C}";
// Output: Hola, Ana. Tu saldo es $1,000.50
```

El formato `:C` muestra el valor como moneda con la configuracion regional.

---

## 5. Estructuras de Control

### Condicionales

```csharp
// if / else if / else
if (puntaje >= 90)
    Console.WriteLine("Excelente");
else if (puntaje >= 70)
    Console.WriteLine("Bien");
else
    Console.WriteLine("Necesitas mejorar");

// switch
switch (categoria)
{
    case "VIP":
        descuento = 0.2m;
        break;
    case "Regular":
        descuento = 0.1m;
        break;
    default:
        descuento = 0;
        break;
}

// switch expression (C# 8+)
var descuento = categoria switch
{
    "VIP" => 0.2m,
    "Regular" => 0.1m,
    _ => 0
};
```

### Ciclos

```csharp
// for - cuando sabes el numero exacto de iteraciones
for (int i = 0; i < 10; i++)
    Console.WriteLine($"Iteracion {i + 1}");

// foreach - para recorrer colecciones
foreach (var item in productos)
    Console.WriteLine(item.Nombre);

// while - cuando la condicion se evalua antes
while (stock > 0)
{
    stock--;
    Console.WriteLine($"Quedan {stock} unidades");
}

// do-while - se ejecuta al menos una vez
do
{
    Console.WriteLine("Menu: 1. Ver 2. Salir");
    opcion = Console.ReadLine();
} while (opcion != "2");
```

---

## 6. Conversion de Tipos

```csharp
// Conversion implicita (segura)
int entero = 100;
double doble = entero;

// Conversion explicita (cast)
double precio = 19.99;
int enteroPrecio = (int)precio;       // pierde decimales: 19

// Parseo de string
string texto = "150";
int numero = int.Parse(texto);

// TryParse (seguro)
if (int.TryParse(texto, out int resultado))
    Console.WriteLine($"Numero valido: {resultado}");
else
    Console.WriteLine("Formato invalido");
```

Siempre preferir `TryParse` sobre `Parse` cuando la entrada no sea controlada, porque `Parse` lanza una excepcion si falla.

---

## 7. Ejemplo Completo: Calculadora de Inventario

```csharp
using System;

namespace Tienda
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.Write("Nombre del producto: ");
            string nombre = Console.ReadLine();

            Console.Write("Precio unitario: ");
            if (!decimal.TryParse(Console.ReadLine(), out decimal precio) || precio <= 0)
            {
                Console.WriteLine("Precio invalido. Debe ser mayor a cero.");
                return;
            }

            Console.Write("Cantidad: ");
            if (!int.TryParse(Console.ReadLine(), out int cantidad) || cantidad <= 0)
            {
                Console.WriteLine("Cantidad invalida. Debe ser mayor a cero.");
                return;
            }

            decimal total = precio * cantidad;
            Console.WriteLine($"\nProducto: {nombre}");
            Console.WriteLine($"Total: {total:C}");

            if (cantidad < 5)
                Console.WriteLine("ALERTA: Stock bajo");
        }
    }
}
```

---

## 8. Buenos Practicas

- Usar nombres significativos para variables (`precioProducto` en vez de `p`)
- Declarar variables cerca de donde se usan
- Preferir `decimal` para valores monetarios
- Usar `TryParse` para entradas de usuario
- Preferir `switch expression` sobre `switch` statement cuando sea posible
- Utilizar interpolacion de cadenas en vez de concatenacion

## Resumen

- C# es fuertemente tipado: toda variable tiene un tipo definido en compilacion.
- `var` infiere el tipo, no es tipado dinamico.
- Las estructuras de control (`if`, `switch`, `for`, `foreach`) son similares a otros lenguajes C-like.
- La consola es el entorno ideal para practicar logica antes de pasar a APIs o interfaces graficas.
