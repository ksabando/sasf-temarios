---
sidebar_label: "Ejercicio"
---

## Ejercicio 2: Mover cada archivo a su feature correspondiente

Identificar cada archivo en `src/` actual y moverlo:

**auth/:**
- `src/pages/LoginPage.tsx` → `src/features/auth/pages/LoginPage.tsx`
- `src/pages/RegisterPage.tsx` → `src/features/auth/pages/RegisterPage.tsx`
- `src/components/LoginForm.tsx` → `src/features/auth/components/LoginForm.tsx`
- `src/hooks/useAuth.ts` → `src/features/auth/hooks/useAuth.ts`
- `src/store/authStore.ts` → `src/features/auth/store/authStore.ts`
- `src/services/authApi.ts` → `src/features/auth/api/authApi.ts`

**tasks/:**
- `src/pages/Dashboard.tsx` → `src/features/tasks/pages/Dashboard.tsx`
- `src/pages/TaskDetailPage.tsx` → `src/features/tasks/pages/TaskDetailPage.tsx`
- `src/components/TaskCard.tsx` → `src/features/tasks/components/TaskCard.tsx`
- `src/components/TaskForm.tsx` → `src/features/tasks/components/TaskForm.tsx`
- `src/hooks/useTasks.ts` → `src/features/tasks/hooks/useTasks.ts`
- `src/store/taskStore.ts` → `src/features/tasks/store/taskStore.ts`
- `src/services/taskApi.ts` → `src/features/tasks/api/taskApi.ts`

**ui/:**
- `src/components/Button.tsx` → `src/features/ui/Button.tsx`
- `src/components/Input.tsx` → `src/features/ui/Input.tsx`
- `src/components/Modal.tsx` → `src/features/ui/Modal.tsx`
- `src/components/Spinner.tsx` → `src/features/ui/Spinner.tsx`
- `src/components/Toast.tsx` → `src/features/ui/Toast.tsx`

---

## Ejercicio 3: Actualizar imports

Cada archivo refactorizado debe actualizar sus imports para reflejar la nueva ubicación.

**Ejemplo:**
```tsx
// Antes
import { useTasks } from '../../hooks/useTasks'
import { TaskCard } from '../../components/TaskCard'

// Después
import { useTasks } from '../hooks/useTasks'
import { TaskCard } from '../components/TaskCard'
// O si se importa desde otro feature:
import { Button } from '../../ui/Button'
```

---

## Ejercicio 4: Verificar que todo compile y funcione

```bash
# TypeScript check
npx tsc --noEmit

# Build completo
npm run build

# Tests
npm run test

# Lint
npm run lint
```

Si hay errores, corregir imports y tipos.

---

## Ejercicio 5: ESLint strict

Actualizar `eslint.config.js` con reglas estrictas:

```ts
rules: {
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/strict-boolean-expressions': 'error',
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  '@typescript-eslint/explicit-function-return-type': 'warn',
  '@typescript-eslint/no-floating-promises': 'error',
  'no-console': ['warn', { allow: ['warn', 'error'] }],
}
```

Ejecutar `npm run lint` y corregir todos los errores.

---

## Ejercicio 6: Git tag v1.0.0

```bash
git add .
git commit -m "refactor: feature-based architecture with strict ESLint"
git tag v1.0.0
git push origin main
git push origin v1.0.0
```
