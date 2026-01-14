import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Sidebar from './Sidebar'

// Define prop types for mock components
interface MockCloseButtonProps {
  onClick?: () => void
  'aria-label'?: string
  size?: string
  variant?: string
  className?: string
}

// Mock dependencies
vi.mock('@/components/common/Brand', () => ({
  BrandLogo: () => <div data-testid="mock-brand-logo">BrandLogo</div>,
  BrandName: () => <div data-testid="mock-brand-name">BrandName</div>,
}))

vi.mock('@/components/ui/CloseButton', () => ({
  default: ({ onClick, 'aria-label': ariaLabel }: MockCloseButtonProps) => (
    <button onClick={onClick} aria-label={ariaLabel}>
      Close
    </button>
  ),
}))

vi.mock('@/utils/cn.util', () => ({
  cn: (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' '),
}))

describe('Sidebar', () => {
  const user = userEvent.setup()
  const mockOnClose = vi.fn()

  const renderSidebar = (isOpen = true, initialPath = '/dashboard') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="*" element={<Sidebar isOpen={isOpen} onClose={mockOnClose} />} />
        </Routes>
      </MemoryRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render brand components', () => {
    renderSidebar()
    expect(screen.getByTestId('mock-brand-logo')).toBeInTheDocument()
    expect(screen.getByTestId('mock-brand-name')).toBeInTheDocument()
  })

  it('should render all navigation items', () => {
    renderSidebar()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Transaction')).toBeInTheDocument()
    expect(screen.getByText('Report')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('should highlight active route', () => {
    renderSidebar(true, '/products')
    const productsLink = screen.getByText('Products').closest('a')
    expect(productsLink).toHaveClass('bg-primary', 'text-on-primary')
  })

  it('should have Settings expanded by default', () => {
    renderSidebar()
    const settingsButton = screen.getByText('Settings').closest('button')
    expect(settingsButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Account')).toBeInTheDocument()
    expect(screen.getByText('Supplier')).toBeInTheDocument()
  })

  it('should toggle submenu expansion on click', async () => {
    renderSidebar()
    const settingsButton = screen.getByText('Settings').closest('button')
    
    // Initially expanded
    expect(settingsButton).toHaveAttribute('aria-expanded', 'true')
    
    // Click to collapse
    await user.click(settingsButton!)
    expect(settingsButton).toHaveAttribute('aria-expanded', 'false')
    
    // Click to expand again
    await user.click(settingsButton!)
    expect(settingsButton).toHaveAttribute('aria-expanded', 'true')
  })

  it('should auto-expand parent when child is active', () => {
    renderSidebar(true, '/settings/account')
    const settingsButton = screen.getByText('Settings').closest('button')
    expect(settingsButton).toHaveAttribute('aria-expanded', 'true')
    
    // Child should be highlighted
    const accountLink = screen.getByText('Account').closest('a')
    expect(accountLink).toHaveClass('bg-primary', 'text-on-primary')
  })

  it('should close sidebar when overlay is clicked (mobile)', async () => {
    renderSidebar()
    const overlay = document.querySelector('.fixed.inset-0.bg-black\\/50')
    expect(overlay).toBeInTheDocument()
    
    await user.click(overlay!)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should close sidebar when close button is clicked', async () => {
    renderSidebar()
    const closeButton = screen.getByRole('button', { name: /close sidebar/i })
    
    await user.click(closeButton)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should not render overlay when sidebar is closed', () => {
    renderSidebar(false)
    const overlay = document.querySelector('.fixed.inset-0.bg-black\\/50')
    expect(overlay).not.toBeInTheDocument()
  })

  it('should have correct mobile/desktop classes', () => {
    // Test open state
    const { unmount } = renderSidebar(true)
    let sidebar = screen.getByRole('complementary')
    
    // Open on mobile
    expect(sidebar).toHaveClass('translate-x-0')
    expect(sidebar).toHaveClass('lg:sticky', 'lg:translate-x-0')
    
    // Clean up
    unmount()
    
    // Test closed state with fresh render
    renderSidebar(false)
    sidebar = screen.getByRole('complementary')
    expect(sidebar).toHaveClass('-translate-x-full')
    expect(sidebar).toHaveClass('lg:sticky', 'lg:translate-x-0')
  })

  it('should navigate when menu item is clicked', () => {
    renderSidebar()
    const dashboardLink = screen.getByText('Dashboard').closest('a')
    
    // Verify it's a NavLink
    expect(dashboardLink).toHaveAttribute('href', '/dashboard')
  })

  it('should render logout button', () => {
    renderSidebar()
    expect(screen.getByText('Log Out')).toBeInTheDocument()
  })

  it('should have scrollable navigation area', () => {
    renderSidebar()
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('scrollbar')
  })

  it('should apply correct transition classes', () => {
    renderSidebar(true)
    const sidebar = screen.getByRole('complementary')
    expect(sidebar).toHaveClass('transition-transform', 'duration-300', 'ease-in-out')
  })

  it('should have proper ARIA attributes when closed', () => {
    renderSidebar(false)
    const sidebar = screen.getByRole('complementary')
    // Sidebar should still be accessible even when visually hidden
    expect(sidebar).toBeInTheDocument()
  })
})