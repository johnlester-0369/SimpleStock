/**
 * @fileoverview Unit tests for IconButton component
 * @module components/ui/IconButton.test
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { Settings, Trash } from 'lucide-react'
import IconButton from '@/components/ui/IconButton'

describe('IconButton component', () => {
  describe('rendering', () => {
    it('should render icon', () => {
      // Arrange & Act
      render(<IconButton icon={<Settings />} aria-label="Settings" />)

      // Assert
      const button = screen.getByRole('button', { name: /settings/i })
      expect(button).toBeInTheDocument()
      const svg = button.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should forward ref to button element', () => {
      // Arrange
      const ref = createRef<HTMLButtonElement>()

      // Act
      render(<IconButton icon={<Settings />} aria-label="Test" ref={ref} />)

      // Assert
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })

    it('should default to type="button"', () => {
      // Arrange & Act
      render(<IconButton icon={<Settings />} aria-label="Test" />)

      // Assert
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    })

    it('should accept type="submit"', () => {
      // Arrange & Act
      render(<IconButton icon={<Settings />} aria-label="Test" type="submit" />)

      // Assert
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
    })

    it('should forward additional props to button', () => {
      // Arrange & Act
      render(
        <IconButton
          icon={<Settings />}
          aria-label="Test"
          data-testid="icon-btn"
          id="my-button"
        />
      )

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-testid', 'icon-btn')
      expect(button).toHaveAttribute('id', 'my-button')
    })
  })

  describe('variants', () => {
    it('should apply ghost variant by default', () => {
      // Arrange & Act
      render(<IconButton icon={<Settings />} aria-label="Test" />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-transparent')
      expect(button).toHaveClass('text-text')
    })

    it('should apply primary variant classes', () => {
      // Arrange & Act
      render(
        <IconButton variant="primary" icon={<Settings />} aria-label="Test" />
      )

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary')
      expect(button).toHaveClass('text-on-primary')
    })

    it('should apply secondary variant classes', () => {
      // Arrange & Act
      render(
        <IconButton variant="secondary" icon={<Settings />} aria-label="Test" />
      )

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border-2')
      expect(button).toHaveClass('border-primary')
      expect(button).toHaveClass('text-primary')
    })

    it('should apply danger variant classes', () => {
      // Arrange & Act
      render(<IconButton variant="danger" icon={<Trash />} aria-label="Delete" />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-error')
      expect(button).toHaveClass('text-white')
    })

    it('should apply unstyled variant classes', () => {
      // Arrange & Act
      render(<IconButton variant="unstyled" icon={<Settings />} aria-label="Test" />)

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
      render(<IconButton size="sm" icon={<Settings />} aria-label="Test" />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-8', 'w-8')
      expect(button).toHaveClass('p-1.5')
    })

    it('should apply md size classes by default', () => {
      // Arrange & Act
      render(<IconButton icon={<Settings />} aria-label="Test" />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10', 'w-10')
      expect(button).toHaveClass('p-2')
    })

    it('should apply lg size classes', () => {
      // Arrange & Act
      render(<IconButton size="lg" icon={<Settings />} aria-label="Test" />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-12', 'w-12')
      expect(button).toHaveClass('p-2.5')
    })

    it('should not apply size container classes for unstyled variant', () => {
      // Arrange & Act
      render(
        <IconButton
          variant="unstyled"
          size="lg"
          icon={<Settings />}
          aria-label="Test"
        />
      )

      // Assert
      const button = screen.getByRole('button')
      expect(button).not.toHaveClass('h-12', 'w-12')
      expect(button).toHaveClass('p-0')
    })
  })

  describe('loading state', () => {
    it('should show spinner when isLoading is true', () => {
      // Arrange & Act
      render(<IconButton isLoading icon={<Settings />} aria-label="Test" />)

      // Assert
      const button = screen.getByRole('button')
      const spinner = button.querySelector('svg.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should hide icon when loading', () => {
      // Arrange & Act
      render(<IconButton isLoading icon={<Settings />} aria-label="Test" />)

      // Assert
      const button = screen.getByRole('button')
      const settingsIcon = button.querySelector('[data-lucide="Settings"]')
      expect(settingsIcon).not.toBeInTheDocument()
    })

    it('should disable button when loading', () => {
      // Arrange & Act
      render(<IconButton isLoading icon={<Settings />} aria-label="Test" />)

      // Assert
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should set aria-busy when loading', () => {
      // Arrange & Act
      render(<IconButton isLoading icon={<Settings />} aria-label="Test" />)

      // Assert
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
    })

    it('should not set aria-busy when not loading', () => {
      // Arrange & Act
      render(<IconButton icon={<Settings />} aria-label="Test" />)

      // Assert
      expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy')
    })

    it('should render appropriately sized spinner based on button size', () => {
      // Arrange & Act
      const { rerender } = render(
        <IconButton size="sm" isLoading icon={<Settings />} aria-label="Test" />
      )

      // Assert small spinner
      let button = screen.getByRole('button')
      let spinner = button.querySelector('svg.animate-spin')
      expect(spinner).toHaveAttribute('width', '14')
      expect(spinner).toHaveAttribute('height', '14')

      // Act - rerender with large
      rerender(
        <IconButton size="lg" isLoading icon={<Settings />} aria-label="Test" />
      )

      // Assert large spinner
      button = screen.getByRole('button')
      spinner = button.querySelector('svg.animate-spin')
      expect(spinner).toHaveAttribute('width', '18')
      expect(spinner).toHaveAttribute('height', '18')
    })
  })

  describe('states', () => {
    it('should apply disabled state', () => {
      // Arrange & Act
      render(<IconButton disabled icon={<Settings />} aria-label="Test" />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-disabled', 'true')
    })

    it('should apply custom className', () => {
      // Arrange & Act
      render(
        <IconButton
          icon={<Settings />}
          aria-label="Test"
          className="custom-class another-class"
        />
      )

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
      render(
        <IconButton
          icon={<Settings />}
          aria-label="Test"
          onClick={handleClick}
        />
      )

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
        <IconButton
          disabled
          icon={<Settings />}
          aria-label="Test"
          onClick={handleClick}
        />
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
        <IconButton
          isLoading
          icon={<Settings />}
          aria-label="Test"
          onClick={handleClick}
        />
      )

      // Act
      await user.click(screen.getByRole('button'))

      // Assert
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('should require aria-label or aria-labelledby', () => {
      // Arrange - spy on console.warn
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // Act - render without aria-label
      render(<IconButton icon={<Settings />} />)

      // Assert - warning was logged
      expect(consoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Missing aria-label')
      )

      // Cleanup
      consoleWarn.mockRestore()
    })

    it('should accept aria-label', () => {
      // Arrange & Act
      render(<IconButton icon={<Settings />} aria-label="Settings button" />)

      // Assert
      expect(screen.getByRole('button')).toHaveAccessibleName('Settings button')
    })

    it('should accept aria-labelledby', () => {
      // Arrange & Act
      render(
        <div>
          <span id="label-id">Custom Label</span>
          <IconButton icon={<Settings />} aria-labelledby="label-id" />
        </div>
      )

      // Assert
      expect(screen.getByRole('button')).toHaveAccessibleName('Custom Label')
    })

    it('should be focusable when not disabled', () => {
      // Arrange & Act
      render(<IconButton icon={<Settings />} aria-label="Focusable" />)

      // Assert
      const button = screen.getByRole('button')
      button.focus()
      expect(button).toHaveFocus()
    })

    it('should have base accessibility classes', () => {
      // Arrange & Act
      render(<IconButton icon={<Settings />} aria-label="Accessible" />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus-visible:outline-none')
      expect(button).toHaveClass('focus-visible:ring-2')
    })
  })
})