# E-Commerce Platform 🛍️

Proyecto Full-Stack de comercio electrónico desarrollado por **Ricardo Sanhueza**.

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend API | Node.js + Express + TypeScript |
| Base de datos | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| Frontend | Next.js 14 + Tailwind CSS |
| Pagos | Stripe (simulado) |

## Estructura del Monorepo

```
ecommerce-platform/
├── backend/          # REST API (Puerto 4000)
│   ├── src/
│   │   ├── models/   # User, Product, Order
│   │   ├── routes/   # auth, products, orders
│   │   ├── middleware/ # JWT auth guard
│   │   └── index.ts  # Entry point
│   └── .env.example
└── frontend/         # Next.js App (Puerto 3000)
    ├── app/
    ├── components/
    └── context/
```

## Endpoints de la API

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Login + JWT |

### Products
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/products` | Listar (con búsqueda y paginación) |
| GET | `/api/products/:id` | Detalle de producto |
| POST | `/api/products` | Crear (Admin) |
| PUT | `/api/products/:id` | Actualizar (Admin) |
| DELETE | `/api/products/:id` | Eliminar (Admin) |

### Orders
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/orders` | Crear orden |
| GET | `/api/orders/my` | Mis órdenes |
| GET | `/api/orders/:id` | Detalle de orden |
| PATCH | `/api/orders/:id/status` | Actualizar estado (Admin) |
| GET | `/api/orders` | Todas las órdenes (Admin) |

## Instalación Rápida

```bash
# Instalar dependencias del backend
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

## Variables de Entorno

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=tu_secreto_seguro
STRIPE_SECRET_KEY=sk_test_...
CLIENT_URL=http://localhost:3000
```
