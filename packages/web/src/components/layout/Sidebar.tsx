import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  FileBarChart,
  Settings,
  LogOut,
  ChevronDown,
  UserCircle,
  Truck,
} from 'lucide-react'
import { BrandLogo, BrandName } from '@/components/common/Brand'
import CloseButton from '@/components/ui/CloseButton'
import { cn } from '@/utils/cn.util'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  children?: NavChildItem[]
}

interface NavChildItem {
  label: string
  path: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: 'Products',
    path: '/products',
    icon: <Package className="h-5 w-5" />,
  },
  {
    label: 'Transaction',
    path: '/transaction',
    icon: <ArrowLeftRight className="h-5 w-5" />,
  },
  {
    label: 'Report',
    path: '/report',
    icon: <FileBarChart className="h-5 w-5" />,
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: <Settings className="h-5 w-5" />,
    children: [
      {
        label: 'Account',
        path: '/settings/account',
        icon: <UserCircle className="h-4 w-4" />,
      },
      {
        label: 'Supplier',
        path: '/settings/supplier',
        icon: <Truck className="h-4 w-4" />,
      },
    ],
  },
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation()
  
  // Track which parent items are expanded
  // Settings is always expanded by default
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    // Always include Settings in the default expanded items
    const defaultExpanded = ['/settings']
    
    // Also auto-expand any other parent if its child is active on initial load
    const activeParent = navItems.find(
      (item) =>
        item.children?.some((child) => location.pathname.startsWith(child.path))
    )
    
    // Add active parent if it's not already in the default expanded list
    if (activeParent && !defaultExpanded.includes(activeParent.path)) {
      defaultExpanded.push(activeParent.path)
    }
    
    return defaultExpanded
  })

  /**
   * Toggle expansion state of a parent item
   */
  const toggleExpand = (path: string) => {
    setExpandedItems((prev) =>
      prev.includes(path)
        ? prev.filter((p) => p !== path)
        : [...prev, path]
    )
  }

  /**
   * Check if a parent item should be expanded
   */
  const isExpanded = (path: string) => expandedItems.includes(path)

  /**
   * Check if any child of a parent is currently active
   */
  const hasActiveChild = (children: NavChildItem[] | undefined) => {
    if (!children) return false
    return children.some((child) => location.pathname.startsWith(child.path))
  }

  /**
   * Render a navigation item (parent or regular)
   */
  const renderNavItem = (item: NavItem) => {
    const hasChildren = item.children && item.children.length > 0
    const isParentActive = hasActiveChild(item.children)
    const expanded = isExpanded(item.path) || isParentActive

    if (hasChildren) {
      return (
        <li key={item.path}>
          {/* Parent item button */}
          <button
            onClick={() => toggleExpand(item.path)}
            className={cn(
              'flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isParentActive
                ? 'bg-primary/10 text-primary'
                : 'text-text hover:bg-surface-hover-2 hover:text-headline'
            )}
            aria-expanded={expanded}
            aria-controls={`submenu-${item.path.replace('/', '')}`}
          >
            <span className="flex items-center gap-3">
              {item.icon}
              <span>{item.label}</span>
            </span>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                expanded && 'rotate-180'
              )}
            />
          </button>

          {/* Children submenu */}
          <ul
            id={`submenu-${item.path.replace('/', '')}`}
            className={cn(
              'mt-1 ml-4 pl-3 border-l border-border space-y-1 overflow-hidden transition-all duration-200',
              expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            )}
          >
            {item.children?.map((child) => (
              <li key={child.path}>
                <NavLink
                  to={child.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-on-primary hover:bg-primary/90 hover:text-on-primary'
                        : 'text-text hover:bg-surface-hover-2 hover:text-headline'
                    )
                  }
                >
                  {child.icon}
                  <span>{child.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </li>
      )
    }

    // Regular nav item without children
    return (
      <li key={item.path}>
        <NavLink
          to={item.path}
          end={item.path === '/dashboard'}
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-on-primary hover:bg-primary/90 hover:text-on-primary'
                : 'text-text hover:bg-surface-hover-2 hover:text-headline'
            )
          }
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      </li>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-surface-2 flex flex-col transition-transform duration-300 ease-in-out',
          'lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand Section */}
        <div className="flex items-center justify-between h-16 px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <BrandLogo size="md" />
            <BrandName />
          </div>
          <CloseButton
            onClick={onClose}
            size="sm"
            variant="ghost"
            className="lg:hidden"
            aria-label="Close sidebar"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar">
          <ul className="space-y-1">
            {navItems.map(renderNavItem)}
          </ul>
        </nav>

        {/* Footer / Logout */}
        <div className="p-3 border-t border-border flex-shrink-0">
          <button
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-text hover:bg-surface-hover-2 hover:text-headline transition-colors"
            onClick={() => {
              // Handle logout logic here
              console.log('Logout clicked')
            }}
          >
            <LogOut className="h-5 w-5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar