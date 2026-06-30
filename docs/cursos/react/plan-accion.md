---
sidebar_position: 1
private: true
sidebar_class_name: private
sidebar_label: "Plan de Acción"
---

# Plan de Acción — Curso React 2026

**Duración:** 5 semanas | **25 módulos** | **~4-5 horas diarias de dedicación**

---

## Antes de Empezar (Pre-work)

- [ ] Tener Node.js 20+ instalado (`node --version`)
- [ ] Tener npm 10+ instalado (`npm --version`)
- [ ] Tener VS Code instalado
- [ ] Instalar extensiones: ES7+ React snippets, ESLint, Prettier, GitLens
- [ ] Tener Git instalado y configurado
- [ ] Crear cuenta en GitHub
- [ ] Instalar React Developer Tools (Chrome/Firefox)
- [ ] (Opcional) Tener el backend Spring Boot funcionando del [Curso Spring](/cursos/spring/temario)
- [ ] Tener acceso a los archivos en `Modulos/`
- [ ] Leer `Modulos/Temario-React-2026.md` completo

---

## Metodología de Estudio por Módulo

Cada módulo modifica/agrega archivos al proyecto `taskflow/` que construimos desde el M01:

```
1. DIA POSITIVA   → Abrir diap.pptx, ver las 10 slides (15 min)
2. CLASE TEÓRICA   → Leer clase.md completo, tomar notas (30 min)
3. EJERCICIOS      → Aplicar los ejercicios AL PROYECTO taskflow (60-90 min)
4. AUTO-CORRECCIÓN → Comparar con respuesta.md, corregir errores (30 min)
5. CUESTIONARIO    → Responder las 10 preguntas de cuestionario.md (20 min)
6. COMMIT          → git add . && git commit -m "MXX: descripción"
```

> ⚠️ **Regla de oro:** No mirar `respuesta.md` hasta haber intentado todos los ejercicios. Cada módulo termina con un commit. Al finalizar la semana, hacer push a GitHub.

---

## Semana 1 — Fundamentos: Esqueleto de TaskFlow

**Objetivo:** Inicializar proyecto, componentes base, estado local, eventos, listas.

| Día | Módulo | Tema | Horas est. | Archivos creados/modificados |
|-----|--------|------|------------|------------------------------|
| **Lun** | M01 | Setup: Vite + TS + ESLint | 3h | `vite.config.ts`, `tsconfig.json`, `App.tsx`, `main.tsx` |
| **Mar** | M02 | Componentes base y props | 4h | `components/ui/Button.tsx`, `Input.tsx`, `Card.tsx`, `components/layout/Header.tsx`, `Layout.tsx` |
| **Mié** | M03 | Estado con useState | 4h | `types/task.ts`, `hooks/useTaskList.ts`, integración en `App.tsx` |
| **Jue** | M04 | Eventos y renderizado condicional | 4h | Formulario en App, filtros, badges de estado |
| **Vie** | M05 | Listas, keys y transformaciones | 4h | Búsqueda, ordenamiento, contadores |

**Checkpoint:** TaskFlow funciona localmente: CRUD de tareas con estado, filtros y búsqueda. ✅ Commit: `"Semana 1: fundamentos completos"`

---

## Semana 2 — Datos y Estado: Conectando con Spring Boot

**Objetivo:** Formularios con validación, API HTTP con Spring Boot, autenticación JWT, useReducer y custom hooks.

| Día | Módulo | Tema | Horas est. | Archivos creados/modificados |
|-----|--------|------|------------|------------------------------|
| **Lun** | M06 | Formularios con React Hook Form + Zod | 4h | `utils/validations.ts`, formulario de tarea con validación |
| **Mar** | M07 | Peticiones HTTP a Spring Boot | 4h | `services/api.ts`, `services/taskService.ts`, reemplazar estado local |
| **Mié** | M08 | Context API para autenticación | 4h | `context/AuthContext.tsx`, interceptor axios, login/register |
| **Jue** | M09 | useReducer para estado complejo | 4h | `reducers/taskReducer.ts`, `context/TaskContext.tsx` |
| **Vie** | M10 | Custom hooks | 4h | `hooks/useAuth.ts`, `useTasks.ts`, `useDebounce.ts`, `useLocalStorage.ts` |

**Checkpoint:** TaskFlow conectado a API Spring Boot con JWT + CRUD funcionando. ✅ Commit: `"Semana 2: API + auth + reducer"`

---

## Semana 3 — Navegación y Patrones Avanzados

**Objetivo:** React Router, Portals, Compound Components, Error Boundaries, TypeScript estricto.

| Día | Módulo | Tema | Horas est. | Archivos creados/modificados |
|-----|--------|------|------------|------------------------------|
| **Lun** | M11 | React Router | 4h | `pages/LoginPage.tsx`, `DashboardPage.tsx`, `ProtectedRoute.tsx` |
| **Mar** | M12 | Portals y Refs | 4h | `components/ui/Modal.tsx`, `components/ui/Tooltip.tsx` |
| **Mié** | M13 | Compound Components | 4h | `components/ui/Tabs.tsx`, `Accordion.tsx`, `ConfirmDialog.tsx` |
| **Jue** | M14 | Error Boundaries y Suspense | 4h | `components/ErrorBoundary.tsx`, lazy loading de páginas |
| **Vie** | M15 | TypeScript avanzado | 4h | Refactorizar tipos, utility types, strict mode |

**Checkpoint:** TaskFlow con navegación, modales, compound components y TS estricto. ✅ Commit: `"Semana 3: patrones avanzados"`

---

## Semana 4 — Ecosistema Profesional

**Objetivo:** Testing, Zustand, React Query, formularios avanzados, animaciones.

| Día | Módulo | Tema | Horas est. | Archivos creados/modificados |
|-----|--------|------|------------|------------------------------|
| **Lun** | M16 | Testing | 4h | `src/__tests__/*.test.tsx`, configuración vitest + MSW |
| **Mar** | M17 | Estado global con Zustand | 4h | `store/authStore.ts`, `store/taskStore.ts`, `store/uiStore.ts` |
| **Mié** | M18 | React Query | 4h | Reemplazar taskService + useEffect por useQuery/useMutation |
| **Jue** | M19 | React Hook Form avanzado | 4h | Registro multi-step, useFieldArray para subtareas |
| **Vie** | M20 | Framer Motion | 4h | Animaciones en TaskCard, sidebar, modal |

**Checkpoint:** TaskFlow con tests, Zustand, React Query y animaciones. ✅ Commit: `"Semana 4: ecosistema profesional"`

---

## Semana 5 — Producción y Proyecto Final

**Objetivo:** Performance, Docker, CI/CD, seguridad, arquitectura y proyecto E-Commerce desde cero.

| Día | Módulo | Tema | Horas est. | Archivos creados/modificados |
|-----|--------|------|------------|------------------------------|
| **Lun** | M21 | Rendimiento y optimización | 4h | memo, useMemo, useCallback, code splitting, bundle analysis |
| **Mar** | M22 | Docker + CI/CD | 4h | `Dockerfile`, `.dockerignore`, `.github/workflows/deploy.yml` |
| **Mié** | M23 | Seguridad en React | 4h | Refresh token, CSP, sanitización, roles |
| **Jue** | M24 | Arquitectura final | 4h | Refactor feature-based, clean architecture, tag v1.0.0 |
| **Vie** | M25 | Proyecto Final: E-Commerce | 6h | Nueva app desde cero: catálogo, carrito, checkout, tests, CI/CD |

**Checkpoint M24:** TaskFlow v1.0.0 completo: dockerizado, CI/CD, seguro, optimizado. ✅ Tag: `v1.0.0`
**Checkpoint M25:** E-Commerce app completa desde cero en un día. ✅

---

## Rúbrica de Auto-Evaluación

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

1. **Nunca copies y pegues.** Escribe cada línea de código manualmente.
2. **Haz commit después de cada módulo.** El historial Git es tu bitácora de aprendizaje.
3. **Lee los errores de TypeScript.** Son tu mejor guía para escribir código correcto.
4. **Usa React DevTools.** Inspecciona componentes, estado, props y re-renders.
5. **Primero funciona, después optimiza.** No premature optimization.
6. **No te saltes ejercicios.** Cada módulo construye sobre el anterior.
7. **Pregunta.** Si algo no te cierra después de 15 minutos, pregunta.

---

## Recursos

| Recurso | Enlace |
|---------|--------|
| Temario completo | `Modulos/Temario-React-2026.md` |
| Ejercicios y soluciones | `Modulos/` (25 carpetas, código progresivo) |
| Curso Spring (Backend) | `/cursos/spring/temario` |
| React Docs | https://react.dev |
| TypeScript Cheatsheet | https://react-typescript-cheatsheet.netlify.app |
| TanStack Query | https://tanstack.com/query |
| Zustand | https://github.com/pmndrs/zustand |
| React Hook Form | https://react-hook-form.com |
| Zod | https://zod.dev |
| Framer Motion | https://www.framer.com/motion |
| React Testing Library | https://testing-library.com/react |
| Vitest | https://vitest.dev |
