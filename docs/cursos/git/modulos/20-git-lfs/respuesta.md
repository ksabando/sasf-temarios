---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Respuestas - Módulo 20

## Respuesta 1
```bash
git lfs install
git lfs version   # Verificar versión instalada
```

## Respuesta 2
```bash
git init
git lfs track "*.psd"
git lfs track "*.zip"
cat .gitattributes
# *.psd filter=lfs diff=lfs merge=lfs -text
# *.zip filter=lfs diff=lfs merge=lfs -text
```

## Respuesta 3
```bash
echo "simulando psd" > imagen.psd
git add imagen.psd .gitattributes
git commit -m "Agrega archivo LFS"
git push origin main
git lfs ls-files
# imagen.psd
```

## Respuesta 4
```bash
git clone <url> repo-lfs
cd repo-lfs
git lfs pull
# o al clonar:
git lfs clone <url> repo-lfs   # (obsoleto, usar GIT_LFS_SKIP_SMUDGE=0)
```

## Respuesta 5
```bash
git init
echo "dummy iso content" > archivo.iso
git add . && git commit -m "Commit normal con iso"
git lfs migrate import --include="*.iso" --everything
git lfs ls-files --all
```

