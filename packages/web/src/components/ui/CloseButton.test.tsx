/**
 * @fileoverview Unit tests for CloseButton component
 * @module components/ui/CloseButton.test
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import CloseButton from '@/components/ui/CloseButton'

describe('CloseButton component', () => {
  describe('rendering', () => {
    it('should render with default aria-label', () => {
      // Arrange & Act
      render(<CloseButton />)

      // Assert
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
    })

    it('should accept custom aria-label', () => {
      // Arrange & Act
      render(<CloseButton aria-label="Close dialog" />)

      // Assert
      expect(
        screen.getByRole('button', { name: /close dialog/i })
      ).toBeInTheDocument()
    })

    it('should forward ref to button element', () => {
      // Arrange
      const ref = createRef<HTMLButtonElement>()

      // Act
      render(<CloseButton ref={ref} />)

      // Assert
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
      expect(ref.current?.tagName).toBe('BUTTON')
    })

    it('should forward additional props to button', () => {
      // Arrange & Act
      render(
        <CloseButton data-testid="custom-close-button" id="my-close-button" />
      )

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-testid', 'custom-close-button')
      expect(button).toHaveAttribute('id', 'my-close-button')
    })

    it('should render X icon', () => {
      // Arrange & Act
      render(<CloseButton />)

      // Assert
      const button = screen.getByRole('button')
      const svg = button.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('lucide-x')
    })
  })

  describe('variants', () => {
    it('should apply ghost variant by default', () => {
      // Arrange & Act
      render(<CloseButton />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-transparent')
      expect(button).toHaveClass('text-text')
    })

    it('should apply primary variant when specified', () => {
      // Arrange & Act
      render(<CloseButton variant="primary" />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary')
      expect(button).toHaveClass('text-on-primary')
    })
  })

  describe('sizes', () => {
    it('should apply sm size classes', () => {
      // Arrange & Act
      render(<CloseButton size="sm" />)

      // Assert
      const button = screen.getByRole('button')
      // IconButton uses fixed padding for square buttons. Adjust assertion.
      expect(button).toHaveClass('h-8', 'w-8') // sm size dimensions
      expect(button).toHaveClass('p-1.5') // sm padding
    })

    it('should apply lg size classes', () => {
      // Arrange & Act
      render(<CloseButton size="lg" />)

      // Assert
      const button = screen.getByRole('button')
      // IconButton uses fixed padding for square buttons. Adjust assertion.
      expect(button).toHaveClass('h-12', 'w-12') // lg size dimensions
      expect(button).toHaveClass('p-2.5') // lg padding
    })
  })

  describe('loading state', () => {
    it('should show loading spinner when isLoading is true', () => {
      // Arrange & Act
      render(<CloseButton isLoading />)

      // Assert
      const button = screen.getByRole('button')
      const spinner = button.querySelector('svg.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should be disabled when loading', () => {
      // Arrange & Act
      render(<CloseButton isLoading />)

      // Assert
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should be disabled when disabled prop is true', () => {
      // Arrange & Act
      render(<CloseButton disabled />)

      // Assert
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('interactions', () => {
    it('should call onClick when clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      const onClick = vi.fn()
      render(<CloseButton onClick={onClick} />)

      // Act
      await user.click(screen.getByRole('button'))

      // Assert
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when disabled', async () => {
      // Arrange
      const user = userEvent.setup()
      const onClick = vi.fn()
      render(<CloseButton disabled onClick={onClick} />)

      // Act
      await user.click(screen.getByRole('button'))

      // Assert
      expect(onClick).not.toHaveBeenCalled()
    })

    it('should not call onClick when loading', async () => {
      // Arrange
      const user = userEvent.setup()
      const onClick = vi.fn()
      render(<CloseButton isLoading onClick={onClick} />)

      // Act
      await user.click(screen.getByRole('button'))

      // Assert
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('should have aria-busy when loading', () => {
      // Arrange & Act
      render(<CloseButton isLoading />)

      // Assert
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
    })

    it('should have type="button" by default', () => {
      // Arrange & Act
      render(<CloseButton />)

      // Assert
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    })

    it('should accept type="submit"', () => {
      // Arrange & Act
      render(<CloseButton type="submit" />)

      // Assert
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
    })
  })
})