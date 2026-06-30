---
sidebar_position: 2
sidebar_label: "Temario"
---
# Temario Git 2026
### Basado en: *Pro Git, 2nd Edition* - Scott Chacon y Ben Straub

---

## Configuración del Entorno

### Instalación de Git

```bash
# Windows
# Descargar desde https://git-scm.com/download/win
# Incluye Git Bash, GUI y credential manager

# macOS
brew install git

# Linux (Ubuntu/Debian)
sudo apt update
sudo apt install git -y
git --version
```

### Configuración Inicial

```bash
# Identidad
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"

# Editor
git config --global core.editor "code --wait"

# Saltos de línea (Windows)
git config --global core.autocrlf true

# macOS/Linux
git config --global core.autocrlf input

# Alias útiles
git config --global alias.lg "log --oneline --graph --all --decorate"
git config --global alias.s "status -sb"
git config --global alias.df "diff --staged"

# Ver configuración
git config --list
```

### Herramientas Recomendadas

| Herramienta | Uso |
|-------------|-----|
| **VS Code + GitLens** | Visualización de blame, history, branches en IDE |
| **Git Graph (VS Code)** | Gráfico interactivo de ramas |
| **GitKraken / Sourcetree** | Clientes visuales Git |
| **GitHub CLI (`gh`)** | Gestionar PRs, issues, releases desde terminal |
| **Husky** | Gestión de hooks moderna |
| **commitlint** | Validar mensajes de commit con Conventional Commits |
| **git-bisect** | Depuración binaria de bugs |
| **git-filter-repo** | Reescribir historial masivo |

---

## Estructura de cada Módulo

Cada módulo tiene su carpeta en `Modulos/` con 5 archivos:

| Archivo | Propósito |
|---------|-----------|
| `clase.md` | Lección teórica con ejemplos prácticos |
| `ejercicio.md` | Enunciados de ejercicios prácticos (4-6 por módulo) |
| `respuesta.md` | Soluciones completas con comandos comprobables |
| `diap.pptx` | Diapositivas PowerPoint (8-10 slides) para dictar la clase |
| `cuestionario.md` | 10 preguntas de nivel medio con respuestas |

---

## SEMANA 1 - Fundamentos de Git

> **Objetivo:** Entender el control de versiones, instalar Git, dominar el ciclo de vida de archivos, staging, commits y visualización del historial.

---

### Módulo 01 - Introducción al Control de Versiones y Git
📁 `01-Introduccion-Control-Versiones/`

- ¿Qué es el control de versiones? (local, centralizado, distribuido)
- Historia: BitKeeper, Git (Linus Torvalds 2005), GitHub, GitLab
- Diferencia entre Git y otros VCS (SVN, TFS, Mercurial)
- Arquitectura distribuida de Git
- Los tres estados: working directory, staging area, repository
- SHA-1 hashes y objetos fundamentales (blob, tree, commit, tag)
- Flujo de trabajo básico: init → add → commit
- Integridad: Git checksumming con SHA-1
- Ventajas de Git: velocidad, branching, offline, seguro
- Ecosistema: GitHub, GitLab, Bitbucket

---

### Módulo 02 - Instalación y Configuración Inicial
📁 `02-Instalacion-Configuracion/`

- Instalación en Windows (Git Bash, Git GUI)
- Instalación en macOS (Homebrew, Xcode CLI)
- Instalación en Linux (apt, yum, dnf, pacman)
- `git --version` y `git config --list`
- Configuración global: user.name, user.email, core.editor
- Configuración por repositorio: `git config --local`
- Configuración del sistema: `git config --system`
- `core.autocrlf`: manejo de saltos de línea
- Alias personalizados: `git config --global alias.*`
- SSH keys: generación, configuración en GitHub/GitLab

---

### Módulo 03 - Comandos Fundamentales
📁 `03-Comandos-Fundamentales/`

- `git init` - inicializar un repositorio
- `git clone` - clonar un repositorio existente
- `git status` - ver el estado del working directory
- `git add` - agregar archivos al staging area
- `git commit` - confirmar cambios en el repositorio
- `git log` - ver el historial de commits
- `git diff` - diferencias entre working directory, staging y HEAD
- `git rm` - eliminar archivos del repositorio
- `git mv` - mover o renombrar archivos
- Flags importantes: `-m`, `-a`, `--amend`, `--stat`

---

### Módulo 04 - Staging, Commit y Ciclo de Vida de Archivos
📁 `04-Staging-Commit-Ciclo-Vida/`

- Ciclo de vida de archivos: untracked, staged, modified, unmodified
- Staging interactivo: `git add -p`, `git add -i`
- `git commit --amend` - modificar el último commit
- `.gitignore`: patrones para ignorar archivos
- `.gitkeep`: mantener directorios vacíos
- `git commit -v` - commit con diff en el mensaje
- Buenas prácticas de mensajes de commit
- `git shortlog` - resumen de commits por autor
- `git count-objects` - estadísticas del repositorio
- `git verify-pack` - examinar objetos empaquetados

---

### Módulo 05 - Visualización y Seguimiento
📁 `05-Visualizacion-Seguimiento/`

- `git log --oneline`, `--graph`, `--decorate`, `--all`
- `git log --since`, `--until`, `--author`, `--grep`
- `git log -S` (pickaxe) - buscar por contenido
- `git show` - mostrar detalles de un objeto
- `git blame` - quién modificó cada línea
- `git describe` - describir un commit con el tag más cercano
- `git shortlog -sn` - contribuciones por autor
- `git log --format=format:"%h %s"` - formato personalizado
- `git reflog show` - historial de referencias locales
- `git diff HEAD~3 HEAD` - diferencias entre rangos

---

## SEMANA 2 - Ramas y Colaboración

> **Objetivo:** Dominar ramas, merges, trabajo remoto, pull requests y resolución de conflictos.

---

### Módulo 06 - Ramas (Branches) y Merges
📁 `06-Ramas-Branches-Merges/`

- ¿Qué es una rama? - puntero a un commit
- `git branch` - crear, listar, renombrar, eliminar ramas
- `git checkout` y `git switch` - cambiar de rama
- Merge fast-forward vs merge 3-way (recursive)
- `git merge` - fusionar ramas
- `git branch -d` vs `-D` - eliminar ramas
- Ramas remotas: `origin/main`, `origin/feature`
- `git branch -a` - listar todas las ramas
- `git branch -vv` - ramas con tracking
- `git merge --no-ff` - forzar merge commit

---

### Módulo 07 - Git Flow y Estrategias de Ramificación
📁 `07-Git-Flow-Estrategias-Ramificacion/`

- Git Flow: main, develop, feature, release, hotfix
- GitHub Flow: main → feature branch → PR → merge
- GitLab Flow: environment branches, feature flags
- Trunk-Based Development: ramas cortas, merge frecuente
- Release branches: preparación de versiones
- Hotfix branches: corrección urgente desde main
- Ventajas y desventajas de cada estrategia
- Convención de nombres de ramas
- `git flow` extension vs manual
- Cuándo usar cada flujo según el equipo

---

### Módulo 08 - Repositorios Remotos
📁 `08-Repositorios-Remotos/`

- `git remote add origin <url>` - conectar repositorio remoto
- `git push` - enviar commits al remoto
- `git pull` - traer y fusionar cambios
- `git fetch` - traer cambios sin fusionar
- `git remote -v` - ver remotos configurados
- `git remote show origin` - información detallada
- `git push -u origin main` - establecer upstream
- Protocolos: HTTPS, SSH, Git Protocol
- `git push --force` vs `--force-with-lease`
- `git remote prune origin` - limpiar ramas remotas huérfanas

---

### Módulo 09 - Pull Requests y Code Review
📁 `09-Pull-Requests-Code-Review/`

- ¿Qué es un Pull Request (PR)?
- Flujo completo: fork → clone → branch → commit → push → PR
- Revisión de código: comentarios, aprobaciones, cambios solicitados
- Draft PRs: trabajo en progreso
- `gh pr create` - crear PR desde terminal
- `gh pr review` - revisar PR desde terminal
- GitHub Actions en PRs: checks automáticos
- Merge strategies en PR: merge commit, squash, rebase
- Protección de ramas: `main` protegida, requerir PRs
- Buenas prácticas de code review

---

### Módulo 10 - Resolución de Conflictos
📁 `10-Resolucion-Conflictos/`

- ¿Qué causa un conflicto? líneas modificadas concurrentemente
- Marcadores de conflicto: `<<<<<<<`, `=======`, `>>>>>>>`
- Resolver conflictos manualmente en el editor
- `git mergetool` - herramientas visuales (vimdiff, VS Code, kdiff3)
- `git merge --abort` - cancelar merge conflictivo
- Estrategias de merge: `ours`, `theirs`, `recursive`
- `git checkout --ours` / `--theirs` en conflicto
- `git rerere` - reutilizar resolución grabada
- Conflictos en rebase: `git rebase --continue`, `--skip`, `--abort`
- Prevenir conflictos: comunicación, commits pequeños, rebase frecuente

---

## SEMANA 3 - Manipulación Avanzada

> **Objetivo:** Rebasing interactivo, stash, deshacer cambios, cherry-pick, bisect, submódulos y subtrees.

---

### Módulo 11 - Rebase Interactivo
📁 `11-Rebase-Interactivo/`

- `git rebase` vs `git merge` - diferencias fundamentales
- `git rebase -i HEAD~N` - reescribir los últimos N commits
- Operaciones: pick, reword, edit, squash, fixup, drop
- `git rebase --continue`, `--skip`, `--abort`
- Squash: fusionar múltiples commits en uno
- Fixup: fusionar sin editar mensaje
- Reordenar commits: mover líneas en el editor
- Reword: cambiar mensaje de commit
- Editar: modificar contenido de un commit específico
- `git rebase --onto` - mover ramas a nuevas bases

---

### Módulo 12 - Stash y Trabajo Temporal
📁 `12-Stash-Trabajo-Temporal/`

- `git stash push` - guardar cambios temporalmente
- `git stash pop` - recuperar y eliminar stash
- `git stash apply` - recuperar sin eliminar
- `git stash list` - listar stashes
- `git stash drop` - eliminar stash específico
- `git stash clear` - eliminar todos los stashes
- Stash parcial: `git stash -p` (solo ciertos cambios)
- `git stash branch <nombre>` - crear rama desde stash
- Stash de archivos no trackeados: `git stash -u`
- `git stash show -p` - ver diff del stash

---

### Módulo 13 - Deshacer Cambios
📁 `13-Deshacer-Cambios/`

- `git restore` - descartar cambios en working directory
- `git restore --staged` - unstaging archivos
- `git reset --soft` - mover HEAD, mantener cambios en staging
- `git reset --mixed` (default) - mover HEAD, unstaging
- `git reset --hard` - mover HEAD, descartar todo
- `git revert` - crear commit que deshace cambios
- `git checkout -- <file>` - descartar cambios (legacy)
- `git clean -fd` - eliminar archivos no trackeados
- `git reflog` - el diario de operaciones locales
- Recuperación con reflog: `git reset --hard HEAD@{N}`

---

### Módulo 14 - Cherry-pick y Bisect
📁 `14-Cherry-pick-Bisect/`

- `git cherry-pick <commit>` - aplicar commit específico
- Cherry-pick múltiple: `git cherry-pick A..B`
- Cherry-pick con conflicto: `--continue`, `--abort`
- `git bisect start` - iniciar búsqueda binaria
- `git bisect bad` - marcar commit como malo
- `git bisect good` - marcar commit como bueno
- Automatizar bisect: `git bisect run <script>`
- `git log -S <string>` - buscar dónde se introdujo un cambio
- `git blame` avanzado: ignorar whitespace, revisiones
- Casos prácticos: encontrar bugs, revertir features específicas

---

### Módulo 15 - Submódulos y Subtrees
📁 `15-Submodulos-Subtrees/`

- ¿Qué son los submódulos? repositorios dentro de repositorios
- `git submodule add <url>` - agregar submódulo
- `git submodule init` y `git submodule update`
- `git submodule update --remote` - actualizar al último commit
- `git clone --recurse-submodules` - clonar con submódulos
- `git submodule foreach` - ejecutar comando en todos
- Subtrees: `git subtree add` - integrar sin referencias externas
- Subtree pull y push: `git subtree pull`, `git subtree push`
- Submódulos vs subtrees: ventajas y desventajas
- Alternativas modernas: monorepos, workspaces package managers

---

## SEMANA 4 - Git en Equipos y DevOps

> **Objetivo:** Tags, hooks, worktrees, Git LFS, automatización y flujos de equipo avanzados.

---

### Módulo 16 - Tags y Releases
📁 `16-Tags-Releases/`

- `git tag` - listar tags
- Tags ligeros vs anotados: `git tag <nombre>` vs `git tag -a`
- `git tag -a v1.0.0 -m "Release v1.0.0"` - tag anotado
- `git push origin <tag>` - subir tags al remoto
- `git push --tags` - subir todos los tags
- `git tag -d <tag>` - eliminar tag local
- `git push origin --delete <tag>` - eliminar tag remoto
- Semver: versionado semántico (MAJOR.MINOR.PATCH)
- GitHub Releases: crear release desde tag
- Signed tags: `git tag -s` con GPG

---

### Módulo 17 - Hooks y Automatización
📁 `17-Hooks-Automatizacion/`

- ¿Qué son los hooks? scripts que se ejecutan en eventos Git
- `.git/hooks/` - directorio de hooks locales
- `pre-commit`: validar código antes del commit
- `prepare-commit-msg`: pre-llenar mensaje de commit
- `commit-msg`: validar formato del mensaje
- `pre-push`: ejecutar tests antes de hacer push
- `post-commit`: notificaciones después del commit
- Husky: gestión moderna de hooks
- lint-staged: linters solo en archivos staged
- Compartir hooks: `.githooks/` + `git config core.hooksPath`

---

### Módulo 18 - Git Hooks del Lado Servidor y CI/CD
📁 `18-Git-Hooks-Servidor-CICD/`

- Hooks del lado servidor: pre-receive, update, post-receive
- `pre-receive`: validar push antes de aceptarlo
- `update`: validar por rama (similar a pre-receive pero por ref)
- `post-receive`: trigger CI/CD después del push
- `post-update`: similar a post-receive
- Implementar CI/CD con hooks: triggers de build automático
- GitHub Actions: triggers con `push`, `pull_request`
- GitLab CI: `.gitlab-ci.yml` con stages
- Deploy automático con `post-receive` + webhook
- Buenas prácticas: hooks ligeros, logging, rollback

---

### Módulo 19 - Git Worktrees
📁 `19-Git-Worktrees/`

- `git worktree add` - múltiples working directories
- `git worktree list` - listar worktrees activos
- `git worktree remove` - eliminar worktree
- `git worktree prune` - limpiar referencias huérfanas
- Trabajar en múltiples ramas simultáneamente
- Worktree con nueva rama: `git worktree add -b feature`
- Worktree para hotfix sin interrumpir el trabajo actual
- `git worktree lock`, `git worktree unlock`
- Ventajas sobre stash / múltiples clones
- Casos de uso: revisión de PRs, releases paralelas

---

### Módulo 20 - Git LFS (Large File Storage)
📁 `20-Git-LFS/`

- ¿Qué es Git LFS? - reemplazar archivos grandes con punteros
- Instalación: `git lfs install`
- `git lfs track "*.psd"` - trackear archivos grandes
- `.gitattributes` generado por LFS
- `git lfs ls-files` - listar archivos trackeados por LFS
- `git lfs status` - estado de archivos LFS
- `git lfs pull` y `git lfs fetch`
- `git lfs migrate` - migrar historial existente a LFS
- Límites: GitHub (2GB), GitLab, Bitbucket
- Alternativas: git-annex, storage externo (S3, GCS)

---

## SEMANA 5 - Integración, Seguridad y Experto

> **Objetivo:** Estrategias avanzadas de merge, CI/CD, seguridad con GPG/SSH, buenas prácticas y proyecto integrador final.

---

### Módulo 21 - Estrategias Avanzadas de Merge
📁 `21-Estrategias-Avanzadas-Merge/`

- Merge strategies: recursive, octopus, ours, subtree
- `git merge -s recursive -X theirs` - estrategias con opciones
- `git merge -s ours` - mantener nuestra versión siempre
- `git merge -s octopus` - merge de más de 2 ramas
- `git merge subtree` - merge con prefijo de subdirectorio
- `ort` (Ostensibly Recursive Trait) - nuevo merge strategy
- `git merge --squash` - fusionar sin historial de rama
- `git merge --no-commit` - merge sin commit automático
- Conflictos complejos: archivos binarios, renombrados
- `git merge-file` - fusionar archivos individualmente

---

### Módulo 22 - Git para CI/CD
📁 `22-Git-CICD/`

- GitHub Actions: `on: push`, `on: pull_request`
- Workflows básicos: build, test, deploy
- `actions/checkout@v4` - checkout del repositorio
- `git fetch --depth=1` - shallow clone en CI
- GitLab CI: `.gitlab-ci.yml` - stages, jobs, artifacts
- Versionado automático: `git tag` desde CI
- Changelog generation: conventional-changelog, semantic-release
- `git log --oneline` en release notes
- `git describe --tags` - versionado semántico automático
- Estrategias de branching para CI/CD

---

### Módulo 23 - Seguridad y Firmas
📁 `23-Seguridad-Firmas/`

- GPG: generar par de llaves `gpg --full-generate-key`
- `git config --global user.signingkey <key>`
- `git commit -S` - firmar commits con GPG
- `git tag -s` - firmar tags
- `git log --show-signature` - verificar firmas
- SSH signing: `git config --global gpg.format ssh`
- `git config --global user.signingkey ~/.ssh/id_ed25519.pub`
- Verificar commits firmados en GitHub
- `ssh-keygen -t ed25519` - mejor práctica
- Secret scanning, Dependabot, CodeQL

---

### Módulo 24 - Buenas Prácticas y Flujos de Trabajo
📁 `24-Buenas-Practicas-Flujos/`

- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- `git commitizen` - asistente de commits convencionales
- `commitlint` + husky - validar mensajes automáticamente
- `.gitattributes`: manejo de archivos binarios, texto, EOL
- `git maintenance` - optimización automática del repo
- `git gc` - garbage collection manual
- `git repack` - optimizar objetos
- `git fsck` - verificar integridad del repositorio
- `git archive` - exportar snapshot del proyecto
- `git filter-repo` - reescribir historial masivo (cambiar autor, eliminar archivos)

---

### Módulo 25 - Proyecto Final + Simulación de Entrevista
📁 `25-Proyecto-Final-Entrevista/`

**Módulo capstone integrador.** Simula un proyecto real y una entrevista técnica sobre Git.

- Proyecto: repositorio simulado con features, hotfixes, releases y colaboración
- 10 ejercicios prácticos combinando: init, branches, merges, rebase, stash, cherry-pick, hooks, CI/CD, LFS, seguridad
- Ejercicios:
  1. Inicializar repo y configurar proyecto con .gitignore y .gitattributes
  2. Implementar Git Flow con feature branches y merge a develop
  3. Resolver conflicto complejo entre dos ramas
  4. Rebase interactivo: squash 5 commits en 2 con mensajes convencionales
  5. Stash parcial y recuperación en rama distinta
  6. Cherry-pick hotfix desde main a release branch
  7. Configurar hook pre-commit que ejecuta linter
  8. Crear pipeline CI/CD con GitHub Actions (build + test + tag)
  9. Firmar commits con GPG y verificar firmas
  10. Migrar archivos grandes a LFS y limpiar historial
- Cuestionario de 60 preguntas para el entrevistador (6 categorías)
- Escenarios: desarrollo, QA, DevOps, open source, enterprise

---

## Resumen del Calendario

| Semana | Módulos | Fase | Contenido |
|--------|---------|------|-----------|
| **1** | 01 - 05 | Fundamentos de Git | Control de versiones, instalación, comandos, staging, visualización |
| **2** | 06 - 10 | Ramas y Colaboración | Branches, remotos, PRs, conflictos, estrategias |
| **3** | 11 - 15 | Manipulación Avanzada | Rebase, stash, deshacer, cherry-pick, bisect, submódulos |
| **4** | 16 - 20 | Git en Equipos y DevOps | Tags, hooks, CI/CD, worktrees, LFS |
| **5** | 21 - 25 | Integración y Experto | Merge avanzado, CI/CD, seguridad, buenas prácticas, proyecto final |

---

## Dominios de Práctica por Fase

| Fase | Dominio | Escenario |
|------|---------|-----------|
| Fundamentos | Desarrollo individual | Proyecto personal con historial limpio |
| Ramas y Colaboración | Equipo pequeño | Feature branches + PRs + code review |
| Manipulación Avanzada | Equipo mediano | Rebase interactivo, bisect, submódulos |
| DevOps | Equipo DevOps | Hooks, CI/CD, worktrees, LFS |
| Experto | Enterprise | Seguridad, merge avanzado, buenas prácticas, entrevista |

---

## Criterios Generales de Evaluación

| Nivel | Descripción |
|-------|-------------|
| ✅ **Aprobado** | Comandos correctos, mensajes de commit claros, historial limpio, buenas prácticas |
| ⚠️ **Revisar** | Funciona pero usa anti-patrones (ej: commits gigantes, mensajes pobres, `--force` sin cuidado) |
| ❌ **Repetir** | No comprende el flujo de Git, pierde cambios, no resuelve conflictos |

### Rúbrica por ejercicio

- **Corrección funcional (40%):** El resultado es el esperado
- **Historial (25%):** Commits claros, bien estructurados, mensajes convencionales
- **Buenas prácticas (20%):** .gitignore, .gitattributes, hooks, firms
- **Colaboración (15%):** Ramas, PRs, resolución de conflictos

---

## Línea de Tiempo y Diagrama de Avance (Gantt)

```
SEMANA 1                  SEMANA 2                  SEMANA 3                  SEMANA 4                  SEMANA 5
Fundamentos Git           Ramas y Colaboración      Manipulación Avanzada     Git+DevOps                Experto + Proyecto Final
══════════════════════    ═══════════════════════    ═══════════════════════    ═══════════════════════    ═══════════════════════════
┌ M01 ┐ Introducción     ┌ M06 ┐ Ramas y Merges   ┌ M11 ┐ Rebase Interactivo ┌ M16 ┐ Tags y Releases    ┌ M21 ┐ Merge Avanzado     ┐
│     │                  │     │                    │     │                     │     │                    │     │                     │
│ M02 ┐ Instalación      │ M07 ┐ Git Flow           │ M12 ┐ Stash               │ M17 ┐ Hooks              │ M22 ┐ Git CI/CD           │
│     │                  │     │                    │     │                     │     │                    │     │                     │
│ M03 ┐ Comandos Básicos │ M08 ┐ Remotos            │ M13 ┐ Deshacer Cambios    │ M18 ┐ Hooks Servidor     │ M23 ┐ Seguridad/Firmas    │
│     │                  │     │                    │     │                     │     │                    │     │                     │
│ M04 ┐ Staging/Commits  │ M09 ┐ Pull Requests      │ M14 ┐ Cherry-pick/Bisect  │ M19 ┐ Worktrees          │ M24 ┐ Buenas Prácticas    │
│     │                  │     │                    │     │                     │     │                    │     │                     │
│ M05 ┐ Visualización    │ M10 ┐ Conflictos         │ M15 ┐ Submódulos          │ M20 ┐ Git LFS            │ M25 ┐ Proyecto Final      │
└─────┴──────────────────┘ └─────┴──────────────────┘ └─────┴──────────────────┘ └─────┴──────────────────┘ └─────┴─────────────────────┘
```

### Hitos por Semana

| Semana | Día | Hito | Módulo | Entregable |
|--------|-----|------|--------|------------|
| **1** | Lun | ✅ Git instalado y configurado | M01 | `git --version` + `git config --list` |
| **1** | Mar | ✅ Configuración global completa | M02 | SSH key en GitHub + alias configurados |
| **1** | Mié | ✅ Primer repositorio y commits | M03 | `git log` con 3+ commits |
| **1** | Jue | ✅ Staging interactivo y .gitignore | M04 | .gitignore funcional + amend exitoso |
| **1** | Vie | ✅ Visualización avanzada del historial | M05 | `git log --graph --oneline --all` funcional |
| **2** | Lun | ✅ Ramas creadas y mergeadas | M06 | Merge 3-way exitoso |
| **2** | Mar | ✅ Estrategia de ramificación elegida | M07 | Diagrama Git Flow o GitHub Flow |
| **2** | Mié | ✅ Repositorio remoto conectado | M08 | `git push` exitoso a GitHub |
| **2** | Jue | ✅ PR creado y mergeado | M09 | PR con revisión y merge exitoso |
| **2** | Vie | ✅ Conflicto resuelto | M10 | Merge con conflicto resuelto |
| **3** | Lun | ✅ Rebase interactivo completado | M11 | 5 commits squasheados en 2 |
| **3** | Mar | ✅ Stash dominado | M12 | Stash parcial + recuperación en otra rama |
| **3** | Mié | ✅ Deshacer cambios con reflog | M13 | Commit recuperado con reflog |
| **3** | Jue | ✅ Bug encontrado con bisect | M14 | `git bisect` encuentra commit culpable |
| **3** | Vie | ✅ Submódulo integrado | M15 | Repo con submódulo funcional |
| **4** | Lun | ✅ Tag anotado y release creado | M16 | `git tag -a` + GitHub Release |
| **4** | Mar | ✅ Hook pre-commit funcionando | M17 | Linter ejecutándose antes de commit |
| **4** | Mié | ✅ CI/CD con GitHub Actions | M18 | Pipeline build+test en cada push |
| **4** | Jue | ✅ Worktree en uso | M19 | `git worktree list` con 2+ directorios |
| **4** | Vie | ✅ LFS trackeando archivos | M20 | `git lfs ls-files` muestra archivos |
| **5** | Lun | ✅ Merge con estrategia avanzada | M21 | `git merge -s ours` o subtree |
| **5** | Mar | ✅ Pipeline CI/CD completo | M22 | Release automático con tag |
| **5** | Mié | ✅ Commits firmados con GPG | M23 | `git log --show-signature` OK |
| **5** | Jue | ✅ Conventional Commits funcionando | M24 | commitlint validando mensajes |
| **5** | Vie | ✅ Proyecto final + entrevista | M25 | Repo completo + 60 preguntas respondidas |

### Progreso Visual

| Semana | Módulos | Avance | Barra de progreso |
|--------|---------|--------|--------------------|
| **1**   | 01 - 05 | 20%   | `#####-----------------------`  5/25 |
| **2**   | 06 - 10 | 40%   | `##########------------------` 10/25 |
| **3**   | 11 - 15 | 60%   | `###############-------------` 15/25 |
| **4**   | 16 - 20 | 80%   | `####################--------` 20/25 |
| **5**   | 21 - 25 | 100%  | `#############################` 25/25 |

---

## Recursos de Referencia

- 📘 **Libro base:** `../Libros/pro-git.pdf` (https://git-scm.com/book/es/v2)
- 🌐 **Git Docs:** https://git-scm.com/docs
- 📖 **Git Book (Pro Git):** https://git-scm.com/book/es/v2
- 🐙 **GitHub Docs:** https://docs.github.com
- 🦊 **GitLab Docs:** https://docs.gitlab.com
- 🔧 **Conventional Commits:** https://www.conventionalcommits.org
- 📋 **Plan de Acción:** `../Plan-Accion-Curso.md`

## Cursos en Video de Referencia

- 🎥 **Git y GitHub - Curso desde cero (español):** [MoureDev Git](https://www.youtube.com/watch?v=3GymExBkKjQ)
- 🎥 **Git para desarrolladores (español):** [Fazt Git](https://www.youtube.com/watch?v=HiXLkL42tMU)
- 🎥 **Pro Git Book (inglés):** [Git SCM Videos](https://git-scm.com/videos)
- 🎥 **GitHub Actions en 1 hora:** [TechWorld with Nana](https://www.youtube.com/watch?v=R8_veQiYBjI)
- 🎥 **Git avanzado - rebase, bisect, hooks:** [ThePrimeagen Git](https://www.youtube.com/c/ThePrimeagen)
