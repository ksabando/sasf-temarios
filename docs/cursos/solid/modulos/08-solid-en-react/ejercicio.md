---
sidebar_label: "Ejercicio"
---

## Ejercicio 1: SRP — Separar en Componentes Atómicos y Hooks

Divide el Dashboard en:
1. **Hooks personalizados:** `useUsers()`, `useProducts()`, `useOrders()`, `useAnalytics()`, `useNotifications()`
2. **Componentes de presentación:** `UserTable`, `ProductTable`, `OrderTable`, `AnalyticsCard`, `SearchBar`, `Pagination`, `ExportControls`, `Sidebar`, `NotificationPanel`
3. **Modal:** `AddUserModal`
4. **Layout:** `DashboardLayout`

Cada componente debe tener una sola responsabilidad.

---

## Ejercicio 2: OCP — Hacer Extensible el Dashboard

Aplica OCP para que se puedan agregar nuevas secciones sin modificar el Dashboard:
1. Crea una interfaz `DashboardSection` con `key`, `label`, `count`, `component`
2. Implementa `UsersSection`, `ProductsSection`, `OrdersSection`, `AnalyticsSection`
3. El Dashboard recibe una lista de secciones y las renderiza dinámicamente
4. Para agregar una nueva sección (ej: `LogsSection`), solo creas el componente y lo agregas a la lista

---

## Ejercicio 3: LSP + ISP — Props e Interfaces Correctas

Aplica LSP e ISP:
1. Define interfaces base para tablas: `TableProps<T>`, `Column<T>`
2. Crea `GenericTable<T>` que funcione con cualquier tipo de datos
3. Aplica ISP: los componentes deben recibir solo las props que necesitan
   - `Pagination` no debe saber de usuarios ni productos
   - `SearchBar` no debe saber de tablas
4. Asegura que cualquier implementación de `Column<T>` sea sustituible (LSP)

---

## Ejercicio 4: DIP — Inyección de Dependencias

Aplica DIP:
1. Crea interfaces de servicio: `UserApi`, `ProductApi`, `OrderApi`, `AnalyticsApi`
2. Implementaciones: `ApiUserService` (con fetch), `MockUserService` (para pruebas)
3. Usa `React.createContext` + `useContext` para inyectar las dependencias
4. El Dashboard y sus componentes no deben conocer la implementación concreta
5. En pruebas, se pueden inyectar servicios mock

---

## Criterios de Evaluación

| Criterio | Puntos |
|----------|--------|
| SRP: hooks y componentes atómicos separados | 2 pts |
| OCP: secciones extensibles sin modificar Dashboard | 2 pts |
| LSP: tablas genéricas con columnas sustituibles | 2 pts |
| ISP: props mínimas en cada componente | 2 pts |
| DIP: inyección de servicios mediante Context | 2 pts |
| **Total** | **10 pts** |
