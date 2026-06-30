---
sidebar_label: "Ejercicio"
---

## Ejercicio 2: SRP — Capas de Servicio

Crea capas de servicio:
- `BookService` con lógica de negocio de libros
- `MemberService` con lógica de miembros
- `LoanService` con lógica de préstamos, multas y devoluciones
- `ReportService` con generación de reportes

Los servicios deben inyectar repositorios, no JDBC directamente.

---

## Ejercicio 3: OCP — Estrategias de Multas

El cálculo de multas actual es fijo ($1000/día). Aplica OCP:
- Interfaz `FineCalculator` con `double calculate(Loan loan)`
- Implementaciones: `StandardFineCalculator`, `ReducedFineCalculator` (para estudiantes),
  `NoFineCalculator` (para empleados)
- `LoanService` debe usar la estrategia correcta según el tipo de miembro

---

## Ejercicio 4: OCP — Límites de Préstamo Extensibles

El límite actual es 5 libros. Aplica OCP para que sea extensible:
- Interfaz `LoanLimitPolicy` con `boolean canBorrow(Member member)`
- Implementaciones: `StandardLoanLimit` (5), `PremiumLoanLimit` (10), `StudentLoanLimit` (3)
- Configurables por tipo de miembro sin modificar LoanService

---

## Ejercicio 5: LSP — Jerarquía de Miembros

Actualmente los miembros son un Map<String, Object>. Diseña:
- Clase base `Member` con atributos comunes (id, name, email, phone)
- `StudentMember`, `PremiumMember`, `RegularMember`
- Cada tipo debe ser sustituible por `Member` sin `instanceof`
- Usa composición para comportamientos variables (FineCalculator, LoanLimitPolicy)

---

## Ejercicio 6: ISP — Interfaces Segregadas

Crea interfaces pequeñas en lugar de monolitos:
- `BookReader`, `BookWriter` en lugar de `BookRepository` gigante
- `LoanTaker`, `LoanReturner` en lugar de `LoanService` monolítico
- `ReportGenerator` separado de consultas de datos

---

## Ejercicio 7: ISP en Repositorios

Divide los repositorios de Spring Data:
- `BookRepository extends CrudRepository<Book, Long>` (solo CRUD básico)
- Si necesitas búsquedas, `extends PagingAndSortingRepository`
- No uses `JpaRepository` si solo necesitas CRUD

---

## Ejercicio 8: DIP — Inyección de Dependencias

Elimina todas las dependencias directas a JdbcTemplate y SQL embebido:
- Crea interfaces `BookRepository`, `MemberRepository`, `LoanRepository`
- Implementa `JdbcBookRepository`, `JdbcMemberRepository`, `JdbcLoanRepository`
- Los servicios dependen de las interfaces, no de JdbcTemplate
- Usa constructor injection

---

## Ejercicio 9: DIP — Servicios desde Configuración

Crea una clase `@Configuration` que construya los servicios con sus dependencias:
- Los servicios no deben instanciar nada directamente
- Todo debe ser inyectado desde afuera
- Debe ser fácil cambiar implementaciones (ej: de Jdbc a JPA)

---

## Ejercicio 10: Seguridad + Pruebas

1. **Seguridad:** Corrige TODAS las SQL Injections usando parámetros con `?`
2. **DTOs:** Crea DTOs para requests y responses en lugar de Map<String, Object>
3. **Validación:** Usa `@Valid` y Bean Validation en los DTOs
4. **Pruebas:** Escribe pruebas unitarias para cada servicio (mínimo 2 por servicio)
   - Usa Mockito para mockear repositorios
   - Cobertura mínima: 80%

---

## Criterios de Evaluación

| Criterio | Puntos |
|----------|--------|
| SRP: controladores y servicios separados | 1 pt |
| OCP: estrategias de multas y límites extensibles | 2 pts |
| LSP: jerarquía de miembros correcta | 2 pts |
| ISP: interfaces segregadas | 1 pt |
| DIP: inyección de dependencias | 2 pts |
| Seguridad: SQL Injection corregida | 1 pt |
| Pruebas: cobertura > 80% | 1 pt |
| **Total** | **10 pts** |
