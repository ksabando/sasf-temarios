---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Respuestas - Módulo 04

## Respuesta 1
```bash
echo "contenido" > archivo.txt        # Untracked
git status                            # Untracked files
git add archivo.txt                   # Staged
git status                            # Changes to be committed
git commit -m "Agrega archivo.txt"    # Unmodified
echo "nuevo" >> archivo.txt           # Modified
git status                            # Changes not staged
git add archivo.txt && git commit -m "Actualiza archivo"
```

## Respuesta 2
```bash
cat > codigo.txt << EOF
function suma(a, b) { return a + b; }

function resta(a, b) { return a - b; }

function mult(a, b) { return a * b; }
EOF
git add -p codigo.txt
# Seleccionar y (yes) para suma, n (no) para resta, y para mult
git diff --staged  # Solo muestra suma y mult
```

## Respuesta 3
```
# .gitignore
*.log
node_modules/
.env
*.exe
```
Crear archivos de prueba:
```bash
echo "log" > app.log
mkdir node_modules
echo "env" > .env
git status  # No debe mostrar los archivos ignorados
```

## Respuesta 4
```bash
echo "archivo1" > a.txt
echo "archivo2" > b.txt
git add a.txt && git commit -m "Agrega archivo"
git add b.txt
git commit --amend --no-edit
git log --oneline  # Un solo commit con ambos archivos
```

## Respuesta 5
```bash
git commit -m "feat: agregar autenticación de usuarios

Implementa login con JWT y middleware de verificación."

git commit -m "fix: corregir error en cálculo de totales

Se corrigió la fórmula de cálculo de IVA en el módulo de facturación."

git shortlog -sn
# 2  Juan Perez
```

