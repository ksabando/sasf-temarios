---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Iterador Personalizado para Matriz

Implementa un iterador para recorrer una matriz (arreglo bidimensional) en **orden espiral**:

```java
int[][] matriz = {
    {1,  2,  3,  4},
    {5,  6,  7,  8},
    {9, 10, 11, 12}
};
// Orden espiral: 1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7
```

Implementa `MatrizEspiral` que implemente `Iterable<Integer>`.

---

## Ejercicio 4: Mediator para Formulario con Validación en Tiempo Real

Implementa un mediador para coordinar componentes de un formulario:

- **Componentes**: `TextField` (nombre, email), `Checkbox` (acepta términos), `Button` (submit)
- **Mediator**: `FormularioMediator` que:
  - Escucha cambios en cada campo
  - Habilita/deshabilita el botón submit según validación
  - Muestra mensajes de error en tiempo real
  - Coordina la lógica: si email cambia, validar formato; si checkbox cambia, revisar botón

El mediador reduce el acoplamiento directo entre componentes del formulario.
