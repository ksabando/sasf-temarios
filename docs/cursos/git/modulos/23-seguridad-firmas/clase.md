---
sidebar_label: "Clase"
---

# Seguridad y Firmas en Git

## Introducción
Firmar commits y tags con GPG o SSH garantiza autenticidad e integridad. Git permite verificar quién creó cada commit.

## GPG (GnuPG)

### Generación de clave GPG
```bash
gpg --full-generate-key
```
Seleccionar RSA (4096 bits), validez 2 años, asociar email y nombre.

### Configurar Git para firmar
```bash
git config --global user.signingkey <KEY-ID>
git config --global commit.gpgsign true
```

### Firmar commits
```bash
git commit -S -m "feat: mensaje firmado"
```

### Firmar tags
```bash
git tag -s v1.0.0 -m "Versión 1.0.0 firmada"
```

### Verificar firmas
```bash
git log --show-signature
git verify-commit HEAD
git verify-tag v1.0.0
```

## SSH Signing
Alternativa moderna a GPG, usando pares de llaves SSH existentes.

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git commit -S -m "commit firmado con SSH"
```

Agregar la clave pública SSH a GitHub para que muestre "Verified".

## Verificación en GitHub
Los commits firmados muestran un badge **Verified**. GitHub acepta tanto GPG como SSH signing.

## Buenas Prácticas de Seguridad

### Generación de llaves seguras
```bash
ssh-keygen -t ed25519 -C "email@example.com"
```

### Secret Scanning
GitHub escanea repositorios en busca de tokens, API keys y secrets. Notifica al instante si se detecta alguno.

### Dependabot
Herramienta que monitorea dependencias con vulnerabilidades conocidas y genera PRs automáticos para actualizarlas.

### CodeQL
Análisis estático de código que detecta vulnerabilidades de seguridad en el código fuente del repositorio.
