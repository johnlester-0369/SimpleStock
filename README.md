# SimpleStock Monorepo

<div align="center">

<img src="packages/web/public/favicon.svg" alt="SimpleStock" width="80" />

**A modern, full-stack inventory management system**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Private-red)](LICENSE)

### 🚀 [**Try the Live Demo →**](https://johnlester-0369.github.io/SimpleStock)

[Overview](#-overview) • [Live Demo](#-live-demo) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Commands](#-make-commands) • [Packages](#-packages)

</div>

---

## 📖 Overview

SimpleStock is a production-ready inventory management system built as a monorepo with two main packages:

| Package | Description | Stack |
|---------|-------------|-------|
| **[web](./packages/web/)** | React SPA frontend | React 19, Vite 7, Tailwind CSS, Chart.js |
| **[server](./packages/server/)** | Express REST API backend | Express 4, MongoDB, Mongoose 9, Winston |

### Key Features

- 📦 **Product Management** - Full CRUD with stock tracking and low-stock alerts
- 💰 **Sales Transactions** - Record sales with automatic inventory updates
- 👥 **Supplier Directory** - Manage vendor contacts and information
- 📊 **Analytics Dashboard** - Sales charts, statistics, and reports
- 🔐 **Authentication** - Session-based auth with better-auth
- 🎮 **Demo Mode** - Try without backend using localStorage

---

## 🎮 Live Demo

Experience SimpleStock without any setup:

### **[👉 https://simplestock-demo.onrender.com](https://simplestock-demo.onrender.com)**

**Demo Credentials:**
| Field | Value |
|-------|-------|
| Email | `demo@simplestock.com` |
| Password | `demo123456` |

> **Note:** The live demo runs in localStorage mode - all data is stored in your browser and persists across sessions. No backend server is required.

### Demo Features
- ✅ Full product management (add, edit, delete, sell)
- ✅ Supplier directory management
- ✅ Transaction history tracking
- ✅ Dashboard with charts and analytics
- ✅ Responsive design for mobile and desktop

---

## 🚀 Quick Start

### Option 1: Try the Live Demo (No Setup Required)

Visit **[https://simplestock-demo.onrender.com](https://simplestock-demo.onrender.com)** and login with:
- **Email:** `demo@simplestock.com`
- **Password:** `demo123456`

### Option 2: Full Stack (Recommended for Development)

```bash
# Clone and navigate to project root
cd SimpleStock

# Install all dependencies
make install

# Configure server environment
cp packages/server/.env.example packages/server/.env
# Edit packages/server/.env with your MongoDB credentials

# Seed admin user (optional)
make seed-admin

# Start both servers
make dev
```

**Access Points:**
- 🌐 **Web UI:** http://localhost:5173
- 🔌 **API Server:** http://localhost:3000
- ❤️ **Health Check:** http://localhost:3000/health

### Option 3: Local Demo Mode (No Backend)

```bash
cd SimpleStock/packages/web
npm install
npm run dev:demo
```

**Demo Credentials:**
```
Email:    demo@simplestock.com
Password: demo123456
```

### Option 4: Manual Setup

```bash
# Terminal 1: Start server
cd SimpleStock/packages/server
npm install
cp .env.example .env
# Configure .env
npm run dev

# Terminal 2: Start web
cd SimpleStock/packages/web
npm install
npm run dev
```

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                    │
│                    (Browser / Mobile / API Consumer)                    │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           WEB PACKAGE                                  │
│                        (React 19 + Vite 7)                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Pages     │  │  Components │  │   Hooks     │  │  Services   │    │
│  │  Dashboard  │  │     UI      │  │ useProducts │  │  API/Local  │    │
│  │  Products   │  │   Layout    │  │ useSupplier │  │   Client    │    │
│  │  Reports    │  │   Common    │  │ useTrans... │  │             │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────┬──────┘    │
│                                                            │           │
│  Vite Dev Proxy: /api/* ──────────────────────────────────►│           │
└────────────────────────────────────────────────────────────┼───────────┘
                                                             │
                              ┌──────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          SERVER PACKAGE                                │
│                       (Express 4 + MongoDB)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Routes    │  │ Controllers │  │  Services   │  │   Repos     │    │
│  │  /products  │──│  Product    │──│  Product    │──│  Product    │    │
│  │  /suppliers │  │  Supplier   │  │  Supplier   │  │  Supplier   │    │
│  │  /transact  │  │ Transaction │  │ Transaction │  │ Transaction │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────┬──────┘    │
│                                                            │           │
│  ┌─────────────────────────────────────────────────────────┘           │
│  │                                                                     │
│  ▼                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         DATABASE LAYER                          │   │
│  │  ┌──────────────────┐              ┌──────────────────────┐     │   │
│  │  │   MongoClient    │              │      Mongoose        │     │   │
│  │  │  (better-auth)   │              │   (ODM Operations)   │     │   │
│  │  │                  │              │                      │     │   │
│  │  │  • user          │              │  • Product Model     │     │   │
│  │  │  • session       │              │  • Supplier Model    │     │   │
│  │  │  • verification  │              │  • Transaction Model │     │   │
│  │  └────────┬─────────┘              └──────────┬───────────┘     │   │
│  │           │                                   │                 │   │
│  │           └───────────────┬───────────────────┘                 │   │
│  │                           ▼                                     │   │
│  │                  ┌─────────────────┐                            │   │
│  │                  │    MongoDB      │                            │   │
│  │                  │  (Atlas/Local)  │                            │   │
│  │                  └─────────────────┘                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### API Endpoints

| Category | Base Path | Description |
|----------|-----------|-------------|
| **Auth** | `/api/v1/admin/auth/*` | Authentication (better-auth) |
| **Products** | `/api/v1/admin/products` | Product CRUD + sell |
| **Suppliers** | `/api/v1/admin/suppliers` | Supplier CRUD |
| **Transactions** | `/api/v1/admin/transactions` | Transaction queries |

### Data Flow

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  React Hook  │────▶│   Service     │────▶│  API Client  │
│ useProducts  │      │productService│      │  fetch/axios │
└──────────────┘      └──────────────┘      └──────┬───────┘
                                                   │
                     ┌─────────────────────────────┘
                     │ HTTP Request
                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│    Route     │────▶│  Controller   │────▶│   Service    │
│   Handler    │      │ parseRequest │      │ businessLogic│
└──────────────┘      └──────────────┘      └──────┬───────┘
                                                   │
                                                   ▼
                     ┌──────────────┐      ┌──────────────┐
                     │  Repository  │────▶│   MongoDB     │
                     │  dataAccess  │      │   Database   │
                     └──────────────┘      └──────────────┘
```

### Authentication Flow

```
┌─────────┐     ┌─────────────┐     ┌──────────────┐      ┌─────────┐
│  Login  │───▶│ AuthContext  │───▶│ AuthClient   │───▶ │ better-  │
│  Page   │     │  Provider   │     │ (API/Local)  │      │  auth   │
└─────────┘     └──────┬──────┘     └──────────────┘      └───┬─────┘
                       │                                      │
                       ▼                                      ▼
               ┌─────────────┐                        ┌─────────────┐
               │   Route     │                        │   MongoDB   │
               │   Guards    │                        │  Sessions   │
               │ Protected/  │                        │             │
               │   Public    │                        └─────────────┘
               └─────────────┘
```

---

## 📋 Make Commands

All commands are run from the `SimpleStock/` directory (project root).

### Installation

| Command | Description |
|---------|-------------|
| `make install` | Install dependencies for all packages |
| `make install-web` | Install web package dependencies only |
| `make install-server` | Install server package dependencies only |

### Development

| Command | Description |
|---------|-------------|
| `make dev` | Start both web and server concurrently |
| `make dev-web` | Start web frontend only (port 5173) |
| `make dev-server` | Start server backend only (port 3000) |
| `make dev-demo` | Start web in demo mode (localStorage) |

### Build & Production

| Command | Description |
|---------|-------------|
| `make build` | Build both packages for production |
| `make build-web` | Build web package |
| `make build-server` | Build server package |
| `make build-demo` | Build web in demo mode |
| `make start` | Start server in production mode |
| `make preview` | Preview web production build |
| `make preview-demo` | Preview demo production build |

### Code Quality

| Command | Description |
|---------|-------------|
| `make lint` | Run ESLint on all packages |
| `make lint-web` | Lint web package |
| `make lint-server` | Lint server package |
| `make format` | Format server code with Prettier |

### Testing

| Command | Description |
|---------|-------------|
| `make test` | Run web tests once |
| `make test-watch` | Run web tests in watch mode |
| `make test-coverage` | Run web tests with coverage report |

### Database & Utilities

| Command | Description |
|---------|-------------|
| `make seed-admin` | Create initial admin user |
| `make clean` | Remove all build artifacts and node_modules |
| `make clean-web` | Clean web package only |
| `make clean-server` | Clean server package only |
| `make check` | Verify required tools are installed |
| `make status` | Show project installation status |

### Quick Reference

```bash
# Full development setup
make install && make dev

# Demo mode (no backend needed)
make install-web && make dev-demo

# Production build
make build && make start

# Run tests
make test-coverage
```

---

## 📦 Packages

### Web Package (`packages/web/`)

Modern React SPA with comprehensive UI component library.

**Stack:**
- React 19.2 with TypeScript 5.9
- Vite 7.2 for blazing-fast builds
- Tailwind CSS 3.4 for styling
- Chart.js for data visualization
- React Router 7 for navigation
- Zod for form validation
- Vitest + Testing Library for testing

**Key Features:**
- 🎨 Custom UI component library (Button, Card, Dialog, Table, etc.)
- 📊 Interactive dashboard with charts
- 🔄 Dual data source (API/localStorage)
- 📱 Responsive mobile-first design
- ✅ Comprehensive test coverage

📖 **[Full Documentation →](./packages/web/README.md)**

---

### Server Package (`packages/server/`)

RESTful API backend with layered architecture.

**Stack:**
- Express 4.21 with TypeScript 5.9
- MongoDB 7.0 + Mongoose 9.0
- better-auth for authentication
- Winston for logging
- Zod for validation

**Key Features:**
- 🔐 Session-based authentication with admin roles
- 📊 Dual database strategy (MongoClient + Mongoose)
- ✅ Comprehensive input validation
- 📝 Structured logging with Winston
- ⚡ Graceful shutdown handling

📖 **[Full Documentation →](./packages/server/README.md)**

---

## 🔧 Configuration

### Environment Files

| File | Package | Purpose |
|------|---------|---------|
| `packages/server/.env` | Server | Database, auth, logging config |
| `packages/web/.env.development` | Web | Development settings |
| `packages/web/.env.production` | Web | Production settings |
| `packages/web/.env.demo` | Web | Demo mode settings |

### Server Configuration

```bash
# packages/server/.env
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb+srv://user:<PASSWORD>@cluster.mongodb.net
MONGO_PASSWORD=your-password
DATABASE_NAME=simplestock

# Authentication
BASE_URL=http://localhost:3000
AUTH_SECRET_USER=your-32-char-secret-key
TRUSTED_ORIGINS=http://localhost:3000,http://localhost:5173

# Logging
LOG_LEVEL=info
```

### Web Configuration

```bash
# packages/web/.env.development
VITE_DATA_SOURCE=api

# packages/web/.env.demo
VITE_DATA_SOURCE=local
```

### Proxy Configuration

The Vite dev server proxies API requests to the backend:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

---

## 🛠️ Development Workflow

### Daily Development

```bash
# Start everything
make dev

# Or in separate terminals for better logs
make dev-server  # Terminal 1
make dev-web     # Terminal 2
```

### Testing Changes

```bash
# Run tests
make test

# Watch mode during development
make test-watch

# Check coverage before PR
make test-coverage
```

### Code Quality

```bash
# Lint all code
make lint

# Format server code
make format
```

### Building for Production

```bash
# Build both packages
make build

# Test production build locally
make preview
```

---

## 📊 Technology Stack

### Frontend (Web)

| Category | Technology | Version |
|----------|------------|---------|
| Framework | React | 19.2 |
| Language | TypeScript | ~5.9.3 |
| Build Tool | Vite | 7.2 |
| Styling | Tailwind CSS | 3.4 |
| Routing | React Router | 7.10 |
| Charts | Chart.js | 4.5 |
| Auth Client | better-auth | 1.4 |
| Validation | Zod | 4.1 |
| Icons | Lucide React | 0.555 |
| Testing | Vitest | 4.0 |

### Backend (Server)

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Express | 4.21 |
| Language | TypeScript | ~5.9.3 |
| Database | MongoDB | 7.0 |
| ODM | Mongoose | 9.0 |
| Auth | better-auth | 1.4 |
| Validation | Zod | 4.3 |
| Logging | Winston | 3.19 |
| Dev Runner | tsx | 4.21 |

---

## 🔐 Security

### Authentication
- Session-based with HTTP-only cookies
- Role-based access control (user/admin)
- Rate limiting on auth endpoints
- Configurable session expiry

### Data Protection
- All inputs validated with Zod schemas
- Parameterized database queries
- Environment variables for secrets
- Password hashing via bcrypt

### API Security
- CORS with trusted origins
- Request logging for audit trails
- Generic error messages to clients
- Authentication middleware on protected routes

---

## 📁 Project Structure

```
SimpleStock/
├── Makefile                    # Orchestration commands
├── README.md                   # This file
└── packages/
    ├── server/                 # Backend API
    │   ├── src/
    │   │   ├── config/         # Environment configuration
    │   │   ├── controllers/    # HTTP request handlers
    │   │   ├── lib/            # Core libraries (auth, db)
    │   │   ├── middleware/     # Express middleware
    │   │   ├── models/         # Mongoose schemas
    │   │   ├── repos/          # Data access layer
    │   │   ├── routes/         # API route definitions
    │   │   ├── services/       # Business logic
    │   │   ├── shared/         # Shared utilities (errors)
    │   │   ├── types/          # TypeScript declarations
    │   │   ├── utils/          # Utilities (logger)
    │   │   ├── validators/     # Zod schemas
    │   │   ├── app.ts          # Express app factory
    │   │   └── server.ts       # Entry point
    │   ├── scripts/            # Utility scripts
    │   ├── .env.example        # Environment template
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── README.md           # Server documentation
    └── web/                    # Frontend SPA
        ├── public/             # Static assets
        ├── src/
        │   ├── assets/         # App assets
        │   ├── components/     # React components
        │   │   ├── common/     # Shared components
        │   │   ├── layout/     # Layout components
        │   │   └── ui/         # UI component library
        │   ├── constants/      # App constants
        │   ├── contexts/       # React contexts
        │   ├── guards/         # Route guards
        │   ├── hooks/          # Custom hooks
        │   ├── lib/            # Core libraries
        │   │   └── local-storage/  # Demo mode storage
        │   ├── pages/          # Page components
        │   ├── routes/         # Router config
        │   ├── services/       # API services
        │   ├── styles/         # CSS and themes
        │   ├── utils/          # Utilities
        │   ├── validators/     # Zod schemas
        │   ├── App.tsx         # Root component
        │   └── main.tsx        # Entry point
        ├── .env.development    # Dev environment
        ├── .env.demo           # Demo environment
        ├── .env.production     # Prod environment
        ├── package.json
        ├── vite.config.ts
        ├── vitest.config.ts
        └── README.md           # Web documentation
```

---

## 🧪 Testing

### Web Tests

```bash
# Run all tests
make test

# Watch mode
make test-watch

# Coverage report
make test-coverage
```

### Manual API Testing

```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/v1/admin/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  -c cookies.txt

# Get products (authenticated)
curl http://localhost:3000/api/v1/admin/products -b cookies.txt
```

---

## 🚨 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| MongoDB connection failed | Check `MONGODB_URI` and `MONGO_PASSWORD` in `.env` |
| Port 3000 already in use | Kill existing process or change `PORT` in `.env` |
| Auth not working | Verify `AUTH_SECRET_USER` is 32+ characters |
| CORS errors | Add frontend URL to `TRUSTED_ORIGINS` |
| Demo mode not working | Ensure `VITE_DATA_SOURCE=local` in `.env.demo` |

### Debug Commands

```bash
# Check project status
make status

# Verify tools installed
make check

# Clean and reinstall
make clean && make install
```

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

<div align="center">

**Built with ❤️ using React, Express, TypeScript, and MongoDB**

### 🎮 [**Try the Live Demo**](https://johnlester-0369.github.io/SimpleStock)

[Web Package](./packages/web/) • [Server Package](./packages/server/) • [Back to Top](#simplestock-monorepo)

</div>
