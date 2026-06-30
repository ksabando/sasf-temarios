---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

## Ejercicio 3: Servicio de Usuarios Todo-en-Uno
**Solución esperada**:

### Violaciones Identificadas

| Violación | Descripción | Prioridad |
|-----------|-------------|-----------|
| **SRP** | UserService hace: validación, registro, persistencia, email, SMS, logging | ALTA |
| **DIP** | Dependencia directa de FileWriter (logging) y sistema de email simulado | ALTA |
| **Seguridad** | La contraseña se envía en texto plano y se registra en archivo de log | ALTA |
| **Acoplamiento** | Lógica de notificación acoplada al registro de usuario | MEDIA |

### Respuestas

1. **Responsabilidades de UserService:**
   - Validación de datos de entrada (email, password, name)
   - Almacenamiento en memoria (Map<String, User>)
   - Envío de email de bienvenida
   - Logging a archivo
   - Envío de SMS para VIP
   - Eliminación de usuarios
2. **Cambiar email a AWS SES:** Se debe modificar el método `EnviarEmail` dentro de `UserService`. Como es un método privado, no hay forma de cambiarlo sin tocar esta clase.
3. **Cambiar logging a Log4j:** Se debe modificar cada método que escribe en `auditoria.log`. Actualmente está en `register()` y `deleteUser()`.
4. **Refactorización SRP:**
   - `UserValidator` → validación de datos
   - `UserRepository` → persistencia (in-memory, BD, etc.)
   - `EmailService` → envío de emails
   - `NotificationService` → SMS y otras notificaciones
   - `AuditLogger` → registro de auditoría
   - `UserService` → solo orquesta las operaciones

**Posibles mejoras**:
- Implementar **Observer Pattern** para notificaciones: en lugar de que `UserService` llame directamente a `EmailService` y `SMS`, el registro de un usuario dispara un evento `UserRegisteredEvent` y múltiples listeners (EmailListener, SMSListener, AuditListener) reaccionan independientemente.
- Usar **PasswordEncoder** (BCrypt) para nunca almacenar ni loguear contraseñas en texto plano, y configurar el logger para que enmascare campos sensibles automáticamente.
- Migrar de `Map<String, User>` a una interfaz `UserRepository` con implementación en memoria para desarrollo y JPA para producción, aplicando DIP y permitiendo cambiar la estrategia de persistencia sin tocar `UserService`.

---

## Ejercicio 4: Análisis de Código Propio
**Solución esperada**:

### Respuesta Modelo

| Clase | Líneas | Responsabilidades | Violación | Prioridad |
|-------|--------|-------------------|-----------|-----------|
| OrderController.java | 320 | Validación, cálculo descuento, persistencia, generación factura PDF, envío email | SRP, DIP, OCP | ALTA |
| ProcesadorPago.java | 180 | Conexión BD, cálculo impuestos, integración pasarela pago, registro transacciones | SRP, DIP | ALTA |
| ReportUtils.java | 250 | Generación PDF, exportación CSV, gráficos, consultas BD | SRP, ISP | MEDIA |
| EmailHelper.java | 90 | Formateo HTML, envío SMTP, plantillas, adjuntos | SRP | MEDIA |

### Recomendaciones Generales

1. **Divide clases grandes** identificando métodos que podrían vivir en clases separadas.
2. **Inyecta dependencias** en lugar de crear instancias con `new` dentro de constructores.
3. **Usa interfaces** para permitir múltiples implementaciones intercambiables.
4. **Prueba unitariamente** cada responsabilidad por separado.
5. **Aplica SRP** primero: es el más fácil de identificar y el que más impacto tiene.

**Posibles mejoras**:
- Para `OrderController`: extraer la lógica de descuentos a una clase `DiscountService` con patrón Strategy para que los descuentos sean configurables sin modificar el controller.
- Para `ProcesadorPago`: usar una interfaz `PaymentGateway` con implementaciones `StripeGateway`, `MercadoPagoGateway`, etc., inyectadas por constructor, eliminando el acoplamiento directo a una pasarela específica.
- Para `ReportUtils`: segregar en `PdfExporter`, `CsvExporter` y `ChartRenderer` con una interfaz común `ReportExporter`, aplicando ISP y OCP simultáneamente para que nuevos formatos de exportación no requieran modificar utilidades existentes.

