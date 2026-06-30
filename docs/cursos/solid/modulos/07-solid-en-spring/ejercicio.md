---
sidebar_label: "Ejercicio"
---

## Ejercicio 1: Catálogo de Violaciones

Identifica y cataloga todas las violaciones SOLID en el código anterior.
Usa esta tabla:

| # | Archivo/Línea | Descripción | Principio Violado | Severidad |
|---|---------------|-------------|-------------------|-----------|
| 1 | ProductController | Validación en controller | SRP | ALTA |
| ... | ... | ... | ... | ... |

Encuentra al menos 15 violaciones.

---

## Ejercicio 2: Refactorizar SRP

Refactoriza separando responsabilidades:

1. Crea `ProductService` con la lógica de negocio
2. Crea `ProductRepository` con operaciones de BD
3. Crea `NotificationService` para notificaciones
4. Crea `AuditService` para logging
5. El controller solo debe manejar HTTP y delegar

---

## Ejercicio 3: Refactorizar OCP + DIP

Aplica OCP y DIP:

1. Crea interfaz `TaxCalculator` para cálculo de impuestos por categoría
2. Implementa `ElectronicsTaxCalculator`, `FoodTaxCalculator`, `ClothingTaxCalculator`, `BooksTaxCalculator`
3. Usa `@Component` y `List<TaxCalculator>` para inyectar todas las estrategias
4. Crea interfaz `ProductRepository` y su implementación `JdbcProductRepository`
5. El servicio debe depender de interfaces, no de implementaciones

---

## Ejercicio 4: Refactorizar LSP + ISP + Seguridad

Aplica LSP, ISP y corrige problemas de seguridad:

1. **LSP:** Asegura que todas las implementaciones de `TaxCalculator` sean intercambiables.
   Cada una debe calcular el impuesto correcto sin lanzar excepciones.
2. **ISP:** Crea interfaces pequeñas (`ProductReader`, `ProductWriter`, `ReportGenerator`,
   `PromotionSender`) en lugar de un solo controller monolítico.
3. **Seguridad:** Corrige la vulnerabilidad de SQL Injection en `getProduct()` y `sendPromotions()`.
   Usa `PreparedStatement` o parámetros de `JdbcTemplate`.
4. Separa `CategoryController` siguiendo los mismos principios.

---

## Criterios de Evaluación

| Criterio | Puntos |
|----------|--------|
| Catálogo de violaciones (15+ encontradas) | 2 pts |
| Refactorización SRP (capas separadas) | 2 pts |
| Refactorización OCP + DIP (interfaces + estrategias) | 2 pts |
| Refactorización LSP + ISP (interfaces segregadas, subtipos sustituibles) | 2 pts |
| Corrección de SQL Injection y mala seguridad | 1 pt |
| Código compila y sigue principios SOLID | 1 pt |
| **Total** | **10 pts** |
