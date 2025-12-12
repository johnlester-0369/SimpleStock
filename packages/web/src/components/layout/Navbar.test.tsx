import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Navbar from './Navbar'

// Mock dependencies
vi.mock('@/components/ui/IconButton', () => ({
  default: ({ icon, onClick, 'aria-label': ariaLabel }: any) => (
    <button onClick={onClick} aria-label={ariaLabel}>
      {icon} Mock IconButton
    </button>
  ),
}))

vi.mock('@/utils/cn.util', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Navbar', () => {
  const user = userEvent.setup()
  const renderNavbar = (initialPath = '/dashboard') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="*" element={<Navbar onMenuClick={vi.fn()} />} />
        </Routes>
      </MemoryRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render page title based on current route', () => {
    renderNavbar('/dashboard')
    expect(screen.getByText('Dashboard')).toBeInTheDocument()

    renderNavbar('/products')
    expect(screen.getByText('Products')).toBeInTheDocument()

    renderNavbar('/settings/account')
    expect(screen.getByText('Account Settings')).toBeInTheDocument()
  })

  it('should show default title for unknown route', () => {
    renderNavbar('/unknown')
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('should render user name', () => {
    renderNavbar()
    expect(screen.getByText('Admin User')).toBeInTheDocument()
  })

  it('should toggle user menu on button click', async () => {
    renderNavbar()
    const userButton = screen.getByRole('button', { name: /user menu/i })
    
    // Menu should be hidden initially
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    
    // Click to open
    await user.click(userButton)
    expect(screen.getByRole('menu')).toBeInTheDocument()
    
    // Click to close
    await user.click(userButton)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('should close user menu when clicking outside', async () => {
    renderNavbar()
    const userButton = screen.getByRole('button', { name: /user menu/i })
    
    // Open menu
    await user.click(userButton)
    expect(screen.getByRole('menu')).toBeInTheDocument()
    
    // Click outside
    await user.click(document.body)
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  it('should close user menu on Escape key', async () => {
    renderNavbar()
    const userButton = screen.getByRole('button', { name: /user menu/i })
    
    // Open menu
    await user.click(userButton)
    expect(screen.getByRole('menu')).toBeInTheDocument()
    
    // Press Escape
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  it('should navigate to account settings when menu item clicked', async () => {
    renderNavbar()
    const userButton = screen.getByRole('button', { name: /user menu/i })
    
    // Open menu
    await user.click(userButton)
    
    // Click account settings
    const accountButton = screen.getByRole('menuitem', { name: /account settings/i })
    await user.click(accountButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/settings/account')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('should call onMenuClick when mobile menu button clicked', async () => {
    const mockOnMenuClick = vi.fn()
    render(
      <MemoryRouter>
        <Navbar onMenuClick={mockOnMenuClick} />
      </MemoryRouter>
    )
    
    const menuButton = screen.getByRole('button', { name: /toggle sidebar/i })
    await user.click(menuButton)
    
    expect(mockOnMenuClick).toHaveBeenCalledTimes(1)
  })

  it('should truncate long user names', () => {
    renderNavbar()
    const userButton = screen.getByText('Admin User')
    expect(userButton).toHaveClass('truncate')
  })
})