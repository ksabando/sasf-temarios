---
sidebar_label: "Clase"
---

## Buenas prácticas

| Práctica | Detalle |
|----------|---------|
| **ARIA roles** | Preferir `getByRole` sobre `getByText` para accesibilidad |
| **Act** | No usar `act` directamente; `userEvent` lo maneja |
| **Cleanup** | RTL limpia automáticamente después de cada test |
| **Mock minimal** | Solo mockear lo necesario (MSW para HTTP) |
| **No implementation** | Testear comportamiento, no implementación interna |
