import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { createBrowserRouter } from 'react-router-dom'

// Eagerly loaded components (layout + guards - critical for UX and auth)
import DashboardLayout from '@/components/layout/DashboardLayout'
import PublicRoute from '@/guards/PublicRoute'
import UserProtectedRoute from '@/guards/UserProtectedRoute'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Route constants
import {
  ROUTE_ROOT,
  ROUTE_DASHBOARD,
  ROUTE_PRODUCTS,
  ROUTE_TRANSACTION,
  ROUTE_REPORT,
  ROUTE_SETTINGS_ACCOUNT,
  ROUTE_SETTINGS_SUPPLIER,
} from '@/constants/routes.constants'

// ============================================================================
// LAZY LOADED PAGE COMPONENTS
// ============================================================================

/**
 * Lazy-loaded page components for code splitting.
 * Each page is loaded only when the route is accessed.
 */
const LoginPage = lazy(() => import('@/pages/index'))
const DashboardPage = lazy(() => import('@/pages/dashboard'))
const ProductsPage = lazy(() => import('@/pages/products'))
const TransactionPage = lazy(() => import('@/pages/transaction'))
const ReportPage = lazy(() => import('@/pages/report'))
const AccountPage = lazy(() => import('@/pages/settings/account'))
const SupplierPage = lazy(() => import('@/pages/settings/supplier'))

// ============================================================================
// SUSPENSE WRAPPER
// ============================================================================

/**
 * Props for the Suspense wrapper component
 */
interface LazyRouteProps {
  children: ReactNode
}

/**
 * Wrapper component that provides Suspense boundary with loading fallback.
 * Used to wrap lazy-loaded page components in route definitions.
 *
 * @param props - Component props containing children to render
 * @returns Suspense-wrapped children with LoadingSpinner fallback
 */
// eslint-disable-next-line react-refresh/only-export-components
function LazyRoute({ children }: LazyRouteProps): ReactNode {
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
}

// ============================================================================
// ROUTER CONFIGURATION
// ============================================================================

/**
 * Application router configuration with lazy-loaded routes.
 *
 * Route Structure:
 * - / (public) - Login page
 * - /dashboard (protected) - Dashboard overview
 * - /products (protected) - Product management
 * - /transaction (protected) - Transaction history
 * - /report (protected) - Reports and analytics
 * - /settings/account (protected) - Account settings
 * - /settings/supplier (protected) - Supplier management
 */
export const router = createBrowserRouter(
  [
    {
      path: ROUTE_ROOT,
      element: <PublicRoute />,
      children: [
        {
          index: true,
          element: (
            <LazyRoute>
              <LoginPage />
            </LazyRoute>
          ),
        },
      ],
    },
    {
      path: ROUTE_DASHBOARD,
      element: <UserProtectedRoute />,
      children: [
        {
          path: '',
          element: <DashboardLayout />,
          children: [
            {
              index: true,
              element: (
                <LazyRoute>
                  <DashboardPage />
                </LazyRoute>
              ),
            },
          ],
        },
      ],
    },
    {
      path: ROUTE_PRODUCTS,
      element: <UserProtectedRoute />,
      children: [
        {
          path: '',
          element: <DashboardLayout />,
          children: [
            {
              index: true,
              element: (
                <LazyRoute>
                  <ProductsPage />
                </LazyRoute>
              ),
            },
          ],
        },
      ],
    },
    {
      path: ROUTE_TRANSACTION,
      element: <UserProtectedRoute />,
      children: [
        {
          path: '',
          element: <DashboardLayout />,
          children: [
            {
              index: true,
              element: (
                <LazyRoute>
                  <TransactionPage />
                </LazyRoute>
              ),
            },
          ],
        },
      ],
    },
    {
      path: ROUTE_REPORT,
      element: <UserProtectedRoute />,
      children: [
        {
          path: '',
          element: <DashboardLayout />,
          children: [
            {
              index: true,
              element: (
                <LazyRoute>
                  <ReportPage />
                </LazyRoute>
              ),
            },
          ],
        },
      ],
    },
    {
      path: ROUTE_SETTINGS_ACCOUNT,
      element: <UserProtectedRoute />,
      children: [
        {
          path: '',
          element: <DashboardLayout />,
          children: [
            {
              index: true,
              element: (
                <LazyRoute>
                  <AccountPage />
                </LazyRoute>
              ),
            },
          ],
        },
      ],
    },
    {
      path: ROUTE_SETTINGS_SUPPLIER,
      element: <UserProtectedRoute />,
      children: [
        {
          path: '',
          element: <DashboardLayout />,
          children: [
            {
              index: true,
              element: (
                <LazyRoute>
                  <SupplierPage />
                </LazyRoute>
              ),
            },
          ],
        },
      ],
    },
  ],
  {
    basename: '/SimpleStock', //for github web pages deployment
  },
)
