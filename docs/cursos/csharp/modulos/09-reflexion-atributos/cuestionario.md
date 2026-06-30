---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario M09 - Reflexion y Atributos

**Instruccion**: Estas preguntas evaluan si investigaste mas alla del contenido de la clase. No alcanza con lo visto en `clase.md`. Fundamenta tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] La reflexion en .NET tiene implicaciones de rendimiento conocidas. Sin embargo, .NET Core introdujo `FunctionPointer` y mejoras en `MethodInfo.Invoke` con `MethodInvoker` en .NET 7. Explica que optimizaciones se hicieron y como `MethodInvoker` se compara con la invocacion directa y con delegates compilados en runtime.

**Respuesta**: `MethodInvoker` (introducido en .NET 7) es una alternativa optimizada a `MethodInfo.Invoke` que reduce overhead hasta 5x porque evita boxing/unboxing y usa callvirt nativo cuando es posible. `MethodInfo.Invoke` tradicional boxea los parametros (object[]), hace reflection type checking y llamada virtual. `MethodInvoker` permite invocacion tipada y directa. Aun asi, la invocacion directa sigue siendo 10-20x mas rapida que cualquier reflexion. Los delegates compilados con `ExpressionTrees` o `DynamicMethod` son la alternativa de alto rendimiento: se compila un delegate en tiempo de ejecucion que invoca directamente el metodo sin reflexion.

**Por que**: Las optimizaciones de reflexion son parte del proyecto "Performance Work" de .NET liderado por Stephen Toub. El equipo de .NET reconoce que la reflexion no puede competir con invocacion directa, pero puede optimizarse para que frameworks como ASP.NET Core (que usan reflexion en el pipeline de routing y DI) no sean penalizados excesivamente. Fuente: .NET 7 Performance Improvements - Stephen Toub, y la documentacion de `MethodInvoker` en docs.microsoft.com.

---

### 2. [Investigar] Los *source generators* de C# 9 permiten generar codigo en tiempo de compilacion, ofreciendo una alternativa a la reflexion en runtime. Explica como funcionan los source generators, cuando reemplazan a la reflexion y que limitaciones tienen comparados con el enfoque clasico.

**Respuesta**: Los source generators son componentes de Roslyn que analizan el AST del codigo fuente durante la compilacion y generan archivos `.cs` adicionales que se compilan junto con el proyecto. A diferencia de la reflexion (que inspecciona tipos en runtime), los source generators generan codigo en tiempo de compilacion, eliminando el overhead de reflexion en tiempo de ejecucion. Ejemplos: `System.Text.Json` usa source generators para serializacion sin reflexion; `MediatR` (con `IMediator` source generator) evita el registro manual de handlers. Limitaciones: no pueden acceder a tipos generados por otros source generators, no pueden modificar codigo existente (solo agregar), y tienen acceso limitado al contexto de compilacion.

**Por que**: Los source generators representan un cambio de paradigma: de metadatos en runtime a codigo generado en compilacion. Microsoft los introdujo para escenarios donde la reflexion era el cuello de botella (JSON serialization, mapping object-object, DI registration). La comunidad los adopto rapidamente para eliminar boilerplate. Sin embargo, la reflexion sigue siendo necesaria para escenarios puramente dinamicos donde el tipo no se conoce hasta runtime. Fuente: "Introducing C# Source Generators" - Roslyn team, y "Source Generators in .NET" - Andrew Lock.

---

### 3. [Investigar] `System.Reflection.Emit` permite generar codigo IL en tiempo de ejecucion. Explica como funciona, en que escenarios se usa (frameworks AOP, ORMs, proxies) y si los source generators lo han vuelto obsoleto.

**Respuesta**: Reflection.Emit genera instrucciones IL directamente en memoria, creando tipos, metodos y ensamblados completos en tiempo de ejecucion. Se usa en: proxies dinamicos (Castle.Core para NHibernate), serializadores (protobuf-net), AOP frameworks (PostSharp, DispatchProxy) y contenedores DI que generan codigo para resolucion de dependencias. Los source generators no lo han vuelto obsoleto completamente porque no pueden generar codigo que dependa de tipos que solo existen en runtime (por ejemplo, un proxy para una clase que implementa una interfaz desconocida hasta runtime). Sin embargo, para escenarios donde los tipos son conocidos en compilacion, los source generators son la alternativa preferida.

**Por que**: Reflection.Emit es extremadamente potente pero dificil de debuggear y mantener. Microsoft recomienda source generators como primera opcion, y Reflection.Emit solo cuando sea estrictamente necesario (proxies runtime, serialization polimorfica dinamica). Fuente: "Dynamic Code in .NET" - Kevin Jones, y los patrones de diseno de Castle.Core y DispatchProxy.

---

### 4. [Conectar] La validacion con DataAnnotations se usa en ASP.NET Core para validar modelos automaticamente. Explica como funciona `ModelState` en ASP.NET Core, como se integra la validacion de atributos en el pipeline, y como podrias crear un `ValidationAttribute` personalizado para una regla de negocio especifica (ej: "el precio debe ser mayor al costo").

**Respuesta**: ASP.NET Core ejecuta la validacion automaticamente cuando el modelo tiene atributos DataAnnotations. El resultado se almacena en `ModelState`. Si hay errores, el framework responde con `400 Bad Request` y los detalles de los errores. Para crear un atributo personalizado: heredar de `ValidationAttribute` y sobrescribir `IsValid`. Ejemplo: `public class PrecioMayorQueCostoAttribute : ValidationAttribute { protected override ValidationResult? IsValid(object? value, ValidationContext ctx) { ... } }`. Luego se usa `[PrecioMayorQueCosto]` en la propiedad del DTO.

**Por que**: La validacion automatica en ASP.NET Core elimina boilerplate (no necesitas validar manualmente en cada endpoint). Los atributos personalizados permiten extender el sistema con reglas de negocio sin salirse del framework. Fuente: docs.microsoft.com sobre Model Validation, y patrones de validacion avanzada en ASP.NET Core.

---

### 5. [Cuestionar] Existe un debate en la comunidad sobre si los atributos personalizados deben contener logica de validacion o si esa logica deberia estar en servicios separados. Defiende la posicion de que los atributos deben ser solo metadata vs la posicion de que deben ser autosuficientes para mantener la encapsulacion.

**Respuesta**: Pro-metadata: los atributos deben ser solo marcadores; la logica de validacion debe estar en validadores separados (FluentValidation, servicios dedicados) para mantener la separacion de responsabilidades, facilitar el testing unitario de la logica y permitir reutilizar la validacion en diferentes contextos (API, UI, batch). Pro-autosuficientes: los atributos con validacion encapsulan la regla cerca del modelo, reduciendo la dispersion de logica de validacion y haciendo que el modelo sea "autovalidable". La posicion pragmatica: usar DataAnnotations para validaciones simples (requerido, rango, longitud) y FluentValidation o servicios dedicados para reglas de negocio complejas que requieren acceso a base de datos o multiples propiedades.
