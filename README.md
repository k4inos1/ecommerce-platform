<div align="center">

# 🛍️ TechStore — E-Commerce Platform

**Full-stack e-commerce with Node.js, Express, MongoDB & Next.js**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Stripe](https://img.shields.io/badge/Stripe-008CDD?style=flat-square&logo=stripe&logoColor=white)](https://stripe.com)

</div>

---

## 🏗️ Arquitectura

```
ecommerce-platform/
├── backend/                    # REST API (Puerto :4000)
│   └── src/
│       ├── models/             ← User, Product, Order (Mongoose)
│       ├── routes/             ← /auth /products /orders
│       ├── middleware/         ← JWT protect + adminOnly guard
│       ├── config/             ← seed.ts (datos demo)
│       └── index.ts            ← Express entry point
└── frontend/                   # Next.js App (Puerto :3000)
    └── app/
        ├── page.tsx            ← Homepage premium
        ├── products/           ← Listing + filtros + búsqueda
        ├── products/[id]/      ← Detalle con galería y ratings
        ├── cart/               ← Carrito con qty controls
        └── checkout/           ← Formulario + Stripe checkout
```

## ✨ Features

| Módulo | Tecnología | Descripción |
|--------|-----------|-------------|
| 🔐 Auth | JWT + bcrypt | Registro, login, roles admin/user |
| 📦 Productos | MongoDB + text index | CRUD, búsqueda full-text, paginación |
| 🛒 Carrito | React Context + localStorage | Persistente entre sesiones |
| 💳 Checkout | Stripe (simulado) | Formulario completo con animación de pago |
| 🗄️ Base de datos | MongoDB + Mongoose | Modelos tipados con TypeScript |
| 📱 UI | Next.js 15 + Tailwind | Dark mode premium, responsive |

## 🚀 Inicio Rápido

### 1. Requisitos
```
Node.js >= 18
MongoDB >= 6 (local o MongoDB Atlas)
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env       # Editar las variables
npm run dev                # Arranca en :4000
```

### 3. Seed de datos demo
```bash
cd backend
npx ts-node src/config/seed.ts
# Crea 8 productos + admin@techstore.cl (admin123456) + user@test.cl (user123456)
```

### 4. Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local   # Editar NEXT_PUBLIC_API_URL
npm run dev                        # Arranca en :3000
```

## 🔑 Variables de Entorno

### Backend — `.env`
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=cambiar-en-produccion-con-valor-aleatorio-largo
STRIPE_SECRET_KEY=sk_test_...
CLIENT_URL=http://localhost:3000
```

### Frontend — `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_STRIPE_KEY=pk_test_...
```

## 📡 API — Endpoints

<details>
<summary><b>🔐 Autenticación</b></summary>

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Crear cuenta |
| `POST` | `/api/auth/login` | ❌ | Login → JWT |

</details>

<details>
<summary><b>📦 Productos</b></summary>

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/products` | ❌ | Listar (paginado, filtros) |
| `GET` | `/api/products/:id` | ❌ | Detalle |
| `POST` | `/api/products` | 🔑 Admin | Crear |
| `PUT` | `/api/products/:id` | 🔑 Admin | Actualizar |
| `DELETE` | `/api/products/:id` | 🔑 Admin | Eliminar |

**Query params:** `?search=laptop&category=Laptops&page=1&limit=12`

</details>

<details>
<summary><b>📋 Órdenes</b></summary>

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/orders` | 🔑 User | Crear orden |
| `GET` | `/api/orders/my` | 🔑 User | Mis órdenes |
| `GET` | `/api/orders/:id` | 🔑 User/Admin | Detalle |
| `PATCH` | `/api/orders/:id/status` | 🔑 Admin | Actualizar estado |
| `GET` | `/api/orders` | 🔑 Admin | Todas las órdenes |

</details>

## 👨‍💻 Autor

**Ricardo Sanhueza** — Full Stack Developer  
📍 Concepción, Chile | 📧 ricardosanhuezaacuna@gmail.com  
🔗 [Portfolio](https://v0-k4inos1.vercel.app) · [GitHub](https://github.com/k4inos1)
