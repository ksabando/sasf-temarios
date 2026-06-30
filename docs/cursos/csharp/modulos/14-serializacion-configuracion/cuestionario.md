---
private: true
sidebar_class_name: private
sidebar_label: "Cuestionario"
---

# Cuestionario M14 - Serializacion y Configuracion

**Instruccion**: Estas preguntas evaluan si investigaste mas alla del contenido de la clase. No alcanza con lo visto en `clase.md`. Fundamenta tus respuestas con fuentes, autores o ejemplos concretos.

---

### 1. [Investigar] BinaryFormatter fue declarado obsoleto en .NET 5 y lanza excepciones en .NET 8. Explica por que era inseguro, que alternativas existen segun el caso de uso (MessagePack, Protocol Buffers, JSON, XML), y como migrar datos existentes serializados con BinaryFormatter.

**Respuesta**: BinaryFormatter usa `SerializationBinder` y `SerializationCallbacks` que permiten ejecutar codigo arbitrario durante la deserializacion (Type coercion, delegate invocation), haciendolo vulnerable a ataques RCE (deserialization attacks). Microsoft recomienda: (1) MessagePack para rendimiento binario, (2) Protobuf para interoperabilidad y contrato estricto, (3) JSON (System.Text.Json) para datos interoperables, (4) XML para compatibilidad con sistemas legacy. Migrar datos existentes requiere: (1) deserializar con BinaryFormatter en una version anterior de .NET que aun lo soporte, (2) convertir a formato moderno, (3) almacenar en el nuevo formato.

**Por que**: La vulnerabilidad de BinaryFormatter fue reportada extensamente por investigadores de seguridad (Oren Eini, Jonathan Birch). Microsoft anuncio su deprecacion en .NET 5 y su eliminacion funcional en .NET 8. La comunidad recomienda desde 2018 evitar BinaryFormatter. Fuente: "BinaryFormatter security vulnerability" - docs.microsoft.com, "Defeating BinaryFormatter" - Alvaro Munoz.

---

### 2. [Investigar] Los *source generators* de `System.Text.Json` eliminan la reflexion en tiempo de ejecucion, mejorando el rendimiento y reduciendo el tamano del assembly. Explica como se usan, que limitaciones tienen (como manejar tipos polimorficos o convertidores personalizados) y si realmente son siempre mas rapidos.

**Respuesta**: Los source generators analizan los tipos en compilacion y generan codigo de serializacion/deserializacion directo, evitando reflexion en runtime. Se usan declarando un `JsonSerializerContext` parcial con `[JsonSerializable]`. Limitaciones: (1) requieren conocer los tipos en compilacion (no funcionan para tipos dinamicos/desconocidos), (2) el polimorfismo `[JsonDerivedType]` es soportado pero debe declararse explicitamente, (3) convertidores personalizados se pueden usar pero algunos escenarios complejos (serializacion condicional) requieren reflexion. No siempre son mas rapidos: para objetos simples, la diferencia es minima (< 10%). Para colecciones grandes y tipos complejos, la mejora puede ser 2-5x.

**Por que**: Los source generators de JSON son parte del esfuerzo de .NET para reducir allocaciones y mejorar AOT (ahead-of-time compilation). Son obligatorios para aplicaciones Native AOT (como funciones AWS Lambda o Azure Functions con .NET 8+) porque la reflexion no esta disponible. Fuente: "How to use source generators with System.Text.Json" - docs.microsoft.com, y "Native AOT in .NET" - docs.

---

### 3. [Investigar] El patron Options (`IOptions<T>`, `IOptionsSnapshot<T>`, `IOptionsMonitor<T>`) tiene tres interfaces con diferentes ciclos de vida. Explica la diferencia entre ellas, cuando usar cada una, y como `IOptionsSnapshot` recarga la configuracion en aplicaciones web.

**Respuesta**: `IOptions<T>`: singleton, lee la configuracion una vez al inicio y nunca la recarga. `IOptionsSnapshot<T>`: scoped (por request), lee la configuracion al inicio de cada request, permitiendo recarga en caliente si el archivo cambio. `IOptionsMonitor<T>`: singleton, pero notifica cambios via `OnChange` y expone `CurrentValue` que siempre tiene el ultimo valor. `IOptionsSnapshot` usa scoped lifecycle, lo que permite que cada request web tenga la configuracion actualizada sin reiniciar la app. En aplicaciones de consola, `IOptionsSnapshot` no tiene efecto porque no hay scope; usar `IOptionsMonitor`.

**Por que**: El team de ASP.NET Core diseno tres interfaces porque diferentes escenarios requieren diferentes ciclos de vida de configuracion. `IOptionsSnapshot` es esencial en entornos cloud donde los archivos de configuracion pueden cambiar sin reinicio (Kubernetes ConfigMaps, Azure App Configuration). Fuente: "Options Pattern in ASP.NET Core" - docs.microsoft.com, y patrones de configuracion dinamica.

---

### 4. [Conectar] La configuracion por ambiente (Development, Staging, Production) es fundamental. Explica como se determina el ambiente actual en ASP.NET Core (`ASPNETCORE_ENVIRONMENT`, `DOTNET_ENVIRONMENT`), como se usan los environment-specific files, y como manejar secretos en desarrollo (User Secrets) vs produccion (Azure Key Vault, variables de entorno).

**Respuesta**: El ambiente se determina por la variable de entorno `ASPNETCORE_ENVIRONMENT` (o `DOTNET_ENVIRONMENT`). Los archivos se cargan en orden: `appsettings.json` (base), `appsettings.{env}.json` (sobrescribe), y las variables de entorno (final). En desarrollo, `dotnet user-secrets` almacena secretos en perfil de usuario (no en el repositorio). En produccion, los secretos vienen de: (1) Azure Key Vault via `AddAzureKeyVault()`, (2) variables de entorno, (3) AWS Secrets Manager, (4) HashiCorp Vault. User Secrets solo funciona en Development y esta asociado al proyecto por `UserSecretsId`.

**Por que**: El manejo de secretos es una de las practicas de seguridad mas importantes. La guia de Microsoft es clara: nunca hardcodear secretos, usar User Secrets en desarrollo y un vault seguro en produccion. Fuente: "Safe storage of secrets" - docs.microsoft.com, y "Configuration in ASP.NET Core" - docs.

---

### 5. [Cuestionar] La serializacion JSON con `JsonSerializerOptions.DefaultIgnoreCondition = WhenWritingNull` puede ocultar errores (un valor null que no deberia serlo). Defiende si es mejor optar por no ignorar nulls (exigiendo que los datos sean completos) o ignorarlos (evitando errores en el consumidor).

**Respuesta**: Ignorar nulls (WhenWritingNull) es util para: (1) APIs publicas donde los campos opcionales no deben enviarse si no tienen valor, (2) reducir el tamano del JSON en respuestas, (3) evolucionar contratos sin romper consumidores (agregar campos nuevos que no existen en datos viejos). No ignorar nulls es mejor para: (1) detectar errores temprano (si un campo debia tener valor pero esta null, quieres saberlo), (2) contratos estrictos (gRPC, OpenAPI/Swagger), (3) consumidores que esperan el campo siempre presente. La posicion pragmatica: ignorar nulls en APIs publicas (frontend, externos), no ignorar en comunicacion entre microservicios propios donde quieres detectar errores.
