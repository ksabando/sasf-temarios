---
sidebar_label: "Clase"
---

## 2. Props: interfaces, tipos y valores por defecto

```tsx
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  onClick?: () => void
  disabled?: boolean
}

function Button({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
}: ButtonProps) {
  // ...
}
```

Los valores por defecto se asignan en la destructuración. Esto evita checks de undefined dentro del componente.

---

## 3. children y composición

`children` es una prop especial que representa el contenido anidado entre las etiquetas del componente:

```tsx
interface CardProps {
  children: React.ReactNode
  className?: string
}

function Card({ children, className = '' }: CardProps) {
  return <div className={`card ${className}`}>{children}</div>
}

// Uso:
<Card>
  <p>Este es el contenido de la tarjeta</p>
</Card>
```

El tipo `React.ReactNode` acepta cualquier cosa renderizable: strings, JSX, arrays, null, undefined.

---

## 4. Fragmentos `<> </>`

Los fragmentos permiten retornar múltiples elementos sin agregar un nodo extra al DOM:

```tsx
function Columnas() {
  return (
    <>
      <div>Columna 1</div>
      <div>Columna 2</div>
    </>
  )
}
```

A diferencia de un `<div>`, los fragmentos no generan nodos en el DOM real.

---

## 5. Layout Pattern

El layout pattern separa la estructura visual de la página en componentes contenedores:

```
Layout
├── Header
├── Main (children / Outlet)
└── Footer
```

```tsx
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}
```

---

## 6. Convenciones de nomenclatura

- **PascalCase** para componentes: `Button`, `TaskCard`, `Header`
- **CamelCase** para funciones y hooks: `useTaskList`, `formatDate`
- **kebab-case** para archivos CSS: `button.css`
- Archivos de componentes llevan el mismo nombre que el componente: `Button.tsx`
- `index.ts` dentro de una carpeta re-exporta para limpiar imports

```ts
// components/ui/index.ts
export { Button } from './Button'
export { Input } from './Input'
```

---

## 7. Props con valores default — patrón completo

```tsx
interface BadgeProps {
  status: 'active' | 'completed'
  size?: 'sm' | 'md' | 'lg'
}

function Badge({ status, size = 'md' }: BadgeProps) {
  return <span className={`badge badge-${status} badge-${size}`}>{status}</span>
}
```

Siempre tipar las props con `interface` en lugar de `type` para mejor mensajes de error y extensibilidad.
