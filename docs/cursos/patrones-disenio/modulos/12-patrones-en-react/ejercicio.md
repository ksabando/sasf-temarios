---
sidebar_label: "Ejercicio"
---

## Ejercicio 3: Custom Hook — useWebSocket

Implementa un custom hook `useWebSocket` que:

- Conecte a una URL WebSocket
- Reconecte automáticamente al perder conexión (con backoff exponencial)
- Proporcione: `{ data, isConnected, send, error }`
- Se limpie al desmontar el componente

Usa este hook para construir un chat en tiempo real.

---

## Ejercicio 4: Provider Pattern — Shopping Cart

Implementa un carrito de compras usando Context + useReducer:

- Provider: `CartProvider`
- Hook: `useCart()`
- Acciones: `ADD_ITEM`, `REMOVE_ITEM`, `UPDATE_QUANTITY`, `CLEAR`
- El carrito debe persistir en `localStorage`
- Calcular total automáticamente

Crea componentes que consuman el carrito: `ProductList`, `CartSummary`, `CartIcon` (badge con count).

---

## Ejercicio 5: State Reducer — Todo List

Implementa una lista de tareas usando State Reducer pattern:

- El componente `TodoList` acepta un `reducer` opcional
- Acciones por defecto: `ADD_TODO`, `TOGGLE_TODO`, `DELETE_TODO`, `CLEAR_COMPLETED`
- Crea un reducer personalizado que:
  - Prevenga agregar tareas vacías
  - Limite a máximo 10 tareas activas
  - Registre cada acción en consola

El componente base debe funcionar sin reducer personalizado, pero el reductor personalizado debe poder modificar cualquier aspecto del comportamiento.
