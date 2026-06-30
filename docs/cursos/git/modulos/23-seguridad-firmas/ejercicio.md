---
sidebar_label: "Ejercicio"
---

# Ejercicios - Módulo 23

## Ejercicio 1: Generar clave GPG
Genera un par de claves GPG (RSA 4096 bits). Lista las claves con `gpg --list-secret-keys` y obtén el KEY-ID.

## Ejercicio 2: Firmar y verificar commit
Configura Git para usar la clave GPG. Realiza un commit firmado con `-S`. Verifica la firma con `git log --show-signature`.

## Ejercicio 3: Firmar tag y verificar
Crea un tag firmado con `-s`. Verifica el tag con `git verify-tag`.

## Ejercicio 4: Configurar SSH signing
Configura Git para usar SSH signing con tu clave ed25519. Realiza un commit firmado y verifica la firma.

## Ejercicio 5: Secret Scanning simulado
Crea un archivo con un token falso (`GH_TOKEN=falso_token_123`). Haz commit y push. Observa la advertencia de GitHub secret scanning (o simula localmente con `gitleaks`).
