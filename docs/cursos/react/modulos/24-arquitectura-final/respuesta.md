---
sidebar_label: "Soluciones"
---

# Soluciones M24 — Arquitectura Final

## Ejercicio 1: Refactorizar a estructura feature-based

**Solución esperada**:

```bash
# Crear estructura de carpetas
mkdir -p src/features/auth/{pages,components,hooks,store,api}
mkdir -p src/features/tasks/{pages,components,hooks,store,api}
mkdir -p src/features/ui
mkdir -p src/services
mkdir -p src/types
mkdir -p src/utils
```

**Posibles mejoras**:
- Agregar `src/features/shared/` para código compartido entre features pero no lo suficientemente genérico para `src/utils/`.
- Crear un archivo `index.ts` barrel en cada feature que re-exporte solo la API pública de la feature.
- Prefijar las carpetas de features con números para orden visual si hay dependencias (aunque idealmente las features son independientes).

---

## Ejercicio 2: Mover cada archivo

**Solución esperada**:

```bash
# Auth
git mv src/pages/LoginPage.tsx src/features/auth/pages/LoginPage.tsx
git mv src/pages/RegisterPage.tsx src/features/auth/pages/RegisterPage.tsx
git mv src/components/LoginForm.tsx src/features/auth/components/LoginForm.tsx
git mv src/hooks/useAuth.ts src/features/auth/hooks/useAuth.ts
git mv src/store/authStore.ts src/features/auth/store/authStore.ts
git mv src/services/authApi.ts src/features/auth/api/authApi.ts

# Tasks
git mv src/pages/Dashboard.tsx src/features/tasks/pages/Dashboard.tsx
git mv src/pages/TaskDetailPage.tsx src/features/tasks/pages/TaskDetailPage.tsx
git mv src/components/TaskCard.tsx src/features/tasks/components/TaskCard.tsx
git mv src/components/TaskList.tsx src/features/tasks/components/TaskList.tsx
git mv src/components/TaskForm.tsx src/features/tasks/components/TaskForm.tsx
git mv src/hooks/useTasks.ts src/features/tasks/hooks/useTasks.ts
git mv src/store/taskStore.ts src/features/tasks/store/taskStore.ts
git mv src/services/taskApi.ts src/features/tasks/api/taskApi.ts

# UI
git mv src/components/Button.tsx src/features/ui/Button.tsx
git mv src/components/Input.tsx src/features/ui/Input.tsx
git mv src/components/Modal.tsx src/features/ui/Modal.tsx
git mv src/components/Spinner.tsx src/features/ui/Spinner.tsx
git mv src/components/Toast.tsx src/features/ui/Toast.tsx

# Services, types, utils
git mv src/services/api.ts src/services/api.ts
git mv src/services/queryClient.ts src/services/queryClient.ts
git mv src/types.ts src/types/index.ts
git mv src/utils/validations.ts src/utils/validations.ts
git mv src/utils/sanitize.ts src/utils/sanitize.ts
```

**Posibles mejoras**:
- Usar path aliases (`@/features/auth`) configurados en `vite.config.ts` y `tsconfig.json` para evitar imports relativos frágiles.
- Ejecutar `tsc --noEmit` después de mover para validar que los imports relativos no se rompieron antes de commitear.
- Crear un script de migración automatizado si hay muchas features para mover.

---

## Ejercicio 3: Actualizar imports

**Solución esperada**:

**src/features/auth/pages/LoginPage.tsx:**
```tsx
import { useAuth } from '../hooks/useAuth'
import { LoginForm } from '../components/LoginForm'
import { Button } from '../../ui/Button'
import { Spinner } from '../../ui/Spinner'
```

**src/features/tasks/pages/Dashboard.tsx:**
```tsx
import { useTasks } from '../hooks/useTasks'
import { TaskCard } from '../components/TaskCard'
import { useAuth } from '../../auth/hooks/useAuth'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
```

**src/features/tasks/api/taskApi.ts:**
```tsx
import api from '../../../services/api'
import type { Task } from '../types'
```

**src/App.tsx:**
```tsx
import { Dashboard } from './features/tasks/pages/Dashboard'
import { LoginPage } from './features/auth/pages/LoginPage'
import { RegisterPage } from './features/auth/pages/RegisterPage'
import { Button } from './features/ui/Button'
```

**Posibles mejoras**:
- Reemplazar todos los imports relativos con path aliases (`@/features/auth/hooks/useAuth`) para mayor legibilidad.
- Usar `eslint-plugin-import` con reglas de orden de imports y paths para consistencia automática.
- Verificar con `grep -r "from '\.\.\/\.\.\/components" src/` que no quedaron imports a la estructura antigua.

---

## Ejercicio 4: Verificar compilación

**Solución esperada**:

```bash
# TypeScript check
npx tsc --noEmit

# Build
npm run build

# Tests
npm run test

# Lint
npm run lint
```

Si hay errores de import:
```bash
# Encontrar imports incorrectos
grep -r "from '\.\.\/\.\.\/components" src/features/
grep -r "from '\.\.\/\.\.\/hooks" src/features/
# Corregir cada uno según la nueva estructura
```

**Posibles mejoras**:
- Agregar estos comandos como scripts en `package.json`: `"check": "tsc --noEmit && eslint . && vitest run"`.
- Configurar un pre-commit hook con Husky que ejecute `npm run check` antes de cada commit.
- Usar `--force` en `tsc` para listar todos los errores de una vez en lugar de detenerse en el primero.

---

## Ejercicio 5: ESLint strict

**Solución esperada**:

```ts
// eslint.config.js
import tseslint from 'typescript-eslint'

export default tseslint.config({
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-floating-promises': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
  },
})
```

```bash
npm run lint
# Corregir errores automáticamente
npm run lint -- --fix
```

**Posibles mejoras**:
- Agregar `@typescript-eslint/no-non-null-assertion: warn` para evitar el abuso de `!`.
- Incluir `import/order` y `import/no-cycle` para mantener imports organizados y prevenir dependencias circulares.
- Agregar `react-refresh/only-export-components` si se usa Fast Refresh en desarrollo.

---

## Ejercicio 6: Git tag v1.0.0

**Solución esperada**:

```bash
# Verificar que todo está commit
git status

# Commit final
git add .
git commit -m "refactor: feature-based architecture with strict ESLint rules

- Reorganized src/ into features/auth, features/tasks, features/ui
- Separated services, types, and utils
- Applied strict ESLint rules (no-explicit-any, strict-boolean-expressions)
- Updated all imports across the project"

# Crear tag
git tag v1.0.0 -m "TaskFlow v1.0.0 - Release final"

# Push
git push origin main
git push origin v1.0.0
```

**Posibles mejoras**:
- Usar conventional commits (`feat:`, `fix:`, `refactor:`) para generación automática de changelogs con `standard-version`.
- Configurar `npm version` scripts que automáticamente creen tags de Git y publiquen en npm/github.
- Agregar `git tag -s v1.0.0` (firmado con GPG) para verificar la autenticidad del release.
