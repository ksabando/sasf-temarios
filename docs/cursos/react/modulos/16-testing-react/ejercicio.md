---
sidebar_label: "Ejercicio"
---

# Ejercicio — Testing en TaskFlow

**Proyecto:** `taskflow/` (existente, módulos 1–15 completados)
**Objetivo:** Agregar tests unitarios y de integración con Vitest, React Testing Library y MSW.

---

## 1. Instalar dependencias

```bash
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom msw @types/node
```

## 2. Configurar Vitest

Editar `vite.config.ts`:
- Agregar `/// <reference types="vitest" />`
- En `defineConfig`, agregar propiedad `test` con `globals: true`, `environment: 'jsdom'`, `setupFiles: './src/test/setup.ts'`

Crear `src/test/setup.ts`:
- Importar `@testing-library/jest-dom/vitest`

## 3. Test: Button.tsx

Crear `src/__tests__/Button.test.tsx`:
- Testear que renderiza el texto del label
- Testear que renderiza con variante `primary` y `secondary`
- Testear que `onClick` se llama al hacer clic (con userEvent)
- Testear que está deshabilitado cuando `disabled={true}`

## 4. Test: LoginPage.tsx con MSW

Crear `src/mocks/handlers.ts`:
- Handler para `POST /api/auth/login`
  - Si email es `"error@test.com"`, responder `401`
  - De lo contrario, responder con `{ token, user }`

Crear `src/__tests__/LoginPage.test.tsx`:
- Configurar MSW server con `setupServer`
- Testear login exitoso: llenar formulario, submit, verificar que redirige o muestra token
- Testear login fallido: email `error@test.com`, verificar mensaje de error en pantalla

## 5. Test: useDebounce hook con renderHook

Crear `src/__tests__/useDebounce.test.ts`:
- Testear que retorna el valor inicial inmediatamente
- Testear que no se actualiza antes del delay
- Testear que se actualiza después del delay
- Usar `vi.useFakeTimers()` y `vi.advanceTimersByTime()`

## 6. Scripts y ejecución

En `package.json`:

```json
"scripts": {
  "test": "vitest",
  "test:run": "vitest run"
}
```

Ejecutar:

```bash
npm test
```

Todos los tests deben pasar.
