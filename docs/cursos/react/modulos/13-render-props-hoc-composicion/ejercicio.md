---
sidebar_label: "Ejercicio"
---

# Ejercicios: Render Props, HOC y Composición - TaskFlow

Projecto base: `taskflow/`

## Ejercicio 1: Tabs compuesto para filtros

Crear `src/components/ui/Tabs.tsx` como Compound Component:

- `<Tabs>` maneja estado de pestaña activa con Context
- `<Tabs.Tab>` cambia la pestaña activa al hacer clic
- `<Tabs.TabPanel>` muestra contenido solo si su índice coincide
- Reemplazar los filtros actuales del Dashboard por este componente
- Pestañas: "Pendientes" (índice 0), "Completadas" (índice 1), "Todas" (índice 2)

## Ejercicio 2: Accordion para descripción expandible

Crear `src/components/ui/Accordion.tsx`:

- Compound Component con Accordion y Accordion.Item
- Cada Item tiene header (visible siempre) y panel (expandible)
- Click en el header togglea la visibilidad del panel
- Solo un item abierto a la vez
- Usarlo en TaskDetailPage para mostrar descripción de tareas

## Ejercicio 3: Modal compuesto (Modal.Header, Body, Footer)

Refactorizar `Modal.tsx` como Compound Component:

- `Modal.Header` con título y botón de cierre
- `Modal.Body` para contenido principal
- `Modal.Footer` para acciones (botones)
- Uso: `<Modal> <Modal.Header>Título</Modal.Header> <Modal.Body>...</Modal.Body> <Modal.Footer><button>OK</button></Modal.Footer> </Modal>`

## Ejercicio 4: Reemplazar filtros del Dashboard por Tabs

En `DashboardPage.tsx`:

- Reemplazar los botones de filtro manuales por `<Tabs>`
- Cada tab panel debe mostrar la lista filtrada correspondiente
- Mantener la funcionalidad de filtrado por estado

## Ejercicio 5: Polymorphic Button

Crear `src/components/ui/Button.tsx` con prop `as`:

- Por defecto renderiza `<button>`
- Con `as="a"` renderiza como link
- Variantes: primary, secondary, danger
- Tamaños: sm, md, lg
