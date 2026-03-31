# Contribuir a TechStore

¡Gracias por tu interés en contribuir! Este documento describe el flujo de trabajo recomendado para mantener el proyecto consistente y fácil de mantener.

## Requisitos

- Node.js >= 20
- npm >= 10

## Configuración rápida

```bash
npm install
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

## Flujo de trabajo

1. Crea una rama desde `develop` (o `master` si `develop` no existe).
2. Haz cambios pequeños y enfocados.
3. Asegúrate de que el backend y frontend construyen correctamente:
   ```bash
   npm run build --workspace=backend
   npm run build --workspace=frontend
   ```
4. Abre un Pull Request con un resumen claro de los cambios.

## Estilo y buenas prácticas

- Mantén consistencia con el estilo existente del proyecto.
- Evita cambios no relacionados con el objetivo del PR.
- Documenta cambios relevantes en el README o en este archivo cuando sea necesario.

## Reporte de problemas

Si encuentras un bug o un problema de seguridad, abre un issue con pasos claros para reproducirlo y el comportamiento esperado.
