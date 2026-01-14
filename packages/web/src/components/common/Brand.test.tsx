import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrandLogo, BrandName } from './Brand'
import { APP_NAME } from '@/constants/app.constants'
import type { SVGProps } from 'react'

// Mock the SVG import with proper typing
vi.mock('@/assets/logo.svg?react', () => ({
  default: (props: SVGProps<SVGSVGElement>) => <svg data-testid="mock-logo" {...props} />,
}))

describe('Brand Components', () => {
  describe('BrandLogo', () => {
    it('should render SVG logo with primary color', () => {
      render(<BrandLogo />)
      const logo = screen.getByTestId('mock-logo')
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveClass('text-primary')
    })

    it('should apply correct size classes', () => {
      const { rerender } = render(<BrandLogo size="sm" />)
      expect(screen.getByTestId('mock-logo')).toHaveClass('h-8 w-8')

      rerender(<BrandLogo size="md" />)
      expect(screen.getByTestId('mock-logo')).toHaveClass('h-9 w-9')

      rerender(<BrandLogo size="lg" />)
      expect(screen.getByTestId('mock-logo')).toHaveClass('h-12 w-12')
    })

    it('should default to large size when no size prop', () => {
      render(<BrandLogo />)
      expect(screen.getByTestId('mock-logo')).toHaveClass('h-12 w-12')
    })
  })

  describe('BrandName', () => {
    it('should render the application name', () => {
      render(<BrandName />)
      expect(screen.getByText(APP_NAME)).toBeInTheDocument()
    })

    it('should have correct typography classes', () => {
      render(<BrandName />)
      const element = screen.getByText(APP_NAME)
      expect(element).toHaveClass('font-bold', 'text-xl', 'text-headline')
    })
  })
})