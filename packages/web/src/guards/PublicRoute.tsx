import React from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useUserAuth } from '@/contexts/UserAuthContext'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { ROUTE_DASHBOARD } from '@/constants/routes.constants'

/**
 * PublicRoute guard component
 *
 * Protects routes that should only be accessible to non-authenticated users
 * (e.g. login page).
 * If user IS authenticated, redirect to dashboard page.
 */
const PublicRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useUserAuth()
  const location = useLocation()

  // Show loading state while checking authentication
  if (isLoading) {
    return <LoadingSpinner />
  }

  // If authenticated, redirect to dashboard page
  if (isAuthenticated) {
    return <Navigate to={ROUTE_DASHBOARD} state={{ from: location }} replace />
  }

  // If not authenticated, render the public route
  return <Outlet />
}

export default PublicRoute