---
sidebar_position: 2
private: true
sidebar_class_name: private
sidebar_label: "Orden Recomendado"
---

# Orden recomendado de cursos

## Cronograma sugerido (17 semanas)

```
Sem 1-5:   Git         ████████████████████████
Sem 1-2:   Diseño APIs ████████
Sem 3-4:               CleanCode  ████████
Sem 5-9:                          Spring ████████████████████████
                                  React  ████████████████████████
Sem 10-11:                                    SOLID   ████████
Sem 12-14:                                           Patrones ████████████
Sem 15-17:                                                       Arquitectura ████████████
                                  Docker  █████████████████████████████████████ (paralelo desde sem 5)
```

## Fundamentos

| # | Curso | Semanas | Prerrequisito |
|---|-------|:------:|---------------|
| 1 | **Git** | 1-5 | Ninguno. Herramienta transversal a todos los cursos. |
| 1 | **Diseño de APIs** | 1-2 | Ninguno. Conceptos REST/HTTP son teóricos. Paralelo con Git. |
| 2 | **CleanCode** | 3-4 | Java + POO. Principios antes de proyectos grandes. |

## Backend + Frontend (paralelo)

| # | Curso | Semanas | Prerrequisito |
|---|-------|:------:|---------------|
| 3 | **Spring Boot** | 5-9 | Java + POO. React lo integra desde el módulo 7. |
| 3 | **React** | 5-9 | TypeScript básico. Consume la API de Spring. Comienzan juntos. |

## Especialización

| # | Curso | Semanas | Prerrequisito |
|---|-------|:------:|---------------|
| 4 | **SOLID** | 10-11 | Spring Boot. El módulo 7 aplica SOLID en Spring. |
| 5 | **Patrones de Diseño** | 12-14 | SOLID. El módulo 1 revisa SOLID. M11 en Spring, M12 en React. |
| 6 | **Arquitectura de Software** | 15-17 | Spring + React + Kafka. Temas avanzados de arquitectura. |

## Contenedores (paralelo)

| # | Curso | Semanas | Prerrequisito |
|---|-------|:------:|---------------|
| * | **Docker** | 5-17 | Puede comenzar cuando empiezan Spring/React. Se extiende hasta el final. |

## Notas

- **Oracle PL/SQL** se omite en este orden (puede intercalarse si se requiere base de datos relacional).
- **Git** es el único curso que es prerrequisito transversal. Debe hacerse primero.
- **CleanCode → SOLID → Patrones** forman una progresión natural de calidad de código.
- **Spring Boot + React** van en paralelo porque el proyecto TaskFlow (React) consume la API construida en Spring.
- **Docker** puede solaparse desde la semana 5, usándose para todos los proyectos posteriores.
