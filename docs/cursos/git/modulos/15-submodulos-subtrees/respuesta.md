---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Respuestas - Módulo 15

## Respuesta 1
```bash
mkdir proyecto && cd proyecto && git init
git submodule add https://github.com/octocat/Hello-World.git hello
git status  # .gitmodules y directorio hello aparecen
cat .gitmodules  # [submodule "hello"] path y url
git add . && git commit -m "agregar submódulo Hello-World"
```

## Respuesta 2
```bash
cd ..
git clone --recurse-submodules ./proyecto proyecto-clon
cd proyecto-clon
ls hello/  # debe contener los archivos del submódulo
```

## Respuesta 3
```bash
cd proyecto
git submodule update --remote
cd hello && git log --oneline -1  # último commit remoto
cd ..
git status  # submódulo modificado, requiere commit
```

## Respuesta 4
```bash
git remote add origin https://github.com/usuario/proyecto.git  # si hace falta
git subtree add --prefix=lib/hello https://github.com/octocat/Hello-World.git main --squash
ls lib/hello/  # archivos integrados
# No hay .gitmodules, todo está en el mismo repositorio
```

## Respuesta 5
```bash
echo "SUBMODULE: .gitmodules creado, directorio hello es referencia a hash,
no modifica directamente. SUBTREE: sin archivo extra, código copiado,
modificable directamente, historia integrada con --squash." > comparacion.txt
```

