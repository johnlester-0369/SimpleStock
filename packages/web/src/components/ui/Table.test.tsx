/**
 * @fileoverview Unit tests for Table component
 * @module components/ui/Table.test
 */

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Table from '@/components/ui/Table'

describe('Table component', () => {
  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35 },
  ]

  describe('Table.Root', () => {
    it('should render table with default variant', () => {
      // Arrange & Act
      render(
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
              <Table.Head>Email</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {mockData.map((item) => (
              <Table.Row key={item.id}>
                <Table.Cell>{item.name}</Table.Cell>
                <Table.Cell>{item.email}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )

      // Assert
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    })

    it('should apply bordered variant classes', () => {
      // Arrange & Act
      render(
        <Table.Root variant="bordered" data-testid="table">
          <Table.Header>
            <Table.Row>
              <Table.Head>Header</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Cell</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      )

      // Assert
      const table = screen.getByTestId('table')
      expect(table).toHaveClass('border')
    })

    it('should apply striped variant', () => {
      // Arrange & Act
      render(
        <Table.Root variant="striped">
          <Table.Body>
            <Table.Row>
              <Table.Cell>Row 1</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Row 2</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      )

      // Assert - both rows render
      const rows = screen.getAllByRole('row')
      expect(rows).toHaveLength(2)
    })

    it('should apply size classes', () => {
      // Arrange & Act
      render(
        <Table.Root size="sm" data-testid="table">
          <Table.Body>
            <Table.Row>
              <Table.Cell>Small</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      )

      // Assert
      const cell = screen.getByText('Small')
      expect(cell).toHaveClass('px-3', 'py-2', 'text-sm')
    })

    it('should be hoverable by default', () => {
      // Arrange & Act
      render(
        <Table.Root>
          <Table.Body>
            <Table.Row data-testid="row">
              <Table.Cell>Content</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      )

      // Assert
      const row = screen.getByTestId('row')
      expect(row).toHaveClass('hover:bg-surface-hover-2')
    })

    it('should disable hover when hoverable={false}', () => {
      // Arrange & Act
      render(
        <Table.Root hoverable={false}>
          <Table.Body>
            <Table.Row data-testid="row">
              <Table.Cell>Content</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      )

      // Assert
      const row = screen.getByTestId('row')
      expect(row).not.toHaveClass('hover:bg-surface-hover-2')
    })
  })

  describe('Table.Head', () => {
    it('should render sortable header with cursor pointer', () => {
      // Arrange & Act
      render(
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head sortable>Sortable Column</Table.Head>
              <Table.Head>Regular Column</Table.Head>
            </Table.Row>
          </Table.Header>
        </Table.Root>
      )

      // Assert
      const sortableHeader = screen.getByText('Sortable Column')
      const thElement = sortableHeader.closest('th')
      expect(thElement).toHaveClass('cursor-pointer')
    })

    it('should show ascending sort indicator', () => {
      // Arrange & Act
      render(
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head sortable sortDirection="asc">
                Ascending
              </Table.Head>
            </Table.Row>
          </Table.Header>
        </Table.Root>
      )

      // Assert
      const text = screen.getByText('Ascending')
      const thElement = text.closest('th')
      expect(thElement).toHaveAttribute('aria-sort', 'ascending')
    })

    it('should show descending sort indicator', () => {
      // Arrange & Act
      render(
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head sortable sortDirection="desc">
                Descending
              </Table.Head>
            </Table.Row>
          </Table.Header>
        </Table.Root>
      )

      // Assert
      const text = screen.getByText('Descending')
      const thElement = text.closest('th')
      expect(thElement).toHaveAttribute('aria-sort', 'descending')
    })

    it('should call onClick when sortable header is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      const handleSort = vi.fn()
      
      render(
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head sortable onClick={handleSort}>
                Clickable
              </Table.Head>
            </Table.Row>
          </Table.Header>
        </Table.Root>
      )

      // Act
      await user.click(screen.getByText('Clickable'))

      // Assert
      expect(handleSort).toHaveBeenCalledTimes(1)
    })

    it('should support different alignments', () => {
      // Arrange & Act
      render(
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head align="left">Left</Table.Head>
              <Table.Head align="center">Center</Table.Head>
              <Table.Head align="right">Right</Table.Head>
            </Table.Row>
          </Table.Header>
        </Table.Root>
      )

      // Assert
      const leftText = screen.getByText('Left')
      const centerText = screen.getByText('Center')
      const rightText = screen.getByText('Right')
      
      expect(leftText.closest('th')).toHaveClass('text-left')
      expect(centerText.closest('th')).toHaveClass('text-center')
      expect(rightText.closest('th')).toHaveClass('text-right')
    })
  })

  describe('Table.Row', () => {
    it('should apply selected styling when selected={true}', () => {
      // Arrange & Act
      render(
        <Table.Root>
          <Table.Body>
            <Table.Row selected data-testid="selected-row">
              <Table.Cell>Selected</Table.Cell>
            </Table.Row>
            <Table.Row data-testid="normal-row">
              <Table.Cell>Normal</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      )

      // Assert
      const selectedRow = screen.getByTestId('selected-row')
      const normalRow = screen.getByTestId('normal-row')
      
      expect(selectedRow).toHaveClass('bg-primary/10')
      expect(normalRow).not.toHaveClass('bg-primary/10')
    })
  })

  describe('Table.Cell', () => {
    it('should truncate text when truncate={true}', () => {
      // Arrange & Act
      render(
        <Table.Root>
          <Table.Body>
            <Table.Row>
              <Table.Cell truncate>Very long text that should be truncated</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      )

      // Assert
      const cell = screen.getByText('Very long text that should be truncated')
      expect(cell).toHaveClass('truncate')
    })

    it('should support different alignments', () => {
      // Arrange & Act
      render(
        <Table.Root>
          <Table.Body>
            <Table.Row>
              <Table.Cell align="left">Left</Table.Cell>
              <Table.Cell align="center">Center</Table.Cell>
              <Table.Cell align="right">Right</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      )

      // Assert
      expect(screen.getByText('Left')).toHaveClass('text-left')
      expect(screen.getByText('Center')).toHaveClass('text-center')
      expect(screen.getByText('Right')).toHaveClass('text-right')
    })
  })

  describe('Table.Empty', () => {
    it('should render empty state with message', () => {
      // Arrange & Act
      render(
        <Table.Root>
          <Table.Body>
            <Table.Empty colSpan={3} message="No data found" />
          </Table.Body>
        </Table.Root>
      )

      // Assert
      expect(screen.getByText('No data found')).toBeInTheDocument()
    })

    it('should render empty state with custom icon and description', () => {
      // Arrange & Act
      const customIcon = <span data-testid="custom-icon">📊</span>
      
      render(
        <Table.Root>
          <Table.Body>
            <Table.Empty 
              colSpan={3}
              icon={customIcon}
              message="No results"
              description="Try adjusting your filters"
            />
          </Table.Body>
        </Table.Root>
      )

      // Assert
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
      expect(screen.getByText('No results')).toBeInTheDocument()
      expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument()
    })
  })

  describe('Table.Loading', () => {
    it('should render skeleton rows', () => {
      // Arrange & Act
      render(
        <Table.Root>
          <Table.Body>
            <Table.Loading colSpan={3} rows={4} />
          </Table.Body>
        </Table.Root>
      )

      // Assert
      const rows = screen.getAllByRole('row')
      expect(rows).toHaveLength(4)
      
      rows.forEach(row => {
        const cells = within(row).getAllByRole('cell')
        expect(cells).toHaveLength(3)
      })
    })
  })

  describe('Table.ScrollArea', () => {
    it('should render scroll area with maxHeight', () => {
      // Arrange & Act
      render(
        <Table.ScrollArea maxHeight="400px" data-testid="scroll-area">
          <Table.Root>
            <Table.Body>
              <Table.Row>
                <Table.Cell>Content</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      )

      // Assert
      const scrollArea = screen.getByTestId('scroll-area')
      expect(scrollArea).toHaveStyle({ maxHeight: '400px' })
      expect(scrollArea).toHaveClass('scrollbar')
    })

    it('should support horizontal scrolling', () => {
      // Arrange & Act
      render(
        <Table.ScrollArea 
          maxWidth="800px" 
          overflowX="scroll"
          data-testid="scroll-area"
        >
          <Table.Root>
            <Table.Body>
              <Table.Row>
                <Table.Cell>Wide content</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      )

      // Assert
      const scrollArea = screen.getByTestId('scroll-area')
      expect(scrollArea).toHaveStyle({ 
        maxWidth: '800px',
        overflowX: 'scroll'
      })
    })
  })

  describe('Table.Pagination', () => {
    it('should render pagination with table', () => {
      // Arrange & Act
      render(
        <div>
          <Table.Root>
            <Table.Body>
              <Table.Row>
                <Table.Cell>Data</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
          <Table.Pagination
            currentPage={1}
            totalItems={100}
            itemsPerPage={10}
            onPageChange={vi.fn()}
            showInfo
          />
        </div>
      )

      // Assert
      expect(screen.getByText(/showing 1 to 10 of 100/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Go to page 1' })).toBeInTheDocument()
    })

    it('should render pagination with correct size', () => {
      // Arrange & Act
      render(
        <div>
          <Table.Root size="sm">
            <Table.Body>
              <Table.Row>
                <Table.Cell>Data</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
          <Table.Pagination
            currentPage={1}
            totalItems={50}
            itemsPerPage={10}
            onPageChange={vi.fn()}
          />
        </div>
      )

      // Assert
      const prevButton = screen.getByRole('button', { name: /previous/i })
      const nextButton = screen.getByRole('button', { name: /next/i })
      expect(prevButton).toBeInTheDocument()
      expect(nextButton).toBeInTheDocument()
    })
  })

  describe('Table interactions', () => {
    it('should apply sticky header styles on table element', () => {
      // Arrange & Act
      render(
        <Table.ScrollArea maxHeight="200px">
          <Table.Root stickyHeader data-testid="table">
            <Table.Header data-testid="header">
              <Table.Row>
                <Table.Head>Sticky Header</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {Array.from({ length: 20 }).map((_, i) => (
                <Table.Row key={i}>
                  <Table.Cell>Row {i + 1}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      )

      // Assert
      const table = screen.getByTestId('table')
      expect(table).toHaveClass('[&_thead]:sticky')
    })

    it('should handle row click events', async () => {
      // Arrange
      const user = userEvent.setup()
      const handleRowClick = vi.fn()
      
      render(
        <Table.Root>
          <Table.Body>
            <Table.Row onClick={handleRowClick} data-testid="clickable-row">
              <Table.Cell>Click me</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      )

      // Act
      await user.click(screen.getByTestId('clickable-row'))

      // Assert
      expect(handleRowClick).toHaveBeenCalledTimes(1)
    })
  })
})