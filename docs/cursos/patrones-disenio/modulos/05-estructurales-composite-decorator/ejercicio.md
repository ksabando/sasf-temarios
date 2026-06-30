---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Menú de Restaurante con Composite

Implementa un menú de restaurante jerárquico:

- `MenuItem`: plato individual con nombre, precio, descripción
- `MenuCategory`: categoría que contiene items u otras categorías
- Método `getPrice()` que calcule el precio total recursivamente
- Método `print()` que muestre la jerarquía completa

Estructura de ejemplo:
```
Menú Principal
├── Entradas
│   ├── Ceviche ($12)
│   └── Causa ($8)
├── Platos de Fondo
│   ├── Lomo Saltado ($18)
│   └── Ají de Gallina ($15)
└── Bebidas
    ├── Gaseosa ($3)
    └── Chicha ($4)
```

---

## Ejercicio 4: Decorator para Reportes

Implementa un generador de reportes decorable:

- Interfaz `Reporte` con método `String generar()`
- `ReporteBase`: genera un reporte simple con título y fecha
- Decoradores:
  - `EncabezadoDecorator`: agrega logo y nombre de empresa
  - `PiePaginaDecorator`: agrega número de página y total
  - `FormatoHTMLDecorator`: envuelve el contenido en HTML
  - `FirmaDigitalDecorator`: agrega hash SHA-256 al final

Crea: ReporteBase → Encabezado → PiePagina → FormatoHTML y genera la salida.
