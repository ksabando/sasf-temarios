---
sidebar_label: "Clase"
---

# Módulo 10 — Proyecto Final + Simulación de Entrevista

## Proyecto Final (70% de la nota)

### Aplicación Legacy: Sistema de Gestión de Biblioteca

Recibirás una aplicación Spring Boot + JPA legacy (intencionalmente mal escrita) que debes refactorizar aplicando **todos los principios de Clean Code**.

### Requisitos Técnicos

| Requisito | Detalle |
|-----------|---------|
| Java | 17+ |
| Spring Boot | 3.2+ |
| Base de datos | H2 (memoria) para desarrollo |
| Tests | JUnit 5 + Mockito |
| Cobertura | > 80% |
| Checkstyle | Sin errores |
| PMD | Sin violaciones mayores |

### Lo que debes aplicar

1. **Nombres Significativos** (M02): todos los identificadores revelan intención
2. **Funciones Pequeñas** (M03): máximo 20 líneas, 1 responsabilidad, sin efectos secundarios
3. **Comentarios Necesarios** (M04): solo comentarios que agregan valor
4. **Formato Consistente** (M04): formateador automático, 120 chars, 4 espacios
5. **Ley de Demeter** (M05): sin train wrecks, sin getter chains
6. **Manejo de Errores** (M06): excepciones de dominio, Optional, sin nulls
7. **Adapters** (M07): puertos para integraciones externas
8. **Tests Limpios** (M08): FIRST, Given-When-Then, una aserción por test
9. **Clases Cohesivas** (M09): SRP, cohesión alta, clases pequeñas

### Rúbrica de Evaluación

| Criterio | Peso | Excelente | Bueno | Suficiente | Insuficiente |
|----------|------|-----------|-------|------------|--------------|
| Nombres | 10% | Revelan intención | 1-2 mejorables | Varios confusos | Sin significado |
| Funciones | 15% | < 20 líneas, 1 resp. | < 30 líneas | > 40 líneas | Múltiples resp. |
| Comentarios | 5% | Solo necesarios | 1-2 ruido | Varios innecesarios | Ruido excesivo |
| Formato | 5% | Consistente | Pequeñas inconsistencias | Notables | Sin formato |
| Errores | 15% | Excepciones, sin nulls | Mayoría correcto | Algunos nulls | Códigos de error |
| Tests | 25% | FIRST, GWT, > 80% | FIRST parcial, > 60% | Frágiles, > 40% | Sin tests |
| Clases | 15% | Pequeñas, SRP, cohesivas | Mayoría cohesivas | 1-2 grandes | Clases Dios |
| Adapters | 10% | Puertos + adapters | Adapters sin puertos | Acoplado | Sin separación |

## Simulación de Entrevista Técnica (30% de la nota)

### Estructura

La simulación consta de dos partes:

#### Parte 1: Ejercicios Prácticos (10 ejercicios, 50% de la entrevista)

| # | Ejercicio | Tiempo |
|---|-----------|--------|
| 1 | Explica qué es código limpio con ejemplos | 3 min |
| 2 | Refactoriza nombres confusos en el código dado | 5 min |
| 3 | Escribe una función limpia para validar dirección | 5 min |
| 4 | Identifica comentarios innecesarios y justifica | 3 min |
| 5 | Explica Ley de Demeter con un ejemplo concreto | 3 min |
| 6 | Refactoriza código que retorna null usando Optional | 5 min |
| 7 | Diseña un adapter para API de clima | 5 min |
| 8 | Escribe un test limpio Given-When-Then | 5 min |
| 9 | Analiza si una clase debe dividirse (SRP) | 3 min |
| 10 | Discute trade-offs de Clean Code en legacy | 3 min |

#### Parte 2: Preguntas Teóricas (50 preguntas, 50% de la entrevista)

- 10 preguntas de **Nombres**
- 10 preguntas de **Funciones**
- 10 preguntas de **Comentarios/Formato**
- 10 preguntas de **Objetos/Errores**
- 10 preguntas de **Clases/TDD**

### Niveles de Seniority

| Nivel | Enfoque |
|-------|---------|
| Junior | Reglas básicas, ejemplos simples |
| Semi-Senior | Refactorización y diseño |
| Senior | Patrones, trade-offs, arquitectura |
| Tech Lead | Estándares de equipo, reviews, métricas |

### Preparación

- Revisa el cuestionario completo del módulo 10 (50 preguntas)
- Practica los 10 ejercicios con código real
- Prepara ejemplos de tu experiencia aplicando Clean Code
- Ten claros los trade-offs: Clean Code no es gratis (requiere tiempo y disciplina)
