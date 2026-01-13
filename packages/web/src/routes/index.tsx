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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicRoute />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ],
  },
  {
    path: '/dashboard',
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
    path: '/products',
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
    path: '/transaction',
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
    path: '/report',
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
    path: '/settings/account',
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
    path: '/settings/supplier',
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
