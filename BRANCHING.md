# Branching Strategy

## Ramas activas

| Rama | Propósito | Deploya en |
|------|-----------|-----------|
| `main` | Production-ready | Railway (backend) + Vercel (frontend) |
| `develop` | Integración continua | Vercel Preview URL |
| `feature/*` | Nuevas funciones | Solo local / PR |
| `fix/*` | Bugfixes | Solo local / PR |
| `hotfix/*` | Fixes urgentes en prod | Merge directo a `main` |

## Flujo de trabajo

```
feature/mi-feature  →  develop  →  (PR review)  →  main  →  producción
```

## Comandos útiles

```bash
# Crear feature branch
git checkout develop
git checkout -b feature/nombre-feature

# Finalizar y merge a develop
git commit -am "feat: descripción"
git push origin feature/nombre-feature
# → Crear PR en GitHub: feature/* → develop

# Cuando develop está listo para producción
git checkout main
git merge develop
git push origin main
# → Railway y Vercel auto-despliegan
```

## CI/CD con GitHub Actions

- **Push a `develop`** → CI verifica build + types → Vercel Preview
- **Push a `main`** → CI verifica build + types → Railway + Vercel Production
- **Pull Request** → CI obligatorio antes de merge

## Variables necesarias en GitHub Secrets

Para que CI funcione completamente:
- `VERCEL_TOKEN` (opcional — Vercel ya conecta con GitHub)
- `RAILWAY_TOKEN` (opcional — Railway ya conecta con GitHub)
