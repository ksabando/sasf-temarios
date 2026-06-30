---
private: true
sidebar_class_name: private
sidebar_label: "Soluciones"
---

# Respuestas - Módulo 23

## Respuesta 1
```bash
gpg --full-generate-key
# Tipo: RSA, 4096 bits, validez 2y, nombre, email
gpg --list-secret-keys --keyid-format LONG
# La salida muestra sec:   rsa4096/KEY-ID ...
```

## Respuesta 2
```bash
git config --global user.signingkey KEY-ID
echo "contenido" > archivo.txt && git add .
git commit -S -m "feat: primer commit firmado"
git log --show-signature
```

## Respuesta 3
```bash
git tag -s v1.0.0 -m "Tag firmado"
git verify-tag v1.0.0
gpg --verify v1.0.0  # Alternativa directa
```

## Respuesta 4
```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
echo "test" > s.txt && git add .
git commit -S -m "commit firmado con SSH"
git log --show-signature  # Muestra "Good "git" signature"
```

## Respuesta 5
```bash
echo "GH_TOKEN=ghp_falso_token_abc123" > .env
git add .env && git commit -m "agrego .env con token"
git push
# GitHub secret scanning detecta el patrón y envía alerta
# Para limpiar: git filter-repo para eliminar el token del historial
```

