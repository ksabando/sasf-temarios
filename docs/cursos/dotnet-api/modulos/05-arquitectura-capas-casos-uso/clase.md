---
sidebar_label: "Clase"
---

## Arquitectura por Capas y Casos de Uso

Una API crece mejor cuando separa transporte HTTP, reglas de aplicacion, dominio y persistencia. Esto facilita pruebas, cambios de infraestructura y mantenimiento.

| Capa | Responsabilidad |
|------|-----------------|
| API | Controllers, filtros, contratos HTTP |
| Application | Casos de uso y servicios |
| Domain | Entidades y reglas |
| Infrastructure | EF Core, archivos, servicios externos |

## Resumen

El controller no debe contener reglas de negocio complejas.
