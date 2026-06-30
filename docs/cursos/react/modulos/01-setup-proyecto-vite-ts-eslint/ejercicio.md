---
sidebar_label: "Ejercicio"
---

### Ejercicio 2: Explorar la estructura de carpetas

Lista el contenido del proyecto y escribe una breve explicación (1 línea cada uno) de los siguientes archivos:

- `index.html`
- `src/main.tsx`
- `src/App.tsx`
- `vite.config.ts`
- `tsconfig.json`
- `eslint.config.js`
- `package.json`

**Pista:** `tree /F` en Windows o `Get-ChildItem -Recurse` en PowerShell.

---

### Ejercicio 3: Modificar App.tsx

Cambia el componente `App.tsx` para que muestre:

```tsx
<h1>TaskFlow - Gestor de Tareas</h1>
```

Verifica que el cambio se refleje automáticamente en el navegador gracias al HMR.

---

### Ejercicio 4: Crear estructura de carpetas auxiliares

Dentro de `src/`, crea las siguientes carpetas:

```
src/
├── components/
│   └── ui/
├── types/
└── utils/
```

---

### Ejercicio 5: Inicializar Git y hacer commit

```bash
git init
git add .
git commit -m "chore: initialize TaskFlow with Vite + React + TypeScript"
```

**Objetivo:** Verificar con `git log --oneline` que el commit se creó correctamente.
