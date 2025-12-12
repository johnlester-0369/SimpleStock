/**
 * @fileoverview Unit tests for Pagination component
 * @module components/ui/Pagination.test
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Pagination from '@/components/ui/Pagination'

describe('Pagination component', () => {
  const defaultProps = {
    currentPage: 1,
    totalItems: 100,
    itemsPerPage: 10,
    onPageChange: vi.fn(),
  }

  describe('rendering', () => {
    it('should render page numbers', () => {
      // Arrange & Act
      render(<Pagination {...defaultProps} />)

      // Assert
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument() // Last page
    })

    it('should render Previous and Next buttons when showPrevNext is true', () => {
      // Arrange & Act
      render(<Pagination {...defaultProps} showPrevNext />)

      // Assert
      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('should not render Previous/Next buttons when showPrevNext is false', () => {
      // Arrange & Act
      render(<Pagination {...defaultProps} showPrevNext={false} />)

      // Assert
      expect(screen.queryByText('Previous')).not.toBeInTheDocument()
      expect(screen.queryByText('Next')).not.toBeInTheDocument()
    })

    it('should render info text when showInfo is true', () => {
      // Arrange & Act
      render(<Pagination {...defaultProps} showInfo />)

      // Assert
      expect(
        screen.getByText('Showing 1 to 10 of 100 items')
      ).toBeInTheDocument()
    })

    it('should not render info text when showInfo is false', () => {
      // Arrange & Act
      render(<Pagination {...defaultProps} showInfo={false} />)

      // Assert
      expect(
        screen.queryByText('Showing 1 to 10 of 100 items')
      ).not.toBeInTheDocument()
    })

    it('should render custom info template', () => {
      // Arrange & Act
      render(
        <Pagination
          {...defaultProps}
          infoTemplate="Page {from}-{to} of {total}"
        />
      )

      // Assert
      expect(screen.getByText('Page 1-10 of 100')).toBeInTheDocument()
    })

    it('should render custom item label', () => {
      // Arrange & Act
      render(<Pagination {...defaultProps} itemLabel="products" />)

      // Assert
      expect(
        screen.getByText('Showing 1 to 10 of 100 products')
      ).toBeInTheDocument()
    })
  })

  describe('current page highlighting', () => {
    it('should highlight current page', () => {
      // Arrange & Act
      render(<Pagination {...defaultProps} currentPage={3} />)

      // Assert
      const currentPageButton = screen.getByText('3')
      expect(currentPageButton).toHaveClass('bg-primary')
      expect(currentPageButton).toHaveClass('text-on-primary')
    })

    it('should not highlight other pages', () => {
      // Arrange & Act
      render(<Pagination {...defaultProps} currentPage={3} />)

      // Assert
      const otherPageButton = screen.getByText('1')
      expect(otherPageButton).not.toHaveClass('bg-primary')
    })
  })

  describe('page number generation', () => {
    it('should show ellipsis for many pages', () => {
      // Arrange & Act
      render(
        <Pagination
          currentPage={5}
          totalItems={100}
          itemsPerPage={5}
          onPageChange={vi.fn()}
          maxVisiblePages={5}
        />
      )

      // Assert
      // Should show: 1 ... 4 5 6 ... 20
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getAllByRole('button', { name: /go to page/i })).toHaveLength(
        5 // 1, 4, 5, 6, 20
      )
    })

    it('should show all pages when within maxVisiblePages limit', () => {
      // Arrange & Act
      render(
        <Pagination
          currentPage={2}
          totalItems={30}
          itemsPerPage={5}
          onPageChange={vi.fn()}
          maxVisiblePages={10}
        />
      )

      // Assert - Should show 1, 2, 3, 4, 5, 6
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('6')).toBeInTheDocument()
      expect(screen.queryByText('…')).not.toBeInTheDocument()
    })

    it('should handle current page at beginning', () => {
      // Arrange & Act
      render(
        <Pagination
          currentPage={1}
          totalItems={100}
          itemsPerPage={5}
          onPageChange={vi.fn()}
          maxVisiblePages={5}
        />
      )

      // Assert - Should show: 1 2 3 ... 20
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('20')).toBeInTheDocument()
    })

    it('should handle current page at end', () => {
      // Arrange & Act
      render(
        <Pagination
          currentPage={20}
          totalItems={100}
          itemsPerPage={5}
          onPageChange={vi.fn()}
          maxVisiblePages={5}
        />
      )

      // Assert - Should show: 1 ... 18 19 20
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('18')).toBeInTheDocument()
      expect(screen.getByText('19')).toBeInTheDocument()
      expect(screen.getByText('20')).toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    it('should call onPageChange when page number is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      const onPageChange = vi.fn()
      render(
        <Pagination
          currentPage={1}
          totalItems={100}
          itemsPerPage={10}
          onPageChange={onPageChange}
        />
      )

      // Act
      await user.click(screen.getByText('3'))

      // Assert
      expect(onPageChange).toHaveBeenCalledWith(3)
    })

    it('should call onPageChange when Previous is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      const onPageChange = vi.fn()
      render(
        <Pagination
          currentPage={3}
          totalItems={100}
          itemsPerPage={10}
          onPageChange={onPageChange}
          showPrevNext
        />
      )

      // Act
      await user.click(screen.getByText('Previous'))

      // Assert
      expect(onPageChange).toHaveBeenCalledWith(2)
    })

    it('should call onPageChange when Next is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      const onPageChange = vi.fn()
      render(
        <Pagination
          currentPage={3}
          totalItems={100}
          itemsPerPage={10}
          onPageChange={onPageChange}
          showPrevNext
        />
      )

      // Act
      await user.click(screen.getByText('Next'))

      // Assert
      expect(onPageChange).toHaveBeenCalledWith(4)
    })

    it('should disable Previous button on first page', () => {
      // Arrange & Act
      render(
        <Pagination
          currentPage={1}
          totalItems={100}
          itemsPerPage={10}
          onPageChange={vi.fn()}
          showPrevNext
        />
      )

      // Assert
      expect(screen.getByText('Previous').closest('button')).toBeDisabled()
    })

    it('should disable Next button on last page', () => {
      // Arrange & Act
      render(
        <Pagination
          currentPage={10}
          totalItems={100}
          itemsPerPage={10}
          onPageChange={vi.fn()}
          showPrevNext
        />
      )

      // Assert
      expect(screen.getByText('Next').closest('button')).toBeDisabled()
    })

    it('should not call onPageChange when clicking current page', async () => {
      // Arrange
      const user = userEvent.setup()
      const onPageChange = vi.fn()
      render(
        <Pagination
          currentPage={3}
          totalItems={100}
          itemsPerPage={10}
          onPageChange={onPageChange}
        />
      )

      // Act
      await user.click(screen.getByText('3'))

      // Assert
      expect(onPageChange).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should return null when totalItems is 0', () => {
      // Arrange & Act
      const { container } = render(
        <Pagination
          currentPage={1}
          totalItems={0}
          itemsPerPage={10}
          onPageChange={vi.fn()}
        />
      )

      // Assert
      expect(container.firstChild).toBeNull()
    })

    it('should return null when only one page exists and hideOnSinglePage is true', () => {
      // Arrange & Act
      const { container } = render(
        <Pagination
          currentPage={1}
          totalItems={5}
          itemsPerPage={10}
          onPageChange={vi.fn()}
          hideOnSinglePage
        />
      )

      // Assert
      expect(container.firstChild).toBeNull()
    })

    it('should render when only one page exists and hideOnSinglePage is false', () => {
      // Arrange & Act
      render(
        <Pagination
          currentPage={1}
          totalItems={5}
          itemsPerPage={10}
          onPageChange={vi.fn()}
          hideOnSinglePage={false}
          showPrevNext={false} // Don't show Previous/Next for single page
        />
      )

      // Assert
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.queryByText('Previous')).not.toBeInTheDocument()
      expect(screen.queryByText('Next')).not.toBeInTheDocument()
    })

    it('should handle very large page numbers', () => {
      // Arrange & Act
      render(
        <Pagination
          currentPage={500}
          totalItems={10000}
          itemsPerPage={10}
          onPageChange={vi.fn()}
          maxVisiblePages={5}
        />
      )

      // Assert
      expect(screen.getByText('500')).toBeInTheDocument()
    })
  })

  describe('size variants', () => {
    it('should apply sm size classes', () => {
      // Arrange & Act
      render(<Pagination {...defaultProps} size="sm" />)

      // Assert
      const pageButton = screen.getByText('1')
      expect(pageButton).toHaveClass('h-7', 'w-7', 'text-xs')
    })

    it('should apply md size classes by default', () => {
      // Arrange & Act
      render(<Pagination {...defaultProps} />)

      // Assert
      const pageButton = screen.getByText('1')
      expect(pageButton).toHaveClass('h-8', 'w-8', 'text-sm')
    })

    it('should apply lg size classes', () => {
      // Arrange & Act
      render(<Pagination {...defaultProps} size="lg" />)

      // Assert
      const pageButton = screen.getByText('1')
      expect(pageButton).toHaveClass('h-10', 'w-10', 'text-base')
    })

    it('should apply size classes to Previous/Next buttons', () => {
      // Arrange & Act
      render(<Pagination {...defaultProps} size="lg" showPrevNext />)

      // Assert
      const previousButton = screen.getByText('Previous')
      expect(previousButton.closest('button')).toHaveClass('text-lg')
    })
  })

  describe('accessibility', () => {
    it('should have navigation role', () => {
      // Arrange & Act
      render(<Pagination {...defaultProps} />)

      // Assert
      expect(screen.getByRole('navigation')).toHaveAttribute(
        'aria-label',
        'Pagination'
      )
    })

    it('should have aria-current on current page', () => {
      // Arrange & Act
      render(<Pagination {...defaultProps} currentPage={3} />)

      // Assert
      const currentPageButton = screen.getByText('3')
      expect(currentPageButton).toHaveAttribute('aria-current', 'page')
    })

    it('should have aria-label on page buttons', () => {
      // Arrange & Act
      render(<Pagination {...defaultProps} />)

      // Assert
      const pageButton = screen.getByText('2')
      expect(pageButton).toHaveAttribute('aria-label', 'Go to page 2')
    })

    it('should have aria-label on Previous/Next buttons', () => {
      // Arrange & Act
      render(<Pagination {...defaultProps} showPrevNext />)

      // Assert
      expect(
        screen.getByRole('button', { name: 'Go to previous page' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Go to next page' })
      ).toBeInTheDocument()
    })
  })
})