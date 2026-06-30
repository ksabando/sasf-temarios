---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Respuestas - Módulo 06

## Respuesta 1
```bash
git init repo-ej1 && cd repo-ej1
git branch feature/login
git branch feature/logout
git branch bugfix/error-500
git switch feature/login
git checkout feature/logout
git switch bugfix/error-500
```
Se crean tres ramas desde el commit actual y se cambia entre ellas.

## Respuesta 2
```bash
git switch -c feature/add-readme
echo "# Proyecto" > README.md
git add README.md && git commit -m "Add README"
git switch main
git merge feature/add-readme  # fast-forward
```
Al no haber nuevos commits en `main`, Git mueve el puntero directamente.

## Respuesta 3
```bash
git switch -c feature/navbar
# hacer commit en feature/navbar
git switch main
echo "cambio" > main.txt && git add . && git commit -m "Cambio en main"
git merge feature/navbar
git log --graph --oneline
```
Aparece un commit de merge con dos padres.

## Respuesta 4
```bash
git branch -u origin/main feature/local
git branch -vv
```
Muestra `[origin/main]` indicando la rama de seguimiento.

## Respuesta 5
```bash
git switch -c feature/card
echo "card" > card.txt && git add . && git commit -m "Add card"
git switch main
git merge --no-ff feature/card
git log --graph --oneline
```
Con `--no-ff` siempre se crea un commit de merge, preservando la rama.

