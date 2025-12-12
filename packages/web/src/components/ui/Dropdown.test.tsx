/**
 * @fileoverview Unit tests for Dropdown component
 * @module components/ui/Dropdown.test
 */

import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Dropdown, { type DropdownItem } from '@/components/ui/Dropdown'

// Mock scrollIntoView which is not implemented in JSDOM
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
})

const options: DropdownItem[] = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3', disabled: true },
  { type: 'separator' as const },
  { label: 'Option 4', value: '4' },
]

describe('Dropdown component', () => {
  describe('rendering', () => {
    it('should render with placeholder', () => {
      // Arrange & Act
      render(<Dropdown options={options} placeholder="Select" />)

      // Assert
      expect(screen.getByRole('button', { name: /select/i })).toBeInTheDocument()
    })

    it('should render label when provided', () => {
      // Arrange & Act
      render(
        <Dropdown
          options={options}
          placeholder="Select"
          label="Category"
        />
      )

      // Assert
      expect(screen.getByText('Category')).toBeInTheDocument()
    })

    it('should show selected option label', () => {
      // Arrange & Act
      render(
        <Dropdown
          options={options}
          placeholder="Select"
          value="2"
        />
      )

      // Assert
      expect(screen.getByRole('button')).toHaveTextContent('Option 2')
    })

    it('should render error message when provided', () => {
      // Arrange & Act
      render(
        <Dropdown
          options={options}
          placeholder="Select"
          error="This field is required"
        />
      )

      // Assert
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('should render disabled state', () => {
      // Arrange & Act
      render(
        <Dropdown
          options={options}
          placeholder="Select"
          disabled
        />
      )

      // Assert
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      // Check for disabled styling
      expect(button.className).toContain('disabled:')
    })

    it('should open menu when clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<Dropdown options={options} placeholder="Select" />)

      // Act
      await user.click(screen.getByRole('button'))

      // Assert
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('should close menu when clicking outside', async () => {
      // Arrange
      const user = userEvent.setup()
      render(
        <div>
          <Dropdown options={options} placeholder="Select" />
          <div data-testid="outside">Outside</div>
        </div>
      )

      // Open menu
      await user.click(screen.getByRole('button'))
      expect(screen.getByRole('listbox')).toBeInTheDocument()

      // Click outside
      await user.click(screen.getByTestId('outside'))

      // Assert
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  describe('dropdown menu interactions', () => {
    it('should select option when clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(
        <Dropdown
          options={options}
          placeholder="Select"
          onChange={onChange}
        />
      )

      // Open menu
      await user.click(screen.getByRole('button'))
      const listbox = screen.getByRole('listbox')

      // Find and click Option 2
      const option2 = within(listbox).getByText('Option 2')
      await user.click(option2)

      // Assert
      expect(onChange).toHaveBeenCalledWith('2')
      expect(screen.getByRole('button')).toHaveTextContent('Option 2')
    })

    it('should not select disabled option', async () => {
      // Arrange
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(
        <Dropdown
          options={options}
          placeholder="Select"
          onChange={onChange}
        />
      )

      // Open menu
      await user.click(screen.getByRole('button'))
      const listbox = screen.getByRole('listbox')

      // Find and try to click disabled option
      const option3 = within(listbox).getByText('Option 3')
      await user.click(option3)

      // Assert
      expect(onChange).not.toHaveBeenCalled()
    })

    it('should show checkmark for selected option when showCheck is true', async () => {
      // Arrange
      const user = userEvent.setup()
      render(
        <Dropdown
          options={options}
          placeholder="Select"
          value="2"
          showCheck
        />
      )

      // Open menu
      await user.click(screen.getByRole('button'))
      const listbox = screen.getByRole('listbox')

      // Find the selected option container
      const selectedOptionContainer = within(listbox)
        .getAllByRole('option')
        .find(el => el.getAttribute('aria-selected') === 'true')

      // Assert
      expect(selectedOptionContainer).toBeDefined()
      // Look for the Check icon by its default class name
      const checkIcon = selectedOptionContainer?.querySelector('svg')
      expect(checkIcon).toBeInTheDocument()
    })
  })

  describe('keyboard navigation', () => {
    it('should open menu with Enter key', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<Dropdown options={options} placeholder="Select" />)

      // Act
      screen.getByRole('button').focus()
      await user.keyboard('{Enter}')

      // Assert
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('should open menu with Space key', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<Dropdown options={options} placeholder="Select" />)

      // Act
      screen.getByRole('button').focus()
      await user.keyboard(' ')

      // Assert
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('should navigate options with arrow keys', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<Dropdown options={options} placeholder="Select" />)

      // Open menu with Enter
      screen.getByRole('button').focus()
      await user.keyboard('{Enter}')

      // Navigate with arrow down
      await user.keyboard('{ArrowDown}')

      // Assert - menu should still be open
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('should close menu with Escape key', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<Dropdown options={options} placeholder="Select" />)

      // Open menu
      screen.getByRole('button').focus()
      await user.keyboard('{Enter}')
      expect(screen.getByRole('listbox')).toBeInTheDocument()

      // Close with Escape
      await user.keyboard('{Escape}')

      // Assert
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('should select focused option with Enter', async () => {
      // Arrange
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(
        <Dropdown
          options={options}
          placeholder="Select"
          onChange={onChange}
        />
      )

      // Open menu and navigate to first option, then select it
      screen.getByRole('button').focus()
      await user.keyboard('{Enter}') // Opens menu, sets focusedIndex to 0
      await user.keyboard('{Enter}') // Selects the first focused option (Option 1)

      // Assert
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('1')
      })
    })
  })

  describe('variants and sizes', () => {
    it('should apply default variant classes', () => {
      // Arrange & Act
      render(
        <Dropdown
          options={options}
          placeholder="Select"
          variant="default"
        />
      )

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-surface-2')
      expect(button).toHaveClass('border-border')
    })

    it('should apply primary variant classes', () => {
      // Arrange & Act
      render(
        <Dropdown
          options={options}
          placeholder="Select"
          variant="primary"
        />
      )

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary')
      expect(button).toHaveClass('text-on-primary')
    })

    it('should apply sm size classes', () => {
      // Arrange & Act
      render(
        <Dropdown
          options={options}
          placeholder="Select"
          size="sm"
        />
      )

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-3')
      expect(button).toHaveClass('py-1.5')
    })

    it('should apply lg size classes', () => {
      // Arrange & Act
      render(
        <Dropdown
          options={options}
          placeholder="Select"
          size="lg"
        />
      )

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-5')
      expect(button).toHaveClass('py-3')
    })
  })

  describe('controlled vs uncontrolled', () => {
    it('should use defaultValue for uncontrolled component', async () => {
      // Arrange
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(
        <Dropdown
          options={options}
          placeholder="Select"
          defaultValue="2"
          onChange={onChange}
        />
      )

      // Assert initial value
      expect(screen.getByRole('button')).toHaveTextContent('Option 2')

      // Open menu and select different option
      await user.click(screen.getByRole('button'))
      const listbox = screen.getByRole('listbox')
      const option1 = within(listbox).getByText('Option 1')
      await user.click(option1)

      // Assert change
      expect(onChange).toHaveBeenCalledWith('1')
    })

    it('should use value for controlled component', async () => {
      // Arrange
      const user = userEvent.setup()
      const onChange = vi.fn()
      const { rerender } = render(
        <Dropdown
          options={options}
          placeholder="Select"
          value="2"
          onChange={onChange}
        />
      )

      // Assert initial value
      expect(screen.getByRole('button')).toHaveTextContent('Option 2')

      // Try to select different option
      await user.click(screen.getByRole('button'))
      const listbox = screen.getByRole('listbox')
      const option1 = within(listbox).getByText('Option 1')
      await user.click(option1)

      // Assert onChange called but value stays the same
      expect(onChange).toHaveBeenCalledWith('1')
      expect(screen.getByRole('button')).toHaveTextContent('Option 2')

      // Rerender with new value
      rerender(
        <Dropdown
          options={options}
          placeholder="Select"
          value="1"
          onChange={onChange}
        />
      )

      // Assert updated value
      expect(screen.getByRole('button')).toHaveTextContent('Option 1')
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA attributes when closed', () => {
      // Arrange & Act
      render(<Dropdown options={options} placeholder="Select" />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-haspopup', 'listbox')
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })

    it('should have proper ARIA attributes when open', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<Dropdown options={options} placeholder="Select" />)

      // Act
      await user.click(screen.getByRole('button'))

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('should associate label with button using id', () => {
      // Arrange & Act
      render(
        <Dropdown
          options={options}
          placeholder="Select"
          label="Category"
          id="category-dropdown"
        />
      )

      // Assert
      const label = screen.getByText('Category')
      const button = screen.getByRole('button')
      expect(label).toHaveAttribute('for', 'category-dropdown')
      expect(button).toHaveAttribute('id', 'category-dropdown')
    })
  })
})