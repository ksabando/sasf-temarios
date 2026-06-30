---
sidebar_label: "Clase"
---

# Clase 02 - Instalación y Configuración Inicial

## 1. Instalación de Git

### Windows
- **Git Bash**: Terminal tipo Unix con Git incluido
- **Git GUI**: Interfaz gráfica básica
- Descargar desde: https://git-scm.com/download/win
- También vía winget: `winget install --id Git.Git -e --source winget`

### macOS
- Via Homebrew: `brew install git`
- Via Xcode: `xcode-select --install`
- Instalador desde git-scm.com

### Linux
- Debian/Ubuntu: `sudo apt install git`
- RHEL/CentOS/Fedora: `sudo yum install git` o `sudo dnf install git`

## 2. Niveles de Configuración

```
git config --system    # /etc/gitconfig (todos los usuarios)
git config --global    # ~/.gitconfig (usuario actual)
git config --local     # .git/config (repositorio actual)
```

La precedencia es: local > global > system

## 3. Configuración Esencial

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
git config --global core.editor "code --wait"
```

### core.autocrlf (Salto de línea)

| Sistema | Configuración |
|---|---|
| Windows | `git config --global core.autocrlf true` |
| macOS/Linux | `git config --global core.autocrlf input` |

- **true**: Convierte CRLF a LF al commit, LF a CRLF al checkout
- **input**: Convierte CRLF a LF al commit, no convierte al checkout
- **false**: No realiza conversión

## 4. Alias de Git

Los alias permiten crear atajos para comandos frecuentes:

```bash
git config --global alias.lg "log --oneline --graph --all --decorate"
git config --global alias.s "status --short"
git config --global alias.df "diff"
git config --global alias.ci "commit"
git config --global alias.co "checkout"
git config --global alias.br "branch"
```

## 5. Generación de Clave SSH

```bash
ssh-keygen -t ed25519 -C "tu@email.com"
# Por defecto se guarda en ~/.ssh/id_ed25519.pub
```

### Agregar la clave al agente SSH
```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### Configurar en GitHub/GitLab
1. Copiar el contenido de `~/.ssh/id_ed25519.pub`
2. GitHub: Settings → SSH and GPG Keys → New SSH Key
3. GitLab: Preferences → SSH Keys

## 6. Verificación de Configuración

```bash
git config --list
git config --list --show-origin  # Muestra el archivo de origen
```
