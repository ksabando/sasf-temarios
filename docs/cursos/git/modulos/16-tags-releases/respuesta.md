---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Respuestas - Módulo 16

## Respuesta 1
```bash
git init
echo "# Proyecto" > README.md && git add . && git commit -m "Commit 1"
echo "a" > a.txt && git add . && git commit -m "Commit 2"
echo "b" > b.txt && git add . && git commit -m "Commit 3"
git tag v1.0.0 HEAD~2            # Lightweight en commit 1
git tag -a v2.0.0 -m "Versión mayor" HEAD  # Annotated
git show v1.0.0
git show v2.0.0
```

## Respuesta 2
```bash
git push origin v2.0.0           # Sube solo v2.0.0
git push --tags                  # Sube el resto (v1.0.0)
```

## Respuesta 3
```bash
git tag -d v1.0.0                # Elimina local
git push origin --delete v2.0.0  # Elimina remoto
git tag                          # Verifica que v1.0.0 ya no aparece
git ls-remote --tags origin      # Verifica remoto
```

## Respuesta 4
Desde GitHub.com: Ir a "Releases" > "Create a new release". Elegir el tag `v2.0.0`. Escribir título "v2.0.0" y notas de versión. Publicar.

## Respuesta 5
```bash
gpg --full-generate-key          # Generar clave (si no existe)
git tag -s v3.0.0 -m "Firmado"
git tag -v v3.0.0                # Verifica la firma
```

