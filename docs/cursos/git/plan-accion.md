---
sidebar_position: 1
private: true
sidebar_class_name: private
sidebar_label: "Plan de Acción"
---
# Plan de Acción - Curso Git 2026

**Duración:** 5 semanas | **25 módulos** | **~4-5 horas diarias de dedicación**

---

## Antes de Empezar (Pre-work)

- [ ] Tener Git instalado (`git --version`)
- [ ] Crear cuenta en GitHub (https://github.com)
- [ ] Configurar SSH key en GitHub (`ssh-keygen` + `cat ~/.ssh/id_ed25519.pub`)
- [ ] Tener VS Code instalado + extensiones: GitLens, Git Graph, Git History
- [ ] Instalar Git Bash (Windows) o tener terminal Unix (Mac/Linux)
- [ ] Instalar herramienta visual: GitKraken / Sourcetree (opcional)
- [ ] Configurar: `git config --global user.name` y `user.email`
- [ ] Tener acceso a los archivos en `Modulos/`
- [ ] Leer `Modulos/Temario-Git-2026.md` completo

---

## Metodología de Estudio por Módulo

Cada módulo sigue este flujo de trabajo. Respetar el orden maximiza el aprendizaje:

```
1. DIA POSITIVA   → Abrir diap.pptx, ver las 10 slides (15 min)
2. CLASE TEÓRICA   → Leer clase.md completo, tomar notas (30 min)
3. EJERCICIOS      → Resolver ejercicio.md SIN ver la respuesta (60-90 min)
4. AUTO-CORRECCIÓN → Comparar con respuesta.md, corregir errores (30 min)
5. CUESTIONARIO    → Responder las 10 preguntas de cuestionario.md (20 min)
6. REPASO          → Marcar dudas para preguntar al instructor (10 min)
```

> ⚠️ **Regla de oro:** No mirar `respuesta.md` hasta haber intentado todos los ejercicios.

---

## Semana 1 - Fundamentos de Git

**Objetivo:** Entender control de versiones, instalar Git, dominar el ciclo de vida de archivos, staging, commits y visualización del historial.

| Día | Módulo | Tema | Horas est. | Checklist |
|-----|--------|------|------------|-----------|
| **Lun** | M01 | Introducción al Control de Versiones y Git | 3h | [ ] `git --version` OK [ ] Conceptos claros [ ] Ej. resueltos |
| **Mar** | M02 | Instalación y Configuración Inicial | 3h | [ ] Git instalado [ ] Config global lista [ ] SSH key generada |
| **Mié** | M03 | Comandos Fundamentales | 4h | [ ] init/clone OK [ ] add/commit OK [ ] status/log OK |
| **Jue** | M04 | Staging, Commit y Ciclo de Vida de Archivos | 4h | [ ] .gitignore OK [ ] staging interactivo [ ] amend OK |
| **Vie** | M05 | Visualización y Seguimiento | 4h | [ ] log avanzado [ ] diff/blame [ ] show/shortlog |

**Checkpoint semana 1:** Repositorio local con historial de commits, .gitignore, dominio de log avanzado y diff.

---

## Semana 2 - Ramas y Colaboración

**Objetivo:** Dominar ramas, merges, trabajo remoto, pull requests y resolución de conflictos.

| Día | Módulo | Tema | Horas est. | Checklist |
|-----|--------|------|------------|-----------|
| **Lun** | M06 | Ramas (Branches) y Merges | 4h | [ ] branch/checkout OK [ ] merge fast-forward [ ] merge 3-way |
| **Mar** | M07 | Git Flow y Estrategias de Ramificación | 3h | [ ] Git Flow entendido [ ] GitHub Flow [ ] Trunk-Based |
| **Mié** | M08 | Repositorios Remotos | 4h | [ ] remote add/push [ ] pull/fetch OK [ ] upstream config |
| **Jue** | M09 | Pull Requests y Code Review | 4h | [ ] PR creada [ ] revisada [ ] mergeada |
| **Vie** | M10 | Resolución de Conflictos | 4h | [ ] conflicto forzado [ ] resuelto manualmente [ ] mergetool |

**Checkpoint semana 2:** PR real en GitHub con revisión, merge exitoso y conflicto resuelto.

---

## Semana 3 - Manipulación Avanzada

**Objetivo:** Rebasing interactivo, stash, deshacer cambios, cherry-pick, bisect, submódulos.

| Día | Módulo | Tema | Horas est. | Checklist |
|-----|--------|------|------------|-----------|
| **Lun** | M11 | Rebase Interactivo | 4h | [ ] rebase -i OK [ ] squash [ ] reword/drop |
| **Mar** | M12 | Stash y Trabajo Temporal | 3h | [ ] stash push/pop [ ] stash parcial [ ] stash branch |
| **Mié** | M13 | Deshacer Cambios | 4h | [ ] restore [ ] reset soft/hard [ ] revert [ ] reflog |
| **Jue** | M14 | Cherry-pick y Bisect | 4h | [ ] cherry-pick OK [ ] bisect find bug [ ] blame |
| **Vie** | M15 | Submódulos y Subtrees | 4h | [ ] submodule add [ ] submodule update [ ] subtree |

**Checkpoint semana 3:** Historial reescrito con rebase interactivo, bug encontrado con bisect, submódulo funcionando.

---

## Semana 4 - Git en Equipos y DevOps

**Objetivo:** Tags, hooks, worktrees, Git LFS, automatización y flujos de equipo.

| Día | Módulo | Tema | Horas est. | Checklist |
|-----|--------|------|------------|-----------|
| **Lun** | M16 | Tags y Releases | 3h | [ ] tag anotado [ ] signed tag [ ] GitHub Release |
| **Mar** | M17 | Hooks y Automatización | 4h | [ ] pre-commit hook [ ] pre-push [ ] Husky |
| **Mié** | M18 | Git Hooks Servidor y CI/CD | 4h | [ ] pre-receive [ ] post-receive [ ] deploy con git |
| **Jue** | M19 | Git Worktrees | 3h | [ ] worktree add [ ] worktree list [ ] múltiples ramas |
| **Vie** | M20 | Git LFS (Large File Storage) | 3h | [ ] LFS instalado [ ] track archivos [ ] push/pull LFS |

**Checkpoint semana 4:** Hook funcionando, release con tag, worktree en uso, LFS tracking archivos grandes.

---

## Semana 5 - Integración, Seguridad y Experto

**Objetivo:** Estrategias avanzadas, CI/CD, seguridad, buenas prácticas y proyecto integrador.

| Día | Módulo | Tema | Horas est. | Checklist |
|-----|--------|------|------------|-----------|
| **Lun** | M21 | Estrategias Avanzadas de Merge | 4h | [ ] merge strategies [ ] ours/theirs [ ] merge ort |
| **Mar** | M22 | Git para CI/CD | 4h | [ ] GitHub Actions [ ] GitLab CI [ ] versionado auto |
| **Mié** | M23 | Seguridad y Firmas | 4h | [ ] GPG signing [ ] SSH keys [ ] secret scanning |
| **Jue** | M24 | Buenas Prácticas y Flujos | 3h | [ ] Conventional Commits [ ] .gitattributes [ ] git maintenance |
| **Vie** | M25 | Proyecto Final + Entrevista | 6h | [ ] Proyecto integrador [ ] 60 preguntas [ ] 10 ejercicios |

**Checkpoint semana 5:** Pipeline CI/CD funcionando, commits firmados con GPG, proyecto final completo.

---

## Rúbrica de Auto-Evaluación

Al final de cada módulo, calificarse de 0 a 5:

| Puntaje | Significado | Acción |
|---------|-------------|--------|
| 5 | Puedo explicarlo y aplicarlo sin ayuda | Avanzar |
| 4 | Lo entiendo pero necesito consultar la guía | Avanzar, repasar luego |
| 3 | Entiendo el concepto pero fallo en implementación | Rehacer ejercicios |
| 2 | No entiendo partes clave | Volver a clase.md + diapositivas |
| 1 | No entiendo casi nada | Pedir ayuda al instructor |
| 0 | No lo vi | Hacer el módulo |

---

## Reglas de Oro del Curso

1. **Nunca copies y pegues.** Escribe cada comando Git manualmente.
2. **Lee el error completo.** Git te dice exactamente qué falló y cómo solucionarlo.
3. **Usa `git status` constantemente.** Es tu brújula en cualquier repositorio.
4. **Primero entiende el concepto, después ejecuta.** El 50% del trabajo es entender qué hace cada comando.
5. **No te saltes ejercicios.** Cada uno construye sobre el anterior.
6. **Usa `git reflog` si te pierdes.** Casi todo en Git se puede recuperar.
7. **Pregunta.** Si algo no te cierra después de 15 minutos, pregunta.

---

## Recursos

| Recurso | Enlace |
|---------|--------|
| Temario completo | `Modulos/Temario-Git-2026.md` |
| Ejercicios y soluciones | `Modulos/` (25 carpetas) |
| Libro base sugerido | `Libros/` - *Pro Git* de Scott Chacon y Ben Straub |
| Git Docs | https://git-scm.com/docs |
| Git Book (Pro Git) | https://git-scm.com/book/es/v2 |
| GitHub Docs | https://docs.github.com |
| GitLab Docs | https://docs.gitlab.com |
| Conventional Commits | https://www.conventionalcommits.org |
| Git Flow | https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow |
