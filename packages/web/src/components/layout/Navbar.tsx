import React, { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Settings, LogOut, ChevronDown } from 'lucide-react'
import IconButton from '@/components/ui/IconButton'
import { cn } from '@/utils/cn.util'

interface NavbarProps {
  onMenuClick: () => void
}

/**
 * Route to page title mapping
 * Maps URL paths to their corresponding page titles
 */
const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/transaction': 'Transaction',
  '/report': 'Report',
  '/settings/account': 'Account Settings',
  '/settings/supplier': 'Supplier Management',
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
 * Mock user data
 * In a real application, this would come from an auth context or state management
 */
const CURRENT_USER = {
  name: 'Admin User',
  email: 'admin@simplestock.com',
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const pageTitle = getPageTitle(location.pathname)

  // User menu state
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
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
    navigate('/settings/account')
  }

  /**
   * Handle logout action
   * In a real app, this would call logout API and clear auth state
   */
  const handleLogout = () => {
    setIsUserMenuOpen(false)
    console.log('Logout clicked')
    // TODO: Implement actual logout logic
    // - Call logout API
    // - Clear auth tokens/state
    // - Redirect to login page
    navigate('/')
  }

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
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
            'hover:bg-surface-hover-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-2',
            isUserMenuOpen && 'bg-surface-hover-2',
          )}
          aria-expanded={isUserMenuOpen}
          aria-haspopup="true"
          aria-label="User menu"
        >
          {/* User Name - Always visible with truncation for overflow */}
          <span className="text-sm font-medium text-headline max-w-[120px] truncate">
            {CURRENT_USER.name}
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
        {isUserMenuOpen && (
          <div
            className="absolute right-0 mt-2 w-64 bg-surface-2 border-2 border-border rounded-lg shadow-soft-lg z-50 animate-in fade-in zoom-in-95 duration-200"
            role="menu"
            aria-orientation="vertical"
          >
            {/* User Info Section */}
            <div className="px-4 py-3 border-b border-divider">
              <p className="text-sm font-semibold text-headline truncate">
                {CURRENT_USER.name}
              </p>
              <p className="text-xs text-muted truncate mt-0.5">
                {CURRENT_USER.email}
              </p>
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