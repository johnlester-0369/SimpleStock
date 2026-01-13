import { createBrowserRouter } from 'react-router-dom'
import LoginPage from '@/pages/index.tsx'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DashboardPage from '@/pages/dashboard'
import ProductsPage from '@/pages/products'
import TransactionPage from '@/pages/transaction'
import ReportPage from '@/pages/report'
import AccountPage from '@/pages/settings/account'
import SupplierPage from '@/pages/settings/supplier'

// guards
import PublicRoute from '@/guards/PublicRoute'
import UserProtectedRoute from '@/guards/UserProtectedRoute'

// route constants
import {
  ROUTE_ROOT,
  ROUTE_DASHBOARD,
  ROUTE_PRODUCTS,
  ROUTE_TRANSACTION,
  ROUTE_REPORT,
  ROUTE_SETTINGS_ACCOUNT,
  ROUTE_SETTINGS_SUPPLIER,
} from '@/constants/routes.constants'

export const router = createBrowserRouter([
  {
    path: ROUTE_ROOT,
    element: <PublicRoute />,
    children: [
      {
        index: true,
        element: <LoginPage />,
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
            element: <DashboardPage />,
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
            element: <ProductsPage />,
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
            element: <TransactionPage />,
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
            element: <ReportPage />,
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
            element: <AccountPage />,
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
            element: <SupplierPage />,
          },
        ],
      },
    ],
  },
])