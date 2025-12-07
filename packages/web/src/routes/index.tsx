import { createBrowserRouter } from 'react-router-dom'
import LoginPage from '@/pages/index.tsx'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DashboardPage from '@/pages/dashboard'
import ProductsPage from '@/pages/products'
import AccountPage from '@/pages/settings/account'
import SupplierPage from '@/pages/settings/supplier'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
    ],
  },
  {
    path: '/products',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <ProductsPage />,
      },
    ],
  },
  {
    path: '/settings/account',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <AccountPage />,
      },
    ],
  },
  {
    path: '/settings/supplier',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <SupplierPage />,
      },
    ],
  },
])