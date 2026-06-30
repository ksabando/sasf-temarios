---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Respuestas - Módulo 05

## Respuesta 1
```bash
git log --oneline --graph --all --decorate
# * abc1234 (HEAD -> main) Sexto commit
# * def5678 Quinto commit
# | * fff1111 (feature) Cuarto commit en feature
# |/
# * 9990000 Tercer commit
```

## Respuesta 2
```bash
git blame app.js
# abc1234 (Juan Perez  2024-06-01 10:00:00) function suma() {
# def5678 (Maria Lopez 2024-06-02 14:30:00) function resta() {
```
Cada línea muestra: hash del commit, autor, fecha, y contenido de la línea.

## Respuesta 3
```bash
# En un commit agregar: function calculoComplejo() { return 42; }
git log -S "calculoComplejo" --oneline
# abc1234 Agrega función de cálculo complejo

git show abc1234
# Muestra el diff completo del commit
```

## Respuesta 4
```bash
git tag -a v1.0 -m "Versión 1.0"
# 3 commits más...
git describe
# v1.0-3-gabc1234
# v1.0  → tag más cercano
# 3     → 3 commits después del tag
# g     → prefijo "git"
# abc1234 → hash corto del commit actual
```

## Respuesta 5
```bash
git log --oneline -5  # Hay 5 commits
git reset --hard HEAD~2  # Pierde 2 commits
git reflog
# abc1234 HEAD@{0}: reset: moving to HEAD~2
# def5678 HEAD@{1}: commit: mensaje
# fff1111 HEAD@{2}: commit: otro mensaje

git checkout def5678  # Recupera el commit perdido
```

