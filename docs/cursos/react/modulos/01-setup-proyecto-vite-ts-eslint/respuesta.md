---
sidebar_label: "Soluciones"
---

# Soluciones M01 — Setup de Proyecto con Vite + React + TypeScript

## Ejercicio 1: Crear proyecto con Vite + React + TypeScript

**Solución esperada**:

```bash
# Desde la ubicación donde quieras crear el proyecto
npm create vite@latest taskflow -- --template react-ts

# Entrar al directorio
cd taskflow

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abrir `http://localhost:5173` en el navegador.

**Posibles mejoras**:
- Usar `pnpm create vite@latest` en lugar de npm para instalación más rápida y menor uso de disco por el sistema de hard links.
- Agregar flags adicionales al template como `-- --template react-ts --strict` para validación más rigurosa.
- Verificar la versión de Node instalada con `node --version` antes de crear el proyecto, ya que Vite 5+ requiere Node >= 18.

---

## Ejercicio 2: Estructura del proyecto generado

**Solución esperada**:

```
taskflow/
├── index.html            # HTML donde Vite monta React
├── vite.config.ts        # Configuración del bundler Vite
├── tsconfig.json         # Configuración global de TypeScript
├── eslint.config.js      # Reglas de ESLint para linting
├── package.json          # Metadatos, dependencias y scripts
└── src/
    ├── main.tsx          # Punto de entrada: renderiza App en #root
    ├── App.tsx           # Componente raíz de la aplicación
    ├── App.css           # Estilos específicos de App
    ├── index.css         # Estilos globales
    └── vite-env.d.ts     # Tipos de Vite para import.meta.env
```

**Posibles mejoras**:
- Crear un archivo `.env` con `VITE_APP_TITLE=TaskFlow` para variables de entorno tipadas desde el inicio.
- Agregar `src/constants/` y `src/hooks/` al scaffold inicial para fomentar separación de responsabilidades temprana.
- Configurar path aliases en `vite.config.ts` y `tsconfig.json` (`@/` → `src/`) para imports más limpios.

---

## Ejercicio 3: Modificar App.tsx con título

**Solución esperada**:

Archivo `taskflow/src/App.tsx`:

```tsx
function App() {
  return <h1>TaskFlow - Gestor de Tareas</h1>
}

export default App
```

**Posibles mejoras**:
- Tipar el componente con `React.FC` o `() => JSX.Element` para que TypeScript verifique el tipo de retorno.
- Agregar un fragment `<>...</>` o un `<div>` contenedor para facilitar agregar más elementos sin refactorizar.
- Incluir la variable de entorno `import.meta.env.VITE_APP_TITLE` para centralizar textos y facilitar i18n futuro.

---

## Ejercicio 4: Crear estructura de carpetas adicional

**Solución esperada**:

```bash
# Dentro de taskflow/
New-Item -ItemType Directory -Path "src/components/ui" -Force
New-Item -ItemType Directory -Path "src/types" -Force
New-Item -ItemType Directory -Path "src/utils" -Force
```

Resultado esperado:

```
src/
├── components/
│   └── ui/
├── types/
└── utils/
```

**Posibles mejoras**:
- Agregar un archivo `src/types/index.ts` con tipos base (`Task`, `User`) exportados desde un barrel file.
- Crear `src/components/ui/README.md` con la convención de naming (PascalCase para componentes, `index.ts` para barrels).
- Agregar `src/hooks/` y `src/services/` al scaffold para anticipar lógica de negocio y llamadas HTTP.

---

## Ejercicio 5: Inicializar repositorio Git

**Solución esperada**:

```bash
git init
git add .
git commit -m "chore: initialize TaskFlow with Vite + React + TypeScript"
git log --oneline
```

Salida esperada (el hash será diferente):

```
a1b2c3d chore: initialize TaskFlow with Vite + React + TypeScript
```

**Posibles mejoras**:
- Usar conventional commits con scope: `chore(scaffold): initialize TaskFlow with Vite+React+TS`.
- Verificar que `.gitignore` incluya `.env.local`, `.env.*.local`, y `coverage/` antes del primer commit.
- Configurar un pre-commit hook con Husky y lint-staged para correr ESLint y Prettier automáticamente en cada commit.
