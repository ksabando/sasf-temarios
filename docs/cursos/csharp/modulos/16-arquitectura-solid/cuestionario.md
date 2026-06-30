---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario M16 - Arquitectura y SOLID en C#

**Instruccion**: Estas preguntas evaluan si investigaste mas alla del contenido de la clase. No alcanza con lo visto en `clase.md`. Fundamenta tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] El principio de Inversion de Dependencias (DIP) es el mas importante de SOLID segun Robert C. Martin. Explica la diferencia entre IoC (Inversion of Control), DI (Dependency Injection), y DIP (Dependency Inversion Principle). Son lo mismo o conceptos diferentes?

**Respuesta**: Son conceptos diferentes pero relacionados: (1) DIP es el principio: "depende de abstracciones, no de concreciones". (2) IoC es la tecnica de transferir el control de creacion de objetos a un contenedor externo. (3) DI es un patron de implementacion donde las dependencias se pasan desde afuera (constructor, propiedad, parametro). DIP es el "que" (que debe depender de interfaces), IoC es el "como" (el contenedor gestiona el ciclo de vida), DI es el "donde" (las dependencias se inyectan por constructor). Se pueden aplicar DIP sin IoC (inyectando manualmente) y IoC sin DI (usando Service Locator).

**Por que**: Robert C. Martin aclaro esta distincion en "Agile Principles, Patterns and Practices". La confusion es comun porque los tres conceptos aparecen juntos. DIP es sobre diseno (abstracciones), IoC es sobre infraestructura (contenedor), DI es sobre implementacion (constructor injection). Fuente: "Clean Architecture" - Robert C. Martin, "Dependency Injection in .NET" - Mark Seemann, y "Inversion of Control Containers" - Martin Fowler.

---

### 2. [Investigar] CQRS (Command Query Responsibility Segregation) separa modelos de lectura y escritura. Explica los beneficios en terminos de rendimiento y seguridad, cuando aplicar CQRS completo vs CQRS solo a nivel de objetos, y como se implementaria en C# sin librerias externas (solo con clases separadas).

**Respuesta**: CQRS completo: (1) modelos separados para lectura (desnormalizado, optimizado para queries) y escritura (normalizado, optimizado para commands), (2) beneficios: escalado independiente de reads y writes, modelos de lectura mas rapidos (sin joins), seguridad segregada (solo writes necesitan autorizacion estricta). CQRS a nivel de objetos: commands y queries son objetos separados pero comparten el mismo modelo y repositorio. Implementacion sin librerias: `public class CrearProductoCommand { ... }` y `public class BuscarProductoQuery { ... }`, cada uno con su handler. CQRS es util cuando hay asimetria entre lectura y escritura; para CRUD simple, es over-engineering.

**Por que**: CQRS fue popularizado por Greg Young y Martin Fowler. Se aplica naturalmente con MediatR pero no requiere la libreria: las clases Command/Query y sus handlers son CQRS. La confusion surge porque MediatR se asocia con CQRS, pero CQRS es un patron arquitectonico, no una libreria. Fuente: "CQRS" - Martin Fowler, y "CQRS Documents" - Greg Young.

---

### 3. [Investigar] El patron *Repository* combinado con *Unit of Work* es la base de Entity Framework Core y de muchas aplicaciones empresariales. Explica como EF Core implementa Unit of Work (DbContext.SaveChangesAsync), por que crear IUnitOfWork adicional puede ser redundante, y en que escenarios justifica tener una capa de Unit of Work propia.

**Respuesta**: DbContext es un Unit of Work: rastrea cambios en todas las entidades y los persiste atomicamente con SaveChangesAsync. Crear `IUnitOfWork` adicional es redundante si solo delegas en SaveChanges. Cuando justifica: (1) multiples DbContexts en un modulo (transaccion distribuida), (2) necesidad de guardar en multiples almacenes (SQL + Blob + Event Store) en una misma transaccion, (3) testing: mockear IUnitOfWork para evitar commit real, (4) logica pre/post commit (auditoria, eventos de dominio). Sin estas necesidades, Unit of Work de EF Core es suficiente.

**Por que**: Jimmy Bogard (creador de AutoMapper y MediatR) y Julie Lerman (gurua de EF) han debatido si agregar Unit of Work sobre DbContext es necesario. La posicion pragmatica: no agregar capas innecesarias. Si usas EF Core, DbContext es tu Unit of Work. Fuente: "DbContext as Unit of Work" - Julie Lerman, y debates en .NET community sobre repository pattern.

---

### 4. [Conectar] El principio DRY (Don't Repeat Yourself) a veces entra en conflicto con la Separacion de Responsabilidades (SRP). Por ejemplo, un DTO de CrearProducto y otro de ActualizarProducto pueden tener los mismos campos. Repetir codigo (DRY) o tener DTOs separados (SRP)? Explica el criterio para decidir.

**Respuesta**: El criterio es semantico, no estructural: si los campos son los mismos pero el proposito es diferente, tener DTOs separados respeta SRP y OpenAPI (cada endpoint tiene su propio contrato). DRY es sobre logica de negocio duplicada, no sobre estructura de datos. Ejemplo: `CrearProducto` puede tener `Nombre` obligatorio, `ActualizarProducto` puede tener `Nombre` opcional (partial update). Si los DTOs son identicos en estructura y semantica, usar el mismo DTO esta bien. El consejo: preferir SRP sobre DRY en contratos de API.

**Por que**: El conflicto entre DRY y SRP es conocido en la comunidad. Dave Thomas (coautor de "The Pragmatic Programmer", donde se origino DRY) aclaro que DRY es sobre "knowledge duplication", no "code duplication". Fuente: "The Pragmatic Programmer" - Hunt & Thomas, y "Clean Code" - Robert C. Martin.

---

### 5. [Cuestionar] La arquitectura en capas (Clean Architecture, Hexagonal) agrega complejidad: mas archivos, mas interfaces, mas indireccion. Defiende si para una aplicacion de C# empresarial esta complejidad vale la pena desde el inicio (empezar con Clean Architecture) o si es mejor empezar simple y refactorizar cuando se necesite (arquitectura evolutiva).

**Respuesta**: La posicion pragmatica: empezar con separacion simple (carpetas, no proyectos) y refactorizar a capas cuando aparezcan signos de dolor (el controller tiene 500 lineas, no puedes hacer unit tests sin base de datos, las reglas de negocio estan mezcladas con HTTP). Empezar con Clean Architecture completa desde el inicio puede ser over-engineering en proyectos pequenos. Sin embargo, SIEMPRE empezar con DI por constructor y programar contra interfaces, porque cambiar de concreto a interfaz despues es costoso. La separacion de dominios en proyectos separados solo cuando el codigo base lo justifique (mas de 10-15 proyectos? probablemente no necesitas clean architecture completa, si necesitas orden en carpetas).
