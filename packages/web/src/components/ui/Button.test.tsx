/**
 * @fileoverview Unit tests for Button component
 * @module components/ui/Button.test
 */

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import Button from '@/components/ui/Button'

describe('Button component', () => {
  describe('rendering', () => {
    it('should render children text', () => {
      // Arrange & Act
      render(<Button>Click Me</Button>)

      // Assert
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    it('should forward ref to button element', () => {
      // Arrange
      const ref = createRef<HTMLButtonElement>()

      // Act
      render(<Button ref={ref}>Ref Button</Button>)

      // Assert
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
      expect(ref.current?.tagName).toBe('BUTTON')
    })

    it('should default to type="button"', () => {
      // Arrange & Act
      render(<Button>Default Type</Button>)

      // Assert
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    })

    it('should allow type="submit"', () => {
      // Arrange & Act
      render(<Button type="submit">Submit</Button>)

      // Assert
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
    })

    it('should forward additional props to button', () => {
      // Arrange & Act
      render(
        <Button data-testid="custom-button" id="my-button">
          Props Button
        </Button>
      )

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-testid', 'custom-button')
      expect(button).toHaveAttribute('id', 'my-button')
    })
  })

  describe('variants', () => {
    it('should apply primary variant classes by default', () => {
      // Arrange & Act
      render(<Button>Primary</Button>)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary')
      expect(button).toHaveClass('text-on-primary')
    })

    it('should apply secondary variant classes', () => {
      // Arrange & Act
      render(<Button variant="secondary">Secondary</Button>)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border-2')
      expect(button).toHaveClass('border-primary')
      expect(button).toHaveClass('text-primary')
    })

    it('should apply ghost variant classes', () => {
      // Arrange & Act
      render(<Button variant="ghost">Ghost</Button>)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-transparent')
      expect(button).toHaveClass('text-text')
    })

    it('should apply danger variant classes', () => {
      // Arrange & Act
      render(<Button variant="danger">Danger</Button>)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-error')
      expect(button).toHaveClass('text-white')
    })

    it('should apply unstyled variant classes', () => {
      // Arrange & Act
      render(<Button variant="unstyled">Unstyled</Button>)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-transparent')
      expect(button).toHaveClass('border-0')
      expect(button).toHaveClass('p-0')
    })
  })

  describe('sizes', () => {
    it('should apply sm size classes', () => {
      // Arrange & Act
      render(<Button size="sm">Small</Button>)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-3')
      expect(button).toHaveClass('py-1.5')
      expect(button).toHaveClass('text-sm')
    })

    it('should apply md size classes by default', () => {
      // Arrange & Act
      render(<Button>Medium</Button>)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-4')
      expect(button).toHaveClass('py-2')
      expect(button).toHaveClass('text-base')
    })

    it('should apply lg size classes', () => {
      // Arrange & Act
      render(<Button size="lg">Large</Button>)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-5')
      expect(button).toHaveClass('py-3')
      expect(button).toHaveClass('text-lg')
    })

    it('should not apply size classes for unstyled variant', () => {
      // Arrange & Act
      render(
        <Button variant="unstyled" size="lg">
          Unstyled Large
        </Button>
      )

      // Assert
      const button = screen.getByRole('button')
      // unstyled variant should have p-0, not size padding
      expect(button).toHaveClass('p-0')
      expect(button).not.toHaveClass('px-5')
    })
  })

  describe('loading state', () => {
    it('should show spinner when isLoading is true', () => {
      // Arrange & Act
      render(<Button isLoading>Loading</Button>)

      // Assert
      const button = screen.getByRole('button')
      const spinner = button.querySelector('svg.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should hide children text visually when loading', () => {
      // Arrange & Act
      render(<Button isLoading>Loading Text</Button>)

      // Assert
      const textSpan = screen.getByText('Loading Text')
      expect(textSpan).toHaveClass('sr-only')
    })

    it('should disable button when isLoading is true', () => {
      // Arrange & Act
      render(<Button isLoading>Loading</Button>)

      // Assert
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should set aria-busy when loading', () => {
      // Arrange & Act
      render(<Button isLoading>Loading</Button>)

      // Assert
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
    })

    it('should not set aria-busy when not loading', () => {
      // Arrange & Act
      render(<Button>Not Loading</Button>)

      // Assert
      expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy')
    })

    it('should hide left icon when loading', () => {
      // Arrange
      const leftIcon = <span data-testid="left-icon">←</span>

      // Act
      render(
        <Button isLoading leftIcon={leftIcon}>
          Loading
        </Button>
      )

      // Assert
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument()
    })

    it('should render appropriately sized spinner based on button size', () => {
      // Arrange & Act
      const { rerender } = render(
        <Button isLoading size="sm">
          Small
        </Button>
      )

      // Assert small spinner
      let button = screen.getByRole('button')
      let spinner = button.querySelector('svg.animate-spin')
      expect(spinner).toHaveAttribute('width', '14')
      expect(spinner).toHaveAttribute('height', '14')

      // Act - rerender with large
      rerender(
        <Button isLoading size="lg">
          Large
        </Button>
      )

      // Assert large spinner
      button = screen.getByRole('button')
      spinner = button.querySelector('svg.animate-spin')
      expect(spinner).toHaveAttribute('width', '18')
      expect(spinner).toHaveAttribute('height', '18')
    })
  })

  describe('icons', () => {
    it('should render left icon', () => {
      // Arrange
      const leftIcon = <span data-testid="left-icon">←</span>

      // Act
      render(<Button leftIcon={leftIcon}>With Left Icon</Button>)

      // Assert
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      const button = screen.getByRole('button')
      const iconWrapper = within(button).getByTestId('left-icon').parentElement
      expect(iconWrapper).toHaveClass('flex', 'items-center')
    })

    it('should render right icon', () => {
      // Arrange
      const rightIcon = <span data-testid="right-icon">→</span>

      // Act
      render(<Button rightIcon={rightIcon}>With Right Icon</Button>)

      // Assert
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('should render both left and right icons', () => {
      // Arrange
      const leftIcon = <span data-testid="left-icon">←</span>
      const rightIcon = <span data-testid="right-icon">→</span>

      // Act
      render(
        <Button leftIcon={leftIcon} rightIcon={rightIcon}>
          Both Icons
        </Button>
      )

      // Assert
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('should not render right icon when loading', () => {
      // Arrange
      const rightIcon = <span data-testid="right-icon">→</span>

      // Act
      render(
        <Button isLoading rightIcon={rightIcon}>
          Loading
        </Button>
      )

      // Assert
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument()
    })
  })

  describe('states', () => {
    it('should apply disabled state', () => {
      // Arrange & Act
      render(<Button disabled>Disabled</Button>)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-disabled', 'true')
    })

    it('should apply fullWidth class', () => {
      // Arrange & Act
      render(<Button fullWidth>Full Width</Button>)

      // Assert
      expect(screen.getByRole('button')).toHaveClass('w-full')
    })

    it('should not apply fullWidth class by default', () => {
      // Arrange & Act
      render(<Button>Normal Width</Button>)

      // Assert
      expect(screen.getByRole('button')).not.toHaveClass('w-full')
    })

    it('should apply custom className', () => {
      // Arrange & Act
      render(<Button className="custom-class another-class">Custom</Button>)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
      expect(button).toHaveClass('another-class')
    })
  })

  describe('interactions', () => {
    it('should call onClick handler when clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Clickable</Button>)

      // Act
      await user.click(screen.getByRole('button'))

      // Assert
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when disabled', async () => {
      // Arrange
      const user = userEvent.setup()
      const handleClick = vi.fn()
      render(
        <Button disabled onClick={handleClick}>
          Disabled Button
        </Button>
      )

      // Act
      await user.click(screen.getByRole('button'))

      // Assert
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should not call onClick when loading', async () => {
      // Arrange
      const user = userEvent.setup()
      const handleClick = vi.fn()
      render(
        <Button isLoading onClick={handleClick}>
          Loading
        </Button>
      )

      // Act
      await user.click(screen.getByRole('button'))

      // Assert
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('should be focusable when not disabled', () => {
      // Arrange & Act
      render(<Button>Focusable</Button>)

      // Assert
      const button = screen.getByRole('button')
      button.focus()
      expect(button).toHaveFocus()
    })

    it('should have base accessibility classes', () => {
      // Arrange & Act
      render(<Button>Accessible</Button>)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus-visible:outline-none')
      expect(button).toHaveClass('focus-visible:ring-2')
    })
  })
})