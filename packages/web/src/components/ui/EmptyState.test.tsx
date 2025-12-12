/**
 * @fileoverview Unit tests for EmptyState component
 * @module components/ui/EmptyState.test
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Search, Plus } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'

describe('EmptyState component', () => {
  describe('rendering', () => {
    it('should render title', () => {
      // Arrange & Act
      render(<EmptyState title="No results found" />)

      // Assert
      expect(screen.getByText('No results found')).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
        'No results found'
      )
    })

    it('should render description when provided', () => {
      // Arrange & Act
      render(
        <EmptyState
          title="No data"
          description="Try adjusting your filters or search terms"
        />
      )

      // Assert
      expect(
        screen.getByText(
          'Try adjusting your filters or search terms'
        )
      ).toBeInTheDocument()
      expect(screen.getByTestId('empty-state-description')).toBeInTheDocument()
    })

    it('should not render description element when not provided', () => {
      // Arrange & Act
      render(<EmptyState title="Title only" />)

      // Assert
      expect(screen.queryByTestId('empty-state-description')).not.toBeInTheDocument()
    })

    it('should render icon when provided', () => {
      // Arrange & Act
      render(<EmptyState icon={Search} title="No results" />)

      // Assert
      const iconWrapper = screen.getByTestId('empty-state-icon-wrapper')
      const svg = iconWrapper.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('h-8', 'w-8')
    })

    it('should not render icon when not provided', () => {
      // Arrange & Act
      render(<EmptyState title="No icon" />)

      // Assert
      expect(screen.queryByTestId('empty-state-icon-wrapper')).not.toBeInTheDocument()
    })
  })

  describe('action button', () => {
    it('should render action button when action provided', () => {
      // Arrange
      const action = {
        label: 'Create New',
        onClick: vi.fn(),
        icon: <Plus className="h-4 w-4" />,
      }

      // Act
      render(<EmptyState title="No items" action={action} />)

      // Assert
      expect(screen.getByRole('button', { name: /create new/i })).toBeInTheDocument()
    })

    it('should call onClick when action button clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      const onClick = vi.fn()
      const action = {
        label: 'Add Item',
        onClick,
      }

      // Act
      render(<EmptyState title="Empty" action={action} />)
      await user.click(screen.getByRole('button', { name: /add item/i }))

      // Assert
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should render action button with icon', () => {
      // Arrange
      const action = {
        label: 'Add',
        onClick: vi.fn(),
        icon: <Plus className="h-4 w-4" />,
      }

      // Act
      render(<EmptyState title="Empty" action={action} />)

      // Assert
      const button = screen.getByRole('button', { name: /add/i })
      const icon = button.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('h-4', 'w-4')
    })
  })

  describe('size variants', () => {
    it('should apply md size by default', () => {
      // Arrange & Act
      render(<EmptyState icon={Search} title="Default size" />)

      // Assert
      const wrapper = screen.getByTestId('empty-state-wrapper')
      expect(wrapper).toHaveClass('p-12')

      const iconWrapper = screen.getByTestId('empty-state-icon-wrapper')
      expect(iconWrapper).toHaveClass('h-16', 'w-16')

      expect(screen.getByRole('heading')).toHaveClass('text-lg')
    })

    it('should apply sm size classes', () => {
      // Arrange & Act
      render(<EmptyState size="sm" title="Small" icon={Search} />)

      // Assert
      const wrapper = screen.getByTestId('empty-state-wrapper')
      expect(wrapper).toHaveClass('p-6')

      const iconWrapper = screen.getByTestId('empty-state-icon-wrapper')
      expect(iconWrapper).toHaveClass('h-10', 'w-10')

      expect(screen.getByRole('heading')).toHaveClass('text-sm')
    })

    it('should use appropriate button size for sm variant', () => {
      // Arrange
      const action = {
        label: 'Action',
        onClick: vi.fn(),
      }

      // Act
      render(<EmptyState size="sm" title="Small" action={action} />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm')
    })

    it('should use appropriate button size for md variant', () => {
      // Arrange
      const action = {
        label: 'Action',
        onClick: vi.fn(),
      }

      // Act
      render(<EmptyState size="md" title="Medium" action={action} />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-4', 'py-2', 'text-base')
    })
  })

  describe('styling', () => {
    it('should apply custom className', () => {
      // Arrange & Act
      render(<EmptyState title="Test" className="my-custom-class" />)

      // Assert
      const wrapper = screen.getByTestId('empty-state-wrapper')
      expect(wrapper).toHaveClass('my-custom-class')
    })

    it('should have correct background color', () => {
      // Arrange & Act
      render(<EmptyState title="Test" />)

      // Assert
      const wrapper = screen.getByTestId('empty-state-wrapper')
      expect(wrapper).toHaveClass('bg-surface-2')
    })

    it('should have correct text colors', () => {
      // Arrange & Act
      render(<EmptyState title="Heading" description="Description" />)

      // Assert
      expect(screen.getByText('Heading')).toHaveClass('text-headline')
      expect(screen.getByText('Description')).toHaveClass('text-muted')
    })
  })

  describe('accessibility', () => {
    it('should have proper heading level', () => {
      // Arrange & Act
      render(<EmptyState title="Accessible Title" />)

      // Assert
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
        'Accessible Title'
      )
    })

    it('should be centered', () => {
      // Arrange & Act
      render(<EmptyState title="Centered" />)

      // Assert
      const wrapper = screen.getByTestId('empty-state-wrapper')
      expect(wrapper).toHaveClass('text-center')
    })
  })
})