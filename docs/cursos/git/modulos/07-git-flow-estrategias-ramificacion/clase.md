---
sidebar_label: "Clase"
---

# Clase - Módulo 07: Git Flow y Estrategias de Ramificación

## Git Flow (Vincent Driessen, 2010)

Ramas principales:
- `main` — Código en producción.
- `develop` — Integración de características.

Ramas de apoyo:
- `feature/*` — Nuevas funcionalidades (desde `develop`).
- `release/*` — Preparación de lanzamientos (desde `develop`, se fusiona a `main` y `develop`).
- `hotfix/*` — Correcciones urgentes (desde `main`, se fusiona a `main` y `develop`).

Flujo: feature → develop → release → main + tag.

## GitHub Flow (GitHub, 2011)

- Rama `main` siempre desplegable.
- Se crea una rama `feature` desde `main`.
- Se abre un Pull Request para discutir los cambios.
- Tras aprobación y pruebas, se fusiona a `main`.
- Se despliega inmediatamente.

Simplicidad: solo `main` y ramas de feature.

## GitLab Flow

Variante de GitHub Flow con:
- **Environment branches**: `production`, `pre-production`, `staging`.
- **Feature flags**: activar/desactivar funcionalidades sin desplegar.

Ideal para equipos que necesitan múltiples entornos pre-producción.

## Trunk-Based Development

- Desarrollo basado en el tronco (`main` o `trunk`).
- Ramas de vida corta (horas o días).
- Fusiones frecuentes al tronco (varias veces al día).
- Uso intensivo de feature flags.

Pros: menos conflictos, integración continua real.

## Comparativa

| Estrategia | Ramas principales | Complejidad | Ideal para |
|---|---|---|---|
| Git Flow | main, develop | Alta | Proyectos con versiones fijas |
| GitHub Flow | main | Baja | CI/CD continuo |
| GitLab Flow | main + entornos | Media | Equipos con múltiples entornos |
| Trunk-Based | main | Baja | Equipos ágiles con despliegue frecuente |

## Convenciones de nomenclatura

- `feature/issue-42-login`
- `bugfix/issue-15-null-pointer`
- `hotfix/critical-security-patch`
- `release/v2.1.0`

## git flow extension

`git flow init` y `git flow feature start <nombre>` automatizan Git Flow. Se puede hacer manualmente con comandos básicos de Git.
