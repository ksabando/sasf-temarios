---
sidebar_label: "Clase"
---

﻿# Clase 21 -” Docker en CI/CD

## 1. GitHub Actions
Workflow basico:
```
name: Build and Push Docker Image
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    - name: Login to Docker Hub
      uses: docker/login-action@v3
      with:
        username: `${{ secrets.DOCKER_USER }}
        password: `${{ secrets.DOCKER_PAT }}
    - name: Build and Push
      uses: docker/build-push-action@v5
      with:
        push: true
        tags: usuario/app:latest,usuario/app:`${{ github.sha }}
```

## 2. Cache de Build en CI
cache-from: type=gha
cache-to: type=gha,mode=max

## 3. Multi-platform Builds
platforms: linux/amd64,linux/arm64

## 4. Docker Compose en CI
```
- name: Start services
  run: docker compose up -d
- name: Run tests
  run: docker compose exec app npm test
- name: Shutdown
  run: docker compose down
```

## 5. Kaniko (K8s sin Docker daemon)
Build sin Docker daemon, ideal para entornos restringidos.

## 6. Testcontainers
Testing de integracion con contenedores desde JUnit, TestNG, etc.
