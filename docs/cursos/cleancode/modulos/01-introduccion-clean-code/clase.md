---
sidebar_label: "Clase"
---

# Módulo 01 — Introducción a Clean Code

## ¿Qué es Clean Code?

Clean Code es código legible, mantenible y que hace una sola cosa bien. No es código "bonito": es código que otro desarrollador puede entender y modificar sin miedo a romperlo.

Robert C. Martin (2008) define código limpio como aquel que:
- **Es legible**: cualquier persona del equipo lo entiende
- **Es simple**: no hace más de lo necesario
- **Es mantenible**: cambiar una parte no rompe otra
- **Tiene tests**: está verificado automáticamente

```java
// SUCIO: ¿qué hace esto?
public double c(List<Integer> a) {
    double s = 0;
    for (int i = 0; i < a.size(); i++) {
        s += a.get(i);
    }
    return s / a.size();
}

// LIMPIO: el nombre revela la intención
public double calculateAverage(List<Integer> numbers) {
    double sum = 0;
    for (int number : numbers) {
        sum += number;
    }
    return sum / numbers.size();
}
```

## Deuda Técnica

Ward Cunningham acuñó el término: código mal escrito es como una deuda financiera. La "deuda técnica" se acumula con intereses compuestos.

```java
// Deuda técnica: escribir rápido, pagar después
public void process(String d) {
    String[] p = d.split(",");
    // 200 líneas más abajo...
}
```

Cada vez que alguien toca este código, paga "intereses" (tiempo extra entendiendo qué hace).

### Tipos de deuda técnica (Martin Fowler)

| Tipo | Intencional | No intencional |
|------|-------------|----------------|
| **Estratégica** | Sabemos que es deuda, la tomamos para llegar a fecha límite | No sabemos que existe deuda |
| **Táctica** | Decisiones conscientes y planificadas | Código que se degrada sin darnos cuenta |

## Costo del Código Desordenado

- **3x más tiempo** para implementar nuevas funcionalidades
- **5x más bugs** en módulos con alta complejidad ciclomática
- **70% del tiempo** de un desarrollador es **leyendo código**, no escribiendo

## Lectura vs Escritura

Se lee código **10x más** de lo que se escribe. Optimizar para legibilidad es optimizar para el 90% del tiempo.

```java
// No optimices para escribir (rápido de tipear)
// Optimiza para leer (rápido de entender)
```

## Boy Scout Rule

> "Deja el campamento más limpio de como lo encontraste"

Cada vez que toques un archivo, déjalo un poco mejor:
- Renombra una variable confusa
- Extrae un método
- Elimina un comentario redundante

## Broken Window Theory

Una ventana rota en un edificio lleva a más ventanas rotas. En software: un método feo lleva a más código feo.

Si ves una "ventana rota" (código malo), **arréglala inmediatamente** o se propagará.

## Code Smells Básicos

Según Martin Fowler, estos son los smells más comunes:

1. **Métodos largos**: más de 20 líneas es sospechoso
2. **Clases grandes**: más de 200 líneas
3. **Parámetros excesivos**: más de 3 parámetros
4. **Nombres confusos**: `data`, `info`, `temp`, `x`
5. **Comentarios innecesarios**: explican lo obvio
6. **Switch/if anidados**: más de 2 niveles
7. **Código duplicado**: copiar y pegar
8. **Null repetidos**: verificar null en cada método

## Las 4 Reglas Simples de Kent Beck

1. **Pasa todos los tests**
2. **Revela intención** (nombres claros)
3. **No tiene duplicación** (DRY)
4. **Tiene el mínimo número de elementos** (YAGNI)

## Herramientas de Análisis

| Herramienta | Propósito |
|-------------|-----------|
| SonarLint | Análisis en tiempo real en IDE |
| Checkstyle | Estilo de código (nombres, formato) |
| PMD | Bugs potenciales, código muerto |
| SpotBugs | Bugs por bytecode |

## Proyecto Base

El curso usa un proyecto Spring Boot legado de nóminas. Contiene intencionalmente:
- Nombres confusos
- Funciones de 200+ líneas
- Código duplicado
- Sin tests
- Nulls por todas partes

> **Objetivo del curso**: transformar este proyecto aplicando Clean Code módulo por módulo.
