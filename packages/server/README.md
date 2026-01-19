# SimpleStock Server

<div align="center">

**RESTful API Backend for SimpleStock Inventory Management System**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-9.0-880000?logo=mongoose&logoColor=white)](https://mongoosejs.com/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.4-purple)](https://better-auth.com/)
[![License](https://img.shields.io/badge/License-Private-red)](LICENSE)

[Features](#-features) • [Quick Start](#-quick-start) • [API Reference](#-api-reference) • [Architecture](#-architecture) • [Configuration](#-configuration)

</div>

---

## 📖 Overview

SimpleStock Server is a production-ready RESTful API backend built with Express.js and TypeScript. It provides secure authentication, product management, supplier tracking, and transaction recording capabilities for the SimpleStock inventory management system.

### Key Highlights

- 🚀 **Modern Stack** - Express 4.21, TypeScript 5.9, ES2022 target
- 🔐 **Secure Authentication** - better-auth with session management and admin roles
- 🗄️ **Dual Database Strategy** - Mongoose ODM + native MongoClient for optimal compatibility
- ✅ **Type-Safe Validation** - Zod schemas with automatic TypeScript inference
- 📊 **Structured Logging** - Winston with environment-specific formatters
- 🏗️ **Clean Architecture** - Layered design with separation of concerns
- ⚡ **Production Ready** - Graceful shutdown, connection pooling, rate limiting

---

## ✨ Features

### Authentication & Authorization
- **Session-based Authentication** - Secure cookie-based sessions via better-auth
- **Email/Password Login** - Built-in credential authentication
- **Admin Plugin** - Role-based access control (user/admin roles)
- **Rate Limiting** - Configurable rate limits on auth endpoints
- **Session Management** - Configurable expiry and refresh

### Product Management
- **Full CRUD Operations** - Create, read, update, delete products
- **Stock Tracking** - Real-time inventory levels with low-stock alerts
- **Sell Functionality** - Atomic stock decrement with transaction creation
- **Smart Filtering** - Filter by stock status, supplier, search term
- **Statistics** - Total products, inventory value, stock alerts

### Supplier Management
- **Supplier Directory** - Maintain vendor contacts
- **Contact Information** - Store person, email, phone, address
- **Search & Filter** - Quick supplier lookup
- **Full CRUD** - Complete supplier lifecycle management

### Transaction Tracking
- **Automatic Recording** - Transactions created on product sales
- **Period Filtering** - Today, week, month, or custom date ranges
- **Daily Sales Aggregation** - Sales breakdown by day
- **Statistics** - Revenue, count, items sold, average order value
- **Recent Transactions** - Quick access to latest activity

### Infrastructure
- **Graceful Shutdown** - Clean connection closure on SIGTERM/SIGINT
- **Connection Pooling** - Optimized MongoDB connections
- **Request Logging** - HTTP method, URL, status, duration tracking
- **Error Handling** - Domain errors with proper HTTP status codes
- **Health Checks** - Endpoint for monitoring systems

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0 (ES2022 support required)
- **npm** >= 9.0.0 (or yarn/pnpm)
- **MongoDB** >= 6.0 (Atlas or local instance)

### Installation

```bash
# Navigate to server package
cd packages/server

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# See Configuration section for details

# Seed admin user (optional)
npm run seed:admin

# Start development server
npm run dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run start` | Run compiled production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run seed:admin` | Create initial admin user |

### Verify Installation

```bash
# Server should start on configured PORT (default: 3000)
curl http://localhost:3000/health

# Expected response:
# {"status":"healthy","timestamp":"2024-01-01T00:00:00.000Z"}
```

---

## 📚 API Reference

### Base URL

```
http://localhost:3000/api/v1/admin
```

### Authentication Endpoints

All authentication is handled by better-auth at `/api/v1/admin/auth/*`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/sign-in/email` | Login with email/password |
| POST | `/auth/sign-up/email` | Register new user |
| POST | `/auth/sign-out` | Logout current session |
| GET | `/auth/session` | Get current session |

#### Sign In

```bash
curl -X POST http://localhost:3000/api/v1/admin/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-password",
    "rememberMe": true
  }'
```

### Product Endpoints

All product endpoints require authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List all products (with filters) |
| GET | `/products/:id` | Get single product |
| GET | `/products/stats` | Get product statistics |
| GET | `/products/low-stock` | Get low stock products |
| GET | `/products/suppliers` | Get unique supplier names |
| POST | `/products` | Create new product |
| PUT | `/products/:id` | Update product |
| POST | `/products/:id/sell` | Sell product (decrement stock) |
| DELETE | `/products/:id` | Delete product |

#### Query Parameters (GET /products)

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search in name and supplier |
| `stockStatus` | enum | `all`, `in-stock`, `low-stock`, `out-of-stock` |
| `supplier` | string | Filter by supplier name |

#### Create Product

```bash
curl -X POST http://localhost:3000/api/v1/admin/products \
  -H "Content-Type: application/json" \
  -H "Cookie: admin.session_token=..." \
  -d '{
    "name": "Widget Pro",
    "price": 29.99,
    "stockQuantity": 100,
    "supplier": "TechCorp"
  }'
```

#### Sell Product

```bash
curl -X POST http://localhost:3000/api/v1/admin/products/:id/sell \
  -H "Content-Type: application/json" \
  -H "Cookie: admin.session_token=..." \
  -d '{
    "quantity": 5
  }'
```

**Response:**
```json
{
  "product": { "id": "...", "stockQuantity": 95, ... },
  "sold": 5,
  "totalAmount": 149.95,
  "transactionId": "..."
}
```

### Supplier Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/suppliers` | List all suppliers |
| GET | `/suppliers/:id` | Get single supplier |
| GET | `/suppliers/names` | Get supplier name list |
| POST | `/suppliers` | Create new supplier |
| PUT | `/suppliers/:id` | Update supplier |
| DELETE | `/suppliers/:id` | Delete supplier |

#### Create Supplier

```bash
curl -X POST http://localhost:3000/api/v1/admin/suppliers \
  -H "Content-Type: application/json" \
  -H "Cookie: admin.session_token=..." \
  -d '{
    "name": "TechCorp",
    "contactPerson": "John Doe",
    "email": "john@techcorp.com",
    "phone": "+1-555-0123",
    "address": "123 Tech Lane, Silicon Valley, CA"
  }'
```

### Transaction Endpoints

Transactions are read-only (created automatically on product sales).

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/transactions` | List transactions (with filters) |
| GET | `/transactions/:id` | Get single transaction |
| GET | `/transactions/stats` | Get transaction statistics |
| GET | `/transactions/daily-sales` | Get daily sales aggregation |
| GET | `/transactions/recent` | Get recent transactions |

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search in product name |
| `period` | enum | `today`, `week`, `month` |
| `startDate` | ISO 8601 | Custom start date |
| `endDate` | ISO 8601 | Custom end date |
| `limit` | number | Limit results (for `/recent`) |

#### Get Statistics

```bash
curl http://localhost:3000/api/v1/admin/transactions/stats?period=week \
  -H "Cookie: admin.session_token=..."
```

**Response:**
```json
{
  "totalRevenue": 1250.50,
  "totalTransactions": 47,
  "totalItemsSold": 156,
  "averageOrderValue": 26.61
}
```

### Health & Utility Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Welcome message |
| GET | `/health` | Health check for monitoring |

---

## 🏗️ Architecture

### Project Structure

```
packages/server/
├── scripts/
│   └── seed-admin.ts          # Admin user seed script
├── src/
│   ├── config/
│   │   └── env.config.ts      # Environment configuration
│   ├── controllers/           # HTTP request handlers
│   │   ├── product.controller.ts
│   │   ├── supplier.controller.ts
│   │   └── transaction.controller.ts
│   ├── lib/                   # Core libraries
│   │   ├── auth.lib.ts        # better-auth configuration
│   │   ├── db.lib.ts          # Mongoose connection
│   │   └── mongo-client.lib.ts # MongoClient for auth
│   │   └── logger.lib.ts      # Winston logger
│   ├── middleware/
│   │   └── user.middleware.ts # Authentication middleware
│   ├── models/                # Mongoose schemas & types
│   │   ├── product.model.ts
│   │   ├── supplier.model.ts
│   │   └── transaction.model.ts
│   ├── repos/                 # Data access layer
│   │   ├── product.repo.ts
│   │   ├── supplier.repo.ts
│   │   └── transaction.repo.ts
│   ├── routes/v1/             # Route definitions
│   │   ├── product.routes.ts
│   │   ├── supplier.routes.ts
│   │   └── transaction.routes.ts
│   ├── services/              # Business logic layer
│   │   ├── product.service.ts
│   │   ├── supplier.service.ts
│   │   └── transaction.service.ts
│   ├── shared/
│   │   └── errors.ts          # Domain error classes
│   ├── types/
│   │   └── express.d.ts       # Express type augmentation
│   ├── validators/            # Zod validation schemas
│   │   ├── common.validator.ts
│   │   ├── index.ts
│   │   ├── product.validator.ts
│   │   ├── supplier.validator.ts
│   │   └── transaction.validator.ts
│   ├── app.ts                 # Express app factory
│   └── server.ts              # Entry point
├── .env.example               # Environment template
├── package.json
└── tsconfig.json
```

### Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        HTTP Layer                           │
│   Routes (product.routes.ts, supplier.routes.ts, etc.)      │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Controller Layer                        │
│   ProductController, SupplierController, TransactionCtrl    │
│   • Parse HTTP requests                                     │
│   • Call services                                           │
│   • Format HTTP responses                                   │
│   • Handle errors → HTTP status codes                       │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                          │
│   ProductService, SupplierService, TransactionService       │
│   • Business logic                                          │
│   • Input validation (Zod)                                  │
│   • Orchestration                                           │
│   • Domain error throwing                                   │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Repository Layer                         │
│   ProductRepo, SupplierRepo, TransactionRepo                │
│   • Data access abstraction                                 │
│   • Mongoose queries                                        │
│   • Query building                                          │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Model Layer                            │
│   Mongoose Schemas (Product, Supplier, Transaction)         │
│   • Schema definitions                                      │
│   • Type definitions                                        │
│   • Response transformers                                   │
└─────────────────────────────────────────────────────────────┘
```

### Database Architecture

The server uses a **dual-connection strategy** to avoid BSON version conflicts:

```
┌─────────────────────────────────────────────────────────────┐
│                      Application                            │
└──────────────┬─────────────────────────────┬────────────────┘
               │                             │
               ▼                             ▼
┌──────────────────────────┐   ┌──────────────────────────────┐
│      MongoClient         │   │         Mongoose             │
│   (mongo-client.lib.ts)  │   │       (db.lib.ts)            │
│                          │   │                              │
│   Used by:               │   │   Used by:                   │
│   • better-auth adapter  │   │   • Product model            │
│   • Auth collections     │   │   • Supplier model           │
│                          │   │   • Transaction model        │
└──────────────┬───────────┘   └──────────────┬───────────────┘
               │                              │
               └──────────────┬───────────────┘
                              ▼
                    ┌─────────────────┐
                    │    MongoDB      │
                    │   (Atlas/Local) │
                    └─────────────────┘
```

**Why Dual Connections?**

Mongoose bundles its own MongoDB driver version, which can conflict with better-auth's expected driver version. Using separate connections ensures:
- better-auth gets a compatible native MongoClient
- Mongoose ODM operates independently with its bundled driver
- No BSON serialization conflicts

### Authentication Flow

```
┌──────────┐      ┌─────────────────┐      ┌──────────────────┐
│  Client  │────▶│  Express App     │────▶│   better-auth    │
│          │      │  toNodeHandler  │      │                  │
└──────────┘      └─────────────────┘      └──────┬───────────┘
                                                  │
                                                  ▼
                                         ┌──────────────────┐
                                         │ MongoDB Adapter  │
                                         │   (MongoClient)  │
                                         └────────┬─────────┘
                                                  │
                         ┌────────────────────────┼────────────────────────┐
                         │                        │                        │
                         ▼                        ▼                        ▼
                  ┌────────────┐          ┌────────────┐          ┌─────────────┐
                  │   user     │          │  session   │          │ verification│
                  │ collection │          │ collection │          │ collection  │
                  └────────────┘          └────────────┘          └─────────────┘
```

### Request Flow (Protected Routes)

```
HTTP Request
     │
     ▼
┌─────────────────────────────────────────┐
│            Express Middleware           │
│  • JSON parser                          │
│  • URL-encoded parser                   │
│  • Request logging                      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│          requireUser Middleware         │
│  • Get session from better-auth         │
│  • Verify authentication                │
│  • Attach user to req.user              │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│             Controller                  │
│  • Extract params/query/body            │
│  • Call service                         │
│  • Handle errors                        │
│  • Send response                        │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│              Service                    │
│  • Validate input (Zod)                 │
│  • Business logic                       │
│  • Call repository                      │
│  • Transform response                   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│             Repository                  │
│  • Build Mongoose query                 │
│  • Execute database operation           │
│  • Return raw documents                 │
└─────────────────────────────────────────┘
```

### Error Handling Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Domain Errors                           │
│                    (shared/errors.ts)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   DomainError (abstract base)                               │
│        │                                                    │
│        ├── NotFoundError (404)                              │
│        │      "Product with ID 'xyz' not found"             │
│        │                                                    │
│        ├── ValidationError (400)                            │
│        │      Integrates with Zod errors                    │
│        │      "Name must be at least 2 characters"          │
│        │                                                    │
│        ├── BusinessRuleError (400)                          │
│        │      Generic business rule violations              │
│        │                                                    │
│        ├── InsufficientStockError (400)                     │
│        │      "Insufficient stock. Available: 5, Req: 10"   │
│        │                                                    │
│        └── OperationFailedError (500)                       │
│               "Sell product failed: Stock update failed"    │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Controller Error Handling:
┌─────────────────────────────────────────────────────────────┐
│  private handleError(error, res, context) {                 │
│    if (isDomainError(error)) {                              │
│      res.status(error.statusCode).json({error: error.msg}); │
│    } else {                                                 │
│      logger.error(...);                                     │
│      res.status(500).json({error: 'Failed to...'});         │
│    }                                                        │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

### Validation Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Zod Schemas                              │
│               (validators/*.validator.ts)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  common.validator.ts                                        │
│    • objectIdSchema (MongoDB ID format)                     │
│    • nameSchema (2-100 chars)                               │
│    • priceSchema (min $0.01)                                │
│    • stockQuantitySchema (non-negative int)                 │
│    • emailSchema, phoneSchema, addressSchema                │
│    • stockStatusSchema, periodSchema                        │
│                                                             │
│  product.validator.ts                                       │
│    • createProductSchema                                    │
│    • updateProductSchema                                    │
│    • sellProductSchema                                      │
│    • validateCreateProduct(), safeValidateCreateProduct()   │
│                                                             │
│  supplier.validator.ts                                      │
│    • createSupplierSchema                                   │
│    • updateSupplierSchema                                   │
│    • validateCreateSupplier()                               │
│                                                             │
│  transaction.validator.ts                                   │
│    • transactionFilterSchema                                │
│    • transactionStatsQuerySchema                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Service Validation Flow:
┌─────────────────────────────────────────────────────────────┐
│  async createProduct(userId, input) {                       │
│    // Zod validates and throws ZodError on failure          │
│    const validated = this.validateCreateInput(input);       │
│    // Type-safe: validated is CreateProductInput            │
│    return productRepo.create(userId, validated);            │
│  }                                                          │
│                                                             │
│  private validateCreateInput(input: unknown) {              │
│    try {                                                    │
│      return validateCreateProduct(input);                   │
│    } catch (error) {                                        │
│      if (isZodError(error)) {                               │
│        throw ValidationError.fromZodError(error);           │
│      }                                                      │
│      throw error;                                           │
│    }                                                        │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development`, `production`, `test` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection template with `<PASSWORD>` placeholder | `mongodb+srv://user:<PASSWORD>@cluster.mongodb.net` |
| `MONGO_PASSWORD` | MongoDB password (auto-encoded) | `your-secure-password` |
| `DATABASE_NAME` | Database name | `simplestock` |
| `BASE_URL` | Application base URL | `http://localhost:3000` |
| `AUTH_SECRET_USER` | Auth encryption secret (min 32 chars) | Generate with `openssl rand -base64 32` |

#### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | Winston log level | `info` |
| `LOG_FILE_PATH` | Application log file path | None (console only) |
| `ERROR_LOG_FILE_PATH` | Error log file path | None |
| `TRUSTED_ORIGINS` | CORS allowed origins (comma-separated) | Same origin |

#### Admin Seed Variables

| Variable | Description |
|----------|-------------|
| `ADMIN_SEED_EMAIL` | Initial admin email |
| `ADMIN_SEED_PASSWORD` | Initial admin password (min 6 chars) |
| `ADMIN_SEED_NAME` | Admin display name (default: "Admin") |

### Example Configuration

```bash
# .env
NODE_ENV=development
PORT=3000

# Logging
LOG_LEVEL=debug

# Database
MONGODB_URI=mongodb+srv://simplestock:<PASSWORD>@cluster0.mongodb.net?retryWrites=true&w=majority
MONGO_PASSWORD=MySecureP@ssw0rd!
DATABASE_NAME=simplestock_dev

# Authentication
BASE_URL=http://localhost:3000
AUTH_SECRET_USER=your-32-character-secret-key-here-change-me
TRUSTED_ORIGINS=http://localhost:3000,http://localhost:5173

# Admin Seed
ADMIN_SEED_EMAIL=admin@simplestock.com
ADMIN_SEED_PASSWORD=AdminPass123!
ADMIN_SEED_NAME=Administrator
```

### MongoDB Connection

The server handles MongoDB password encoding automatically:

```typescript
// Your .env
MONGODB_URI=mongodb+srv://user:<PASSWORD>@cluster.mongodb.net
MONGO_PASSWORD=p@ss#word!

// Server automatically encodes to:
// mongodb+srv://user:p%40ss%23word%21@cluster.mongodb.net
```

**Important:** Always use the `<PASSWORD>` placeholder in `MONGODB_URI`.

---

## 🔐 Security

### Authentication

- **Session-based** - Secure HTTP-only cookies
- **Cookie Prefix** - `admin.*` for all auth cookies
- **Session Expiry** - 7 days with daily refresh
- **Rate Limiting** - 3 sign-in attempts per 10 seconds, 5 sign-ups per minute

### Password Security

- **Minimum Length** - 6 characters enforced
- **Hashing** - bcrypt via better-auth
- **No Plain Text** - Passwords never logged or exposed

### Request Validation

- **Zod Schemas** - All inputs validated before processing
- **Type Coercion** - Automatic type conversion where safe
- **Error Messages** - Detailed validation errors (field-level)

### Database Security

- **Ownership Checks** - All queries filtered by `userId`
- **ObjectId Validation** - Invalid IDs rejected before query
- **Connection Pooling** - Max 10 connections per pool

### Error Handling

- **No Stack Traces** - Internal errors don't leak details
- **Domain Errors** - Proper HTTP status codes
- **Logging** - Errors logged server-side for debugging

### Best Practices

- ✅ Environment variables for all secrets
- ✅ No hardcoded credentials
- ✅ Password encoding for MongoDB
- ✅ Parameterized queries (Mongoose)
- ✅ Input sanitization (trim, lowercase for emails)
- ✅ Request logging for audit trails

---

## 📊 Data Models

### Product

```typescript
interface Product {
  id: string;
  userId: string;           // Owner
  name: string;             // 2-100 chars
  price: number;            // Min $0.01
  stockQuantity: number;    // Non-negative integer
  supplier: string;         // Supplier name
  createdAt: string;        // ISO 8601
  updatedAt: string;        // ISO 8601
}
```

**Stock Status Logic:**
- **In Stock:** `stockQuantity >= 5`
- **Low Stock:** `0 < stockQuantity < 5`
- **Out of Stock:** `stockQuantity === 0`

### Supplier

```typescript
interface Supplier {
  id: string;
  userId: string;           // Owner
  name: string;             // 2-100 chars
  contactPerson: string;    // 2-100 chars
  email: string;            // Valid email
  phone: string;            // Non-empty
  address: string;          // Optional
  createdAt: string;
  updatedAt: string;
}
```

### Transaction

```typescript
interface Transaction {
  id: string;
  userId: string;           // Owner
  productId: string;        // Reference to product
  productName: string;      // Snapshot of product name
  quantity: number;         // Positive integer
  unitPrice: number;        // Price at time of sale
  totalAmount: number;      // quantity * unitPrice
  createdAt: string;
  updatedAt: string;
}
```

---

## 🛠️ Development

### Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Runtime** | Node.js | >= 18.0.0 |
| **Language** | TypeScript | ~5.9.3 |
| **Framework** | Express | ^4.21.2 |
| **Database** | MongoDB | ^7.0.0 |
| **ODM** | Mongoose | ^9.0.1 |
| **Auth** | better-auth | ^1.4.7 |
| **Validation** | Zod | ^4.3.5 |
| **Logging** | Winston | ^3.19.0 |
| **Dev Server** | tsx | ^4.21.0 |

### TypeScript Configuration

Key compiler options:

```json
{
  "target": "es2022",
  "module": "nodenext",
  "moduleResolution": "nodenext",
  "strict": true,
  "verbatimModuleSyntax": true,
  "exactOptionalPropertyTypes": true
}
```

**Important:** Use `import type` for type-only imports due to `verbatimModuleSyntax`.

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Adding a New Entity

1. **Create Model** (`src/models/entity.model.ts`)
   - Define Mongoose schema
   - Export TypeScript interfaces
   - Add response transformer

2. **Create Validator** (`src/validators/entity.validator.ts`)
   - Define Zod schemas
   - Export validation functions
   - Add to `validators/index.ts`

3. **Create Repository** (`src/repos/entity.repo.ts`)
   - Implement CRUD operations
   - Export singleton instance

4. **Create Service** (`src/services/entity.service.ts`)
   - Add business logic
   - Integrate validation
   - Export singleton instance

5. **Create Controller** (`src/controllers/entity.controller.ts`)
   - Handle HTTP requests
   - Use arrow functions for route handlers
   - Export singleton instance

6. **Create Routes** (`src/routes/v1/entity.routes.ts`)
   - Define endpoints
   - Apply middleware
   - Register in `app.ts`

---

## 🧪 Testing

### Manual Testing with cURL

```bash
# Health check
curl http://localhost:3000/health

# Login (save cookies)
curl -X POST http://localhost:3000/api/v1/admin/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  -c cookies.txt

# Get products (with cookies)
curl http://localhost:3000/api/v1/admin/products \
  -b cookies.txt

# Create product
curl -X POST http://localhost:3000/api/v1/admin/products \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Test Product","price":19.99,"stockQuantity":50,"supplier":"Test Supplier"}'
```

---

## 📋 Troubleshooting

### Common Issues

#### MongoDB Connection Failed

```
MongoClient connection failed: MongoServerSelectionError
```

**Solutions:**
1. Verify `MONGODB_URI` and `MONGO_PASSWORD` in `.env`
2. Check MongoDB Atlas IP whitelist
3. Ensure `<PASSWORD>` placeholder exists in URI

#### Auth Not Initialized

```
Auth not initialized. Call initializeAuth() before using getAuth()
```

**Solution:** Ensure `initializeAuth()` is called before `createApp()` in server startup.

#### Session Not Found

```
401 Unauthorized. Please login.
```

**Solutions:**
1. Check cookie is being sent with request
2. Verify session hasn't expired
3. Check `TRUSTED_ORIGINS` includes your frontend URL

#### Validation Errors

```json
{"error":"Name must be at least 2 characters"}
```

**Solution:** Review Zod schema requirements in `validators/` directory.

### Debug Logging

Set `LOG_LEVEL=debug` in `.env` for verbose logging:

```bash
LOG_LEVEL=debug
```

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

<div align="center">

**Built with ❤️ using Express, TypeScript, and MongoDB**

[Back to Top](#simplestock-server)

</div>