import { createBrowserRouter } from 'react-router-dom'
import LoginPage from '@/pages/index.tsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
])
