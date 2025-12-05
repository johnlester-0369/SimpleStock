import { RouterProvider } from 'react-router-dom'
import { HelmetProvider } from '@dr.pogodin/react-helmet'
import { router } from '@/routes'

/**
 * App component serves as the RouterProvider wrapper.
 * It connects the router configuration to the React app,
 * enabling all route definitions from routes/index.tsx
 *
 * Wraps the entire app with:
 * - HelmetProvider for document head management
 */
export default function App() {
  return (
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  )
}
