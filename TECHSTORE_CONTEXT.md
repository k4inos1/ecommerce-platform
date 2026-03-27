# TechStore E-Commerce — Contexto y Plan Maestro

Este documento centraliza el estado actual, la arquitectura y la hoja de ruta del proyecto para facilitar el desarrollo en VS Code.

## 🚀 Stack Tecnológico

### Frontend (Next.js 15+)
- **Framework**: Next.js con App Router.
- **Estilos**: Tailwind CSS con diseño "Glassmorphism" y modo oscuro premium.
- **Iconografía**: Lucide React.
- **Estado**: Context API (`CartContext`) para persistencia del carrito.
- **Despliegue**: Vercel.

### Backend (Node.js & Express)
- **Lenguaje**: TypeScript.
- **Base de Datos**: MongoDB Atlas (Mongoose).
- **Autenticación**: Passport.js (Local, Google OAuth, Facebook OAuth) + JWT.
- **Servicios**: 
  - **Nodemailer**: Correos oficiales y recuperación de contraseñas.
  - **Cloudinary**: Almacenamiento CDN para imágenes de productos.
  - **Stripe / Transbank**: Pasarelas de pago configuradas.
- **Despliegue**: Railway.

---

## 🛠️ Características Implementadas (Estado Actual)

1.  **Autenticación Robusta**: Login/Registro local y vía OAuth (Google/FB) con manejo de errores para producción.
2.  **Panel de Perfil**: `/profile` permite gestionar direcciones de envío y teléfonos (Sincronizado con MongoDB).
3.  **Gestión de Productos**: Admin Dashboard para crear, editar y eliminar productos con subida de imágenes a la nube.
4.  **Sistema de Reseñas**: Calificaciones de 1-5 estrellas y comentarios, protegidos por sesión de usuario.
5.  **Recuperación de Cuenta**: Flujo completo de "Olvidé mi contraseña" con tokens criptográficos temporales y envío de mails corporativos.

---

## 📋 Plan de Implementación: Sprint 4.0 ✅ Completado

### Meta: Monetización y Dashboards de Usuario

1.  **Pagos Integrados** ✅:
    - `POST /api/orders/stripe`: Checkout internacional con tarjeta (Stripe Checkout Session).
    - `POST /api/orders/transbank`: Botón de pago WebPay Plus (Débito/Crédito Chile) con confirmación en `/checkout/transbank-result`.
2.  **Dashboard de Órdenes (Cliente)** ✅:
    - Página `/mis-ordenes` con estado de tracking (`pending`, `processing`, `shipped`, `delivered`, `cancelled`), progress bar visual y detalle expandible de cada orden.
3.  **Analíticas Administrativas** ✅:
    - Gráficos de ventas (14 días / 7 semanas), donut chart por estado, productos más vendidos y KPIs en `/admin/analytics`.
4.  **Filtros de Búsqueda** ✅:
    - Búsqueda por rango de precios (`minPrice`/`maxPrice`) y categorías en el catálogo principal `/products`.
    - Botón "Filtros" con presets rápidos (< $100, $100–500, > $500) y limpieza automática.

---

## ✅ Checklist de Verificación Diario
- [x] Backend: `npm run build` (Sin errores de TS).
- [x] Frontend: `npm run build` (Sin errores de lint/build).
- [x] Git: Commits atómicos (Daily target: ~30 commits de calidad).
- [x] Estabilidad: Variables de entorno verificadas en Railway/Vercel.
