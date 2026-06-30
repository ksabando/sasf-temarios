---
sidebar_label: "Soluciones"
---

# Soluciones M16 — Testing en React con Vitest y React Testing Library

## `vite.config.ts`

**Solución esperada**:

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
```

**Posibles mejoras**:
- Agregar `coverage` config con `provider: 'v8'`, `reporter: ['text', 'html', 'lcov']`, y thresholds para mantener cobertura mínima.
- Incluir `test.include: ['src/**/*.test.{ts,tsx}']` y `exclude` para node_modules y build artifacts.
- Configurar `test.retry: 2` para tests flaky en CI.

---

## `src/test/setup.ts`

**Solución esperada**:

```ts
import '@testing-library/jest-dom/vitest';
```

**Posibles mejoras**:
- Agregar `cleanup()` automático con `afterEach(cleanup)` aunque RTL ya lo hace con `globals: true`.
- Mockear `matchMedia`, `IntersectionObserver`, y `ResizeObserver` globalmente para componentes que usan estas APIs.
- Configurar MSW server con `beforeAll`/`afterEach`/`afterAll` a nivel global si todos los tests de integración usan MSW.

---

## `src/mocks/handlers.ts`

**Solución esperada**:

```ts
import { http, HttpResponse } from 'msw';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const handlers = [
  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    const { email } = (await request.json()) as { email: string; password: string };

    if (email === 'error@test.com') {
      return HttpResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      token: 'fake-jwt-token',
      user: { id: 1, name: 'Usuario Test', email },
    });
  }),

  http.get(`${BASE_URL}/tasks`, () => {
    return HttpResponse.json([
      { id: '1', title: 'Test task 1', completed: false },
      { id: '2', title: 'Test task 2', completed: true },
    ]);
  }),
];
```

**Posibles mejoras**:
- Agregar handlers para PUT/PATCH/DELETE de tareas con validación de request body y simulación de errores de red.
- Exportar funciones helper `createMockTask` y `createMockUser` para generar datos de prueba consistentes.
- Configurar `delay` en los handlers para simular latencia de red y testear estados de loading.

---

## `src/__tests__/Button.test.tsx`

**Solución esperada**:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Button from '../components/Button';

describe('Button', () => {
  it('renderiza el label', () => {
    render(<Button label="Click me" />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renderiza con variante primary', () => {
    render(<Button variant="primary" label="Enviar" />);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('primary');
  });

  it('renderiza con variante secondary', () => {
    render(<Button variant="secondary" label="Cancelar" />);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('secondary');
  });

  it('llama onClick al hacer clic', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} label="Clic" />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('no llama onClick cuando está deshabilitado', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} label="Clic" disabled />);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });
});
```

**Posibles mejoras**:
- Agregar tests para `type="submit"`, `aria-label`, y `data-*` attributes usando `toHaveAttribute`.
- Testear el evento `keyboard` (Enter, Space) en botones para verificar accesibilidad por teclado.
- Agregar snapshots de renderizado con diferentes combinaciones de props para detectar regresiones visuales.

---

## `src/__tests__/LoginPage.test.tsx`

**Solución esperada**:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { beforeAll, afterEach, afterAll, describe, it, expect, vi } from 'vitest';
import LoginPage from '../pages/LoginPage';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const server = setupServer(
  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    const { email } = (await request.json()) as { email: string };
    if (email === 'error@test.com') {
      return HttpResponse.json({ message: 'Credenciales inválidas' }, { status: 401 });
    }
    return HttpResponse.json({ token: 'test-token', user: { id: 1, name: 'Test' } });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('LoginPage', () => {
  it('muestra error con credenciales inválidas', async () => {
    render(<LoginPage />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'error@test.com');
    await user.type(screen.getByLabelText(/contraseña|password/i), '123456');
    await user.click(screen.getByRole('button', { name: /ingresar|iniciar/i }));

    await waitFor(() => {
      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument();
    });
  });

  it('loguea exitosamente y redirige', async () => {
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', () => ({
      useNavigate: () => mockNavigate,
    }));

    render(<LoginPage />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/contraseña|password/i), '123456');
    await user.click(screen.getByRole('button', { name: /ingresar|iniciar/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
```

**Posibles mejoras**:
- Testear el estado de loading: verificar que el botón está deshabilitado y muestra "Cargando..." durante la petición.
- Agregar un test para el caso de error de red (sin conexión) mockeando un `HttpResponse.error()` en MSW.
- Testear el toggle entre login/register verificando que los campos cambian (nombre aparece/desaparece).

---

## `src/__tests__/useDebounce.test.ts`

**Solución esperada**:

```tsx
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import useDebounce from '../hooks/useDebounce';

describe('useDebounce', () => {
  it('retorna el valor inicial inmediatamente', () => {
    const { result } = renderHook(() => useDebounce('hola', 500));
    expect(result.current).toBe('hola');
  });

  it('no actualiza el valor antes del delay', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'hola' } }
    );

    rerender({ value: 'mundo' });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('hola');

    vi.useRealTimers();
  });

  it('actualiza el valor después del delay', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'hola' } }
    );

    rerender({ value: 'mundo' });
    act(() => vi.advanceTimersByTime(500));
    expect(result.current).toBe('mundo');

    vi.useRealTimers();
  });
});
```

**Posibles mejoras**:
- Testear cambios rápidos de valor (múltiples rerenders en menos tiempo que el delay) para verificar que solo el último valor se aplica.
- Testear el cleanup: verificar que al cambiar `delay`, el timer viejo se cancela y el nuevo empieza.
- Agregar test para el caso donde `value` no cambia entre renders (no debe disparar nuevo timer).
