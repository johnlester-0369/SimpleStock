/**
 * @fileoverview Unit tests for Input component
 * @module components/ui/Input.test
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Search, Eye } from 'lucide-react'
import Input from '@/components/ui/Input'

describe('Input component', () => {
  describe('rendering', () => {
    it('should render input with label', () => {
      // Arrange & Act
      render(<Input label="Username" placeholder="Enter username" />)

      // Assert
      expect(screen.getByLabelText('Username')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument()
    })

    it('should render without label', () => {
      // Arrange & Act
      render(<Input placeholder="No label" />)

      // Assert
      expect(screen.getByPlaceholderText('No label')).toBeInTheDocument()
      expect(screen.queryByRole('label')).not.toBeInTheDocument()
    })

    it('should render helper text', () => {
      // Arrange & Act
      render(<Input helperText="This is a helpful message" />)

      // Assert
      expect(screen.getByText('This is a helpful message')).toBeInTheDocument()
    })

    it('should render error message', () => {
      // Arrange & Act
      render(<Input error="This field is required" />)

      // Assert
      expect(screen.getByText('This field is required')).toBeInTheDocument()
      expect(screen.getByText('This field is required')).toHaveClass('text-error')
    })
  })

  describe('variants', () => {
    it('should render default variant', () => {
      // Arrange & Act
      render(<Input placeholder="test" />)

      // Assert
      const input = screen.getByPlaceholderText('test')
      expect(input).toHaveClass('border-border')
      expect(input).not.toHaveClass('border-error')
      expect(input).not.toHaveClass('border-success')
    })

    it('should render error variant when error prop is provided', () => {
      // Arrange & Act
      render(<Input error="Error" placeholder="test" />)

      // Assert
      const input = screen.getByPlaceholderText('test')
      expect(input).toHaveClass('border-error')
      expect(input).toHaveClass('bg-error/5')
    })

    it('should render success variant', () => {
      // Arrange & Act
      render(<Input variant="success" placeholder="test" />)

      // Assert
      const input = screen.getByPlaceholderText('test')
      expect(input).toHaveClass('border-success')
      expect(input).toHaveClass('bg-success/5')
    })

    it('should render error variant when both variant and error props', () => {
      // Arrange & Act
      render(<Input variant="success" error="Overrides" placeholder="test" />)

      // Assert
      const input = screen.getByPlaceholderText('test')
      expect(input).toHaveClass('border-error') // Error overrides variant
    })
  })

  describe('sizes', () => {
    it('should render sm size', () => {
      // Arrange & Act
      render(<Input inputSize="sm" placeholder="test" />)

      // Assert
      const input = screen.getByPlaceholderText('test')
      expect(input).toHaveClass('px-3', 'py-1.5', 'text-sm')
    })

    it('should render md size by default', () => {
      // Arrange & Act
      render(<Input placeholder="test" />)

      // Assert
      const input = screen.getByPlaceholderText('test')
      expect(input).toHaveClass('px-4', 'py-2.5', 'text-base')
    })

    it('should render lg size', () => {
      // Arrange & Act
      render(<Input inputSize="lg" placeholder="test" />)

      // Assert
      const input = screen.getByPlaceholderText('test')
      expect(input).toHaveClass('px-5', 'py-3', 'text-lg')
    })
  })

  describe('icons', () => {
    it('should render left icon', () => {
      // Arrange
      const leftIcon = <Search data-testid="left-icon" />

      // Act
      render(<Input leftIcon={leftIcon} placeholder="test" />)

      // Assert
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      const input = screen.getByPlaceholderText('test')
      expect(input).toHaveClass('pl-10')
    })

    it('should render right icon', () => {
      // Arrange
      const rightIcon = <Eye data-testid="right-icon" />

      // Act
      render(<Input rightIcon={rightIcon} placeholder="test" />)

      // Assert
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
      const input = screen.getByPlaceholderText('test')
      expect(input).toHaveClass('pr-10')
    })

    it('should render both left and right icons', () => {
      // Arrange
      const leftIcon = <Search data-testid="left-icon" />
      const rightIcon = <Eye data-testid="right-icon" />

      // Act
      render(<Input leftIcon={leftIcon} rightIcon={rightIcon} placeholder="test" />)

      // Assert
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
      const input = screen.getByPlaceholderText('test')
      expect(input).toHaveClass('pl-10', 'pr-10')
    })

    it('should show validation icon for error state', () => {
      // Arrange & Act
      render(<Input error="Error message" placeholder="test" />)

      // Assert
      // Should show AlertCircle icon for error
      const input = screen.getByPlaceholderText('test')
      const iconWrapper = input.parentElement?.querySelector('[class*="right-3"]')
      expect(iconWrapper).toBeInTheDocument()
      expect(iconWrapper).toHaveClass('text-error')
    })

    it('should show validation icon for success state', () => {
      // Arrange & Act
      render(<Input variant="success" placeholder="test" />)

      // Assert
      // Should show CheckCircle icon for success
      const input = screen.getByPlaceholderText('test')
      const iconWrapper = input.parentElement?.querySelector('[class*="right-3"]')
      expect(iconWrapper).toBeInTheDocument()
      expect(iconWrapper).toHaveClass('text-success')
    })

    it('should prioritize validation icon over custom right icon', () => {
      // Arrange
      const rightIcon = <Eye data-testid="custom-icon" />

      // Act
      render(<Input rightIcon={rightIcon} error="Error" placeholder="test" />)

      // Assert
      // Should show AlertCircle (error icon) not custom icon
      expect(screen.queryByTestId('custom-icon')).not.toBeInTheDocument()
      const input = screen.getByPlaceholderText('test')
      const iconWrapper = input.parentElement?.querySelector('[class*="right-3"]')
      expect(iconWrapper).toHaveClass('text-error')
    })
  })

  describe('accessibility', () => {
    it('should have aria-invalid when in error state', () => {
      // Arrange & Act
      render(<Input error="Error" placeholder="test" />)

      // Assert
      expect(screen.getByPlaceholderText('test')).toHaveAttribute('aria-invalid', 'true')
    })

    it('should have aria-describedby when helper text or error', () => {
      // Arrange & Act
      render(<Input helperText="Help text" placeholder="test" />)

      // Assert
      const input = screen.getByPlaceholderText('test')
      expect(input).toHaveAttribute('aria-describedby')
    })

    it('should associate label with input', () => {
      // Arrange & Act
      render(<Input label="Email" id="email-input" />)

      // Assert
      const input = screen.getByLabelText('Email')
      expect(input).toHaveAttribute('id', 'email-input')
    })

    it('should generate id when not provided', () => {
      // Arrange & Act
      render(<Input label="Auto ID" />)

      // Assert
      const label = screen.getByText('Auto ID')
      const inputId = label.getAttribute('for')
      expect(inputId).toBeDefined()
      expect(inputId).toMatch(/^input-/)
    })
  })

  describe('interactions', () => {
    it('shoul changes', async () => {
      // Arrange
      const user = userEvent.setup()
      const handleChange = vi.fn()

      // Act
      render(<Input onChange={handleChange} placeholder="test" />)
      await user.type(screen.getByPlaceholderText('test'), 'Hello')

      // Assert
      expect(handleChange).toHaveBeenCalledTimes(5) // Once per character
    })

    it('should be disabled when disabled prop is true', () => {
      // Arrange & Act
      render(<Input disabled placeholder="test" />)

      // Assert
      expect(screen.getByPlaceholderText('test')).toBeDisabled()
      expect(screen.getByPlaceholderText('test')).toHaveClass('disabled:opacity-60')
    })

    it('should forward ref to input element', () => {
      // Arrange
      const ref = React.createRef<HTMLInputElement>()

      // Act
      render(<Input ref={ref} placeholder="test" />)

      // Assert
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })

    it('should support different input types', () => {
      // Arrange & Act
      render(<Input type="password" placeholder="Enter password" />)

      // Assert - password inputs don't have role="textbox", use placeholder to find
      const input = screen.getByPlaceholderText('Enter password')
      expect(input).toHaveAttribute('type', 'password')
    })
  })

  describe('fullWidth', () => {
    it('should be full width by default', () => {
      // Arrange & Act
      render(<Input placeholder="test" />)

      // Assert - check the outer wrapper div has w-full
      const input = screen.getByPlaceholderText('test')
      const wrapper = input.closest('.relative.w-full')
      expect(wrapper).toBeInTheDocument()
    })

    it('should not be full width when fullWidth={false}', () => {
      // Arrange & Act
      render(<Input fullWidth={false} placeholder="test" />)

      // Assert - wrapper should not have w-full class
      const input = screen.getByPlaceholderText('test')
      const wrapper = input.closest('.relative')
      expect(wrapper).not.toHaveClass('w-full')
    })
  })
})