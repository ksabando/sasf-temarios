---
sidebar_label: "Clase"
---

## Entity Framework Core y SQL Server

EF Core es un ORM que mapea clases C# a tablas. Permite consultar y persistir datos usando LINQ y un `DbContext`.

### Componentes

| Elemento | Rol |
|----------|-----|
| Entity | Clase persistente |
| DbContext | Unidad de trabajo con la base |
| DbSet | Coleccion consultable de entidades |
| Migration | Cambio versionado del esquema |

## Recomendacion

Mantener entidades simples y aplicar reglas de negocio en servicios cuando el caso de uso crece.
