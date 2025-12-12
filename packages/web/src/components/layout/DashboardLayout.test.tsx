import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DashboardLayout from './DashboardLayout'
import { MemoryRouter } from 'react-router-dom'

// Mock child components to isolate Layout tests
vi.mock('./Sidebar', () => ({
  default: ({ isOpen, onClose }: any) => (
    <div data-testid="mock-sidebar" data-is-open={isOpen}>
      <button onClick={onClose}>Close Sidebar</button>
    </div>
  ),
}))

vi.mock('./Navbar', () => ({
  default: ({ onMenuClick }: any) => (
    <div data-testid="mock-navbar">
      <button onClick={onMenuClick}>Toggle Menu</button>
    </div>
  ),
}))

describe('DashboardLayout', () => {
  const renderLayout = () => {
    return render(
      <MemoryRouter>
        <DashboardLayout />
      </MemoryRouter>
    )
  }

  it('should render Sidebar and Navbar', () => {
    renderLayout()
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('mock-navbar')).toBeInTheDocument()
  })

  it('should render main content area with outlet', () => {
    renderLayout()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveClass('min-w-0')
  })

  it('should have correct layout structure', () => {
    renderLayout()
    const container = screen.getByRole('main').parentElement
    expect(container).toHaveClass('flex-1', 'flex', 'flex-col', 'min-h-screen')
  })

  it('should apply responsive margin on desktop', () => {
    renderLayout()
    const container = screen.getByRole('main').parentElement
    expect(container).toHaveClass('lg:ml-0')
  })
})