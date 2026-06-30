---
sidebar_label: "Clase"
---

## 2. ¿Qué es Vite y por qué es superior a CRA?

Vite es un bundler ultrarrápido creado por Evan You (creador de Vue.js). A diferencia de Create React App (CRA), Vite:

| Característica | Vite | CRA |
|---|---|---|
| Servidor de desarrollo | Inicio instantáneo (ESM nativo) | Lento (webpack bundle) |
| Recarga en caliente (HMR) | Instantánea | Lenta en proyectos grandes |
| Configuración | Sencilla y extensible | Oculta y difícil de personalizar |
| Build final | Rollup (optimizado) | Webpack |

---

## 3. TypeScript en React: ventajas del tipado estático

- Detecta errores en tiempo de compilación, no en runtime.
- Autocompletado y documentación en el editor.
- Interfaces que documentan la forma de los datos.
- Refactorización segura.

---

## 4. ESLint: propósito y configuración básica

ESLint analiza el código estáticamente para encontrar problemas. En Vite + React + TS se configura con un archivo `eslint.config.js` (flat config) o el tradicional `.eslintrc.cjs`.

Reglas comunes:
- `react/react-in-jsx-scope` — ya no necesaria en React 18+
- `@typescript-eslint/no-unused-vars` — variables sin uso
- `react/prop-types` — desactivada porque usamos TypeScript

---

## 5. Paso a paso: crear el proyecto TaskFlow

```bash
npm create vite@latest taskflow -- --template react-ts
cd taskflow
npm install
npm run dev
```

Explicación del comando:
- `npm create vite@latest` — scaffolding oficial de Vite
- `taskflow` — nombre del proyecto y la carpeta
- `--template react-ts` — template con React + TypeScript

---

## 6. Estructura del proyecto

```
taskflow/
├── index.html            # Punto de entrada HTML
├── vite.config.ts        # Configuración de Vite
├── tsconfig.json         # Configuración de TypeScript
├── tsconfig.app.json     # Configuración TS para la app
├── tsconfig.node.json    # Configuración TS para Node
├── eslint.config.js      # Configuración de ESLint (flat config)
├── package.json          # Dependencias y scripts
├── public/               # Archivos estáticos
└── src/
    ├── main.tsx          # Punto de entrada de React
    ├── App.tsx           # Componente raíz
    ├── App.css           # Estilos del componente App
    ├── index.css         # Estilos globales
    └── vite-env.d.ts     # Tipos de Vite
```

### Archivos clave explicados:

**index.html** — Vite lo trata como punto de entrada. Contiene `<div id="root"></div>` donde se monta React.

**src/main.tsx** — Renderiza el componente App dentro de StrictMode:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**StrictMode** — Componente de desarrollo que detecta problemas potenciales (efectos duplicados, componentes impuros).

**ReactDOM.createRoot** — API de React 18 para crear un root concurrente. Reemplaza a `ReactDOM.render`.

**src/App.tsx** — Componente funcional raíz:

```tsx
function App() {
  return <h1>TaskFlow</h1>
}
export default App
```

---

## 7. Virtual DOM y ReactDOM.createRoot

React mantiene una representación virtual del DOM en memoria. Cuando el estado cambia:
1. React crea un nuevo árbol virtual.
2. Compara (diff) con el árbol anterior.
3. Calcula la mínima cantidad de cambios.
4. Aplica solo esos cambios al DOM real.

`createRoot` habilita el modo concurrente de React 18, permitiendo actualizaciones interrumpibles.

---

## 8. Explicar tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}
```

- `strict: true` — Activa todas las verificaciones estrictas de TypeScript.
- `jsx: "react-jsx"` — Transformación JSX automática (no necesita importar React).
- `target: "ES2020"` — Compila a ES2020.
- `module: "ESNext"` — Mantiene los módulos ES nativos.
- `allowImportingTsExtensions: true` — Permite importar `.ts`/`.tsx` con extensión.
- `noEmit: true` — No genera archivos JS; Vite se encarga del bundle.

---

## 9. Explicar vite.config.ts

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- `defineConfig` — Función helper con tipado completo.
- `@vitejs/plugin-react` — Plugin oficial para React con HMR ultrarrápido.

---

## 10. Scripts del proyecto

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  }
}
```

- `npm run dev` — Inicia servidor de desarrollo (puerto 5173 por defecto).
- `npm run build` — Compila TS y genera build de producción en `dist/`.
- `npm run preview` — Sirve el build de producción localmente.
- `npm run lint` — Ejecuta ESLint sobre todo el proyecto.

---

## 11. Git init y primer commit

```bash
git init
git add .
git commit -m "chore: initialize TaskFlow with Vite + React + TypeScript"
```

Crear archivo `.gitignore` (Vite ya lo genera automáticamente con node_modules, dist, etc.).
