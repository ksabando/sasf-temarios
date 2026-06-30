---
sidebar_label: "Soluciones"
---

# Soluciones M02 — Componentes Base y Props

## Ejercicio 1 — Button.tsx

**Solución esperada**:

`src/components/ui/Button.tsx`:

```tsx
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  onClick?: () => void
  disabled?: boolean
}

function Button({ children, variant = 'primary', onClick, disabled = false }: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export default Button
```

**Posibles mejoras**:
- Extender `React.ButtonHTMLAttributes<HTMLButtonElement>` para heredar atributos nativos como `type`, `aria-label` y `form`.
- Agregar un spread condicional: `const { variant, children, ...rest } = props` y pasar solo `rest` al `<button>` para evitar pasar props no-DOM.
- Tipar `onClick` como `React.MouseEventHandler<HTMLButtonElement>` en lugar de `() => void` para recibir el evento y habilitar `e.preventDefault()`.

---

## Ejercicio 2 — Input.tsx

**Solución esperada**:

`src/components/ui/Input.tsx`:

```tsx
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="input-group">
        {label && <label>{label}</label>}
        <input ref={ref} className={`input ${className}`} {...props} />
        {error && <span className="input-error">{error}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
```

**Posibles mejoras**:
- Asociar `<label>` con el input mediante `id` + `htmlFor` para accesibilidad (generar un ID único con `useId()`).
- Agregar `aria-invalid={!!error}` y `aria-describedby` en el input para que lectores de pantalla anuncien el error.
- Exportar también el tipo `InputProps` como named export para que formularios externos puedan extenderlo.

---

## Ejercicio 3 — Card.tsx

**Solución esperada**:

`src/components/ui/Card.tsx`:

```tsx
interface CardProps {
  children: React.ReactNode
  className?: string
}

function Card({ children, className = '' }: CardProps) {
  return <div className={`card ${className}`}>{children}</div>
}

export default Card
```

**Posibles mejoras**:
- Agregar `as?: React.ElementType` como prop para permitir renderizado polimórfico (`<Card as="section">` en lugar de forzar `<div>`).
- Aceptar `ref` con `forwardRef` para que componentes padres puedan medir o animar la Card directamente.
- Agregar `role` y `aria-labelledby` opcionales para mejorar la semántica cuando la Card actúa como contenedor accesible.

---

## Ejercicio 4 — Header.tsx

**Solución esperada**:

`src/components/layout/Header.tsx`:

```tsx
function Header() {
  return (
    <header className="header">
      <h1>TaskFlow - Gestor de Tareas</h1>
      <div className="header-user">Usuario</div>
    </header>
  )
}

export default Header
```

**Posibles mejoras**:
- Recibir `userName` como prop para personalizar el nombre de usuario mostrado en `header-user`.
- Agregar un `nav` con links usando `react-router-dom` para navegación principal dentro del header.
- Usar `<header role="banner">` explícitamente y un `<h1>` único por página según buenas prácticas de accesibilidad.

---

## Ejercicio 5 — Layout.tsx

**Solución esperada**:

`src/components/layout/Layout.tsx`:

```tsx
import Header from './Header'

interface LayoutProps {
  children: React.ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <main className="main-content">{children}</main>
      <footer className="footer">© 2026 TaskFlow</footer>
    </>
  )
}

export default Layout
```

**Posibles mejoras**:
- Envolver el contenido en un `<div className="app-layout">` para aplicar CSS Grid (`grid-template-rows: auto 1fr auto`) y lograr un sticky footer.
- Permitir ocultar el Header/Footer con props como `showHeader?: boolean` y `showFooter?: boolean` para páginas como login.
- Agregar `<SkipToContent />` (skip link) como primer hijo para accesibilidad de teclado.

---

## Ejercicio 6 — App.tsx

**Solución esperada**:

`src/App.tsx`:

```tsx
import Layout from './components/layout/Layout'

function App() {
  return (
    <Layout>
      <p>Bienvenido a TaskFlow. Aquí gestionarás tus tareas.</p>
    </Layout>
  )
}

export default App
```

**Posibles mejoras**:
- Agregar `import './App.css'` para que los estilos de la app estén colocalizados con el componente raíz.
- Usar `<React.StrictMode>` envolviendo `<Layout>` en `main.tsx` para detectar efectos impuros y problemas de ciclo de vida durante desarrollo.
- Definir `App` con `React.FC` o tipo de retorno `JSX.Element` explícito para que TypeScript valide que siempre retorne markup válido.
