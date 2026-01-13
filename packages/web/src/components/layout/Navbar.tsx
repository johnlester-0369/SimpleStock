import React, { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Settings, LogOut, ChevronDown } from 'lucide-react'
import { useUserAuth } from '@/contexts/UserAuthContext'
import IconButton from '@/components/ui/IconButton'
import { cn } from '@/utils/cn.util'
import {
  ROUTE_ROOT,
  ROUTE_DASHBOARD,
  ROUTE_PRODUCTS,
  ROUTE_TRANSACTION,
  ROUTE_REPORT,
  ROUTE_SETTINGS_ACCOUNT,
  ROUTE_SETTINGS_SUPPLIER,
} from '@/constants/routes.constants'

interface NavbarProps {
  onMenuClick: () => void
}

/**
 * Route to page title mapping
 * Maps URL paths to their corresponding page titles
 */
const routeTitles: Record<string, string> = {
  [ROUTE_DASHBOARD]: 'Dashboard',
  [ROUTE_PRODUCTS]: 'Products',
  [ROUTE_TRANSACTION]: 'Transaction',
  [ROUTE_REPORT]: 'Report',
  [ROUTE_SETTINGS_ACCOUNT]: 'Account Settings',
  [ROUTE_SETTINGS_SUPPLIER]: 'Supplier Management',
}

/**
 * Get page title from current pathname
 * Handles exact matches and provides fallback for unknown routes
 */
const getPageTitle = (pathname: string): string => {
  // Check for exact match first
  if (routeTitles[pathname]) {
    return routeTitles[pathname]
  }

  // Fallback: find the longest matching route prefix
  // This handles potential nested routes gracefully
  const matchingRoute = Object.keys(routeTitles)
    .sort((a, b) => b.length - a.length) // Sort by length descending for most specific match
    .find((route) => pathname.startsWith(route))

  return matchingRoute ? routeTitles[matchingRoute] : 'Dashboard'
}

/**
 * Navbar Component
 *
 * Top navigation bar featuring:
 * - Mobile menu toggle button
 * - Dynamic page title based on current route
 * - User dropdown menu with profile info and actions
 * - Integration with UserAuthContext for real user data
 */
const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const pageTitle = getPageTitle(location.pathname)

  // Get user data and logout function from auth context
  const { user, logout } = useUserAuth()

  // User menu state
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

  // Close menu on escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('keydown', handleEscKey)
      return () => document.removeEventListener('keydown', handleEscKey)
    }
  }, [isUserMenuOpen])

  /**
   * Toggle user menu visibility
   */
  const toggleUserMenu = () => {
    setIsUserMenuOpen((prev) => !prev)
  }

  /**
   * Navigate to account settings
   */
  const handleNavigateToAccount = () => {
    setIsUserMenuOpen(false)
    navigate(ROUTE_SETTINGS_ACCOUNT)
  }

  /**
   * Handle logout action
   * Calls logout from auth context and redirects to login page
   */
  const handleLogout = async () => {
    setIsUserMenuOpen(false)
    setIsLoggingOut(true)

    try {
      await logout()
      // Navigation to login page is handled by the auth context/guards
      // But we can also explicitly navigate as a fallback
      navigate(ROUTE_ROOT, { replace: true })
    } catch (error) {
      console.error('Logout failed:', error)
      // Even if logout fails, attempt to redirect
      navigate(ROUTE_ROOT, { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Fallback display values if user is not available
  const displayName = user?.name || 'User'
  const displayEmail = user?.email || ''

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface-2 flex items-center justify-between px-4 lg:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <IconButton
          icon={<Menu />}
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        />
        <h1 className="text-lg font-semibold text-headline hidden sm:block">
          {pageTitle}
        </h1>
      </div>

      {/* Right Section - User Menu */}
      <div className="relative" ref={userMenuRef}>
        <button
          onClick={toggleUserMenu}
          disabled={isLoggingOut}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
            'hover:bg-surface-hover-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            isUserMenuOpen && 'bg-surface-hover-2',
          )}
          aria-expanded={isUserMenuOpen}
          aria-haspopup="true"
          aria-label="User menu"
        >
          {/* User Name - Always visible with truncation for overflow */}
          <span className="text-sm font-medium text-headline max-w-[120px] truncate">
            {isLoggingOut ? 'Signing out...' : displayName}
          </span>

          {/* Chevron Indicator */}
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted transition-transform duration-200 flex-shrink-0',
              isUserMenuOpen && 'rotate-180',
            )}
          />
        </button>

        {/* Dropdown Menu */}
        {isUserMenuOpen && !isLoggingOut && (
          <div
            className="absolute right-0 mt-2 w-64 bg-surface-2 border-2 border-border rounded-lg shadow-soft-lg z-50 animate-in fade-in zoom-in-95 duration-200"
            role="menu"
            aria-orientation="vertical"
          >
            {/* User Info Section */}
            <div className="px-4 py-3 border-b border-divider">
              <p className="text-sm font-semibold text-headline truncate">
                {displayName}
              </p>
              {displayEmail && (
                <p className="text-xs text-muted truncate mt-0.5">
                  {displayEmail}
                </p>
              )}
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={handleNavigateToAccount}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-text hover:bg-surface-hover-2 hover:text-headline transition-colors"
                role="menuitem"
              >
                <Settings className="h-4 w-4 flex-shrink-0" />
                <span>Account Settings</span>
              </button>

              {/* Divider */}
              <div className="my-2 border-t border-divider" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-text hover:bg-surface-hover-2 hover:text-headline transition-colors"
                role="menuitem"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar