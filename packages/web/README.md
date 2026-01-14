# SimpleStock

<div align="center">

![SimpleStock](public/favicon.svg)

**A simple and intuitive inventory management system**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Private-red)](LICENSE)

[Features](#-features) • [Quick Start](#-quick-start) • [Demo Mode](#-demo-mode) • [Architecture](#-architecture) • [Development](#-development)

</div>

---

## 📖 Overview

SimpleStock is a modern, full-featured inventory management system designed to help businesses track stock levels, manage products, handle sales transactions, and generate insightful reports. Built with React 19 and TypeScript, it offers a clean, responsive interface with real-time data visualization.

### Key Highlights

- 🚀 **Modern Stack** - React 19, TypeScript 5.9, Vite 7
- 🎨 **Beautiful UI** - Tailwind CSS with custom theme system
- 📊 **Data Visualization** - Interactive charts with Chart.js
- 🔐 **Secure Authentication** - better-auth integration with session management
- 🌐 **Dual Mode** - Works with API backend or standalone demo mode
- ✅ **Type-Safe** - End-to-end TypeScript with Zod validation
- 📱 **Responsive** - Mobile-first design with adaptive layouts

---

## ✨ Features

### Dashboard
- **Overview Statistics** - Total products, inventory value, low stock alerts
- **Weekly Sales Chart** - Visual representation of daily sales
- **Low Stock Alerts** - Quick view of items needing restocking
- **Recent Transactions** - Latest sales activity at a glance
- **Quick Actions** - Fast navigation to common tasks

### Product Management
- **Full CRUD Operations** - Create, read, update, delete products
- **Stock Tracking** - Real-time inventory levels with status indicators
- **Smart Filtering** - Filter by stock status (in-stock, low-stock, out-of-stock)
- **Supplier Filter** - Filter products by supplier
- **Search** - Quick product search by name or supplier
- **Sell Functionality** - Record sales directly from product list
- **Pagination** - Efficient handling of large product catalogs

### Transaction History
- **Complete History** - View all sales transactions
- **Period Filtering** - Filter by today, this week, or this month
- **Search** - Find transactions by product name
- **Statistics** - Total revenue, transaction count, items sold, average order value
- **Pagination** - Navigate through transaction records

### Reports & Analytics
- **Sales Charts** - Weekly and monthly sales visualization
- **Daily Breakdown** - Detailed sales per day table
- **Period Comparison** - Switch between week and month views
- **Summary Statistics** - Key metrics at a glance

### Supplier Management
- **Supplier Directory** - Maintain list of all suppliers
- **Contact Information** - Store contact person, email, phone, address
- **Search** - Quick supplier lookup
- **Full CRUD** - Add, edit, delete suppliers

### Account Settings
- **Profile Management** - Update display name
- **Password Change** - Secure password update with validation
- **Session Info** - View account creation and update dates

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (or yarn/pnpm)

### Installation

```bash
# Clone the repository
git clone https://github.com/johnlester-0369/SimpleStock
cd packages/web

# Install dependencies
npm install

# Start development server (API mode)
npm run dev

# Or start in demo mode (no backend required)
npm run dev:demo
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (API mode) |
| `npm run dev:demo` | Start development server (Demo mode with localStorage) |
| `npm run build` | Build for production (API mode) |
| `npm run build:demo` | Build for production (Demo mode) |
| `npm run preview` | Preview production build |
| `npm run preview:demo` | Preview demo production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

---

## 🎮 Demo Mode

SimpleStock includes a fully-functional demo mode that runs entirely in the browser using localStorage. This is perfect for:

- **Evaluating the application** without setting up a backend
- **Demonstrations and presentations**
- **Development and testing**
- **Learning the codebase**

### Demo Credentials

```
Email:    demo@simplestock.com
Password: demo123456
```

### Starting Demo Mode

```bash
npm run dev:demo
```

### How It Works

Demo mode uses localStorage to persist data locally in your browser:

- **Authentication** - Simulated login/logout with session persistence
- **Products** - Pre-seeded with sample inventory data
- **Transactions** - Sample sales history for the past week
- **Suppliers** - Example supplier entries

All CRUD operations work identically to API mode, just stored locally.

---

## 🏗️ Architecture

### Project Structure

```
web/
├── public/                 # Static assets
│   └── favicon.svg
├── src/
│   ├── assets/            # App assets (logo, images)
│   ├── components/        # React components
│   │   ├── common/        # Shared components (Brand, PageHead)
│   │   ├── layout/        # Layout components (DashboardLayout, Navbar, Sidebar)
│   │   └── ui/            # UI component library
│   ├── constants/         # App constants and route definitions
│   ├── contexts/          # React context providers
│   ├── guards/            # Route protection components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Core libraries and utilities
│   │   └── local-storage/ # localStorage implementation for demo mode
│   ├── pages/             # Page components
│   │   └── settings/      # Settings sub-pages
│   ├── routes/            # Router configuration
│   ├── services/          # API service layer
│   ├── styles/            # Global styles and theme
│   │   └── theme/         # Theme CSS variables
│   ├── utils/             # Utility functions
│   └── validators/        # Zod validation schemas
├── .env.demo              # Demo mode environment
├── .env.development       # Development environment
├── .env.production        # Production environment
└── package.json
```

### Component Architecture

#### UI Component Library

The application includes a comprehensive UI component library in `src/components/ui/`:

| Component | Description |
|-----------|-------------|
| `Alert` | Notification banners with variants (success, error, warning, info) |
| `Button` | Buttons with variants, sizes, loading states, icons |
| `Card` | Compound card component (Root, Header, Body, Footer) |
| `CloseButton` | Dismissal button for dialogs and alerts |
| `Dialog` | Modal dialog system with compound components |
| `Dropdown` | Select dropdown with options |
| `EmptyState` | Empty state placeholder with action |
| `IconButton` | Icon-only button variant |
| `Input` | Form input with label, error, icons |
| `LoadingSpinner` | Loading indicator |
| `Pagination` | Page navigation component |
| `Table` | Compound table component with scroll area |

#### Layout Components

```
┌─────────────────────────────────────────────┐
│                  Navbar                     │
├──────────┬──────────────────────────────────┤
│          │                                  │
│          │                                  │
│ Sidebar  │         Page Content             │
│          │         (via Outlet)             │
│          │                                  │
│          │                                  │
└──────────┴──────────────────────────────────┘
```

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Pages                               │
│  (dashboard.tsx, products.tsx, transaction.tsx, etc.)       │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Custom Hooks                             │
│  useProducts, useTransactions, useSuppliers, etc.           │
│  (Data fetching, caching, mutation handling)                │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                            │
│  productService, transactionService, supplierService        │
│  (Automatic API/localStorage switching)                     │
└──────────────┬─────────────────────────────┬────────────────┘
               │                             │
               ▼                             ▼
┌──────────────────────────┐   ┌──────────────────────────────┐
│      API Client          │   │    Local Storage Services    │
│  (apiClient.ts)          │   │  (lib/local-storage/*.ts)    │
│  HTTP requests to        │   │  localStorage persistence    │
│  backend API             │   │  for demo mode               │
└──────────────────────────┘   └──────────────────────────────┘
```

### Authentication Flow

```
┌─────────────┐     ┌─────────────────┐      ┌─────────────────┐
│  Login Page │───▶│  UserAuthContext │───▶ │ Auth Client     │
│             │     │                 │      │ (API/Local)     │
└─────────────┘     └───────┬─────────┘      └─────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐-
              │     Route Guards        │
              │  PublicRoute            │
              │  UserProtectedRoute     │
              └─────────────────────────┘
```

### Validation Architecture

All forms use Zod schemas for type-safe validation:

```typescript
// Example: Product validation
import { validateCreateProduct } from '@/validators'

const result = validateCreateProduct({
  name: 'Widget',
  price: 9.99,
  stockQuantity: 100,
  supplier: 'TechCorp'
})

if (result.success) {
  // result.data is typed as CreateProductInput
  await createProduct(result.data)
} else {
  // result.error contains validation message
  showError(result.error)
}
```

---

## 🎨 Theming

SimpleStock uses CSS custom properties for theming, making it easy to customize colors:

### Theme Variables

Located in `src/styles/theme/light.css`:

```css
:root {
  /* Primary brand colors */
  --color-primary: 56 112 230;
  --color-on-primary: 255 255 255;
  
  /* Background hierarchy */
  --color-bg: 227 231 238;
  --color-surface-1: 234 238 246;
  --color-surface-2: 239 243 250;
  
  /* Text colors */
  --color-text: 38 38 38;
  --color-headline: 10 10 10;
  --color-muted: 115 115 115;
  
  /* Feedback colors */
  --color-success: 0 166 62;
  --color-warning: 225 113 0;
  --color-error: 231 0 11;
  --color-info: 0 132 209;
}
```

### Using Theme Colors

With Tailwind CSS:

```jsx
<div className="bg-primary text-on-primary">Primary Button</div>
<div className="bg-surface-1 text-headline">Card Content</div>
<span className="text-success">Success Message</span>
```

---

## 🛠️ Development

### Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 19.2 |
| **Language** | TypeScript 5.9 |
| **Build Tool** | Vite 7.2 |
| **Styling** | Tailwind CSS 3.4 |
| **Routing** | React Router DOM 7.10 |
| **Charts** | Chart.js 4.5 + react-chartjs-2 |
| **Validation** | Zod 4.1 |
| **Auth** | better-auth 1.4 |
| **Icons** | Lucide React |
| **Head Management** | @dr.pogodin/react-helmet |
| **Testing** | Vitest + Testing Library |

### Code Quality Tools

- **ESLint** - Linting with TypeScript and React rules
- **Prettier** - Code formatting (no semicolons, single quotes)
- **TypeScript** - Strict mode enabled

### Running Tests

```bash
# Run all tests
npm run test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Environment Variables

| Variable | Description | Values |
|----------|-------------|--------|
| `VITE_DATA_SOURCE` | Data source mode | `api` (backend) or `local` (localStorage) |

### API Integration

When running with `VITE_DATA_SOURCE=api`, the application expects a backend API at:

```
/api/v1/admin/auth/*      - Authentication endpoints
/api/v1/admin/products/*  - Product CRUD
/api/v1/admin/suppliers/* - Supplier CRUD
/api/v1/admin/transactions/* - Transaction queries
```

The Vite dev server proxies `/api` requests to `http://localhost:3000`.

---

## 📁 Key Files Reference

### Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite configuration with React plugin, aliases, proxy |
| `tsconfig.json` | TypeScript project references configuration |
| `tsconfig.app.json` | App TypeScript settings (ES2022 target) |
| `tsconfig.test.json` | Test TypeScript settings |
| `tailwind.config.js` | Tailwind CSS theme customization |
| `vitest.config.ts` | Vitest testing configuration |
| `eslint.config.js` | ESLint configuration |
| `prettier.config.js` | Prettier formatting rules |

### Core Application Files

| File | Purpose |
|------|---------|
| `src/main.tsx` | Application entry point |
| `src/App.tsx` | Root component with providers |
| `src/routes/index.tsx` | Route definitions |
| `src/contexts/UserAuthContext.tsx` | Authentication state management |
| `src/lib/data-source.ts` | Data source mode detection |
| `src/lib/api-client.ts` | HTTP client for API requests |
| `src/lib/auth-client.ts` | Authentication client (API/local) |

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useProducts` | Fetch products with filters, stats, suppliers |
| `useProductMutations` | Create, update, sell, delete products |
| `useTransactions` | Fetch transactions with filters and stats |
| `useSuppliers` | Fetch suppliers with search |
| `useSupplierMutations` | Create, update, delete suppliers |

### Validators

| Validator | Purpose |
|-----------|---------|
| `auth.validator.ts` | Login, password change, profile schemas |
| `product.validator.ts` | Product create, update, sell schemas |
| `supplier.validator.ts` | Supplier create, update schemas |
| `common.validator.ts` | Shared schemas and utilities |

---

## 🔒 Security Considerations

### Authentication
- Session-based authentication with secure cookies
- Password change requires current password verification
- Other sessions revoked on password change

### Data Validation
- All form inputs validated with Zod schemas
- Server-side validation required for production
- XSS prevention through React's built-in escaping

### Best Practices
- No hardcoded secrets in codebase
- Environment variables for configuration
- HTTPS required for production deployment

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes following existing patterns
3. Ensure all tests pass: `npm run test`
4. Ensure linting passes: `npm run lint`
5. Submit a pull request

### Code Style Guidelines

- Use functional components with hooks
- Follow existing component patterns
- Add JSDoc comments to exported functions
- Include unit tests for new components
- Use Zod schemas for all form validation

---

<div align="center">

**Built with ❤️ using React, TypeScript, and Tailwind CSS**

</div>