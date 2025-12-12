/**
 * @fileoverview Unit tests for Card component
 * @module components/ui/Card.test
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Card from '@/components/ui/Card'

describe('Card component', () => {
  describe('Card.Root', () => {
    it('should render card with default variant', () => {
      // Arrange & Act
      render(
        <Card.Root data-testid="card">
          <Card.Body>Card content</Card.Body>
        </Card.Root>
      )

      // Assert
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('bg-surface-2', 'rounded-lg')
      expect(card).not.toHaveClass('border', 'shadow-soft')
    })

    it('should render elevated variant', () => {
      // Arrange & Act
      render(
        <Card.Root variant="elevated" data-testid="card">
          <Card.Body>Elevated card</Card.Body>
        </Card.Root>
      )

      // Assert
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('shadow-soft', 'border', 'border-border')
    })

    it('should render bordered variant', () => {
      // Arrange & Act
      render(
        <Card.Root variant="bordered" data-testid="card">
          <Card.Body>Bordered card</Card.Body>
        </Card.Root>
      )

      // Assert
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('border-2', 'border-border')
    })

    it('should render ghost variant', () => {
      // Arrange & Act
      render(
        <Card.Root variant="ghost" data-testid="card">
          <Card.Body>Ghost card</Card.Body>
        </Card.Root>
      )

      // Assert
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('bg-transparent', 'border', 'border-transparent')
    })

    it('should apply padding classes', () => {
      // Arrange & Act
      const { rerender } = render(
        <Card.Root padding="sm" data-testid="card">
          <Card.Body>Small padding</Card.Body>
        </Card.Root>
      )

      // Assert sm
      let card = screen.getByTestId('card')
      expect(card).toHaveClass('p-4')

      // Act - rerender with lg
      rerender(
        <Card.Root padding="lg" data-testid="card">
          <Card.Body>Large padding</Card.Body>
        </Card.Root>
      )

      // Assert lg
      card = screen.getByTestId('card')
      expect(card).toHaveClass('p-8')
    })

    it('should have no padding when padding="none"', () => {
      // Arrange & Act
      render(
        <Card.Root padding="none" data-testid="card">
          <Card.Body>No padding</Card.Body>
        </Card.Root>
      )

      // Assert
      const card = screen.getByTestId('card')
      expect(card).not.toHaveClass('p-4', 'p-6', 'p-8')
    })

    it('should be interactive when interactive={true}', () => {
      // Arrange & Act
      render(
        <Card.Root interactive data-testid="card">
          <Card.Body>Clickable card</Card.Body>
        </Card.Root>
      )

      // Assert
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('cursor-pointer')
      expect(card).toHaveClass('hover:scale-[1.02]')
    })

    it('should not be interactive by default', () => {
      // Arrange & Act
      render(
        <Card.Root data-testid="card">
          <Card.Body>Not clickable</Card.Body>
        </Card.Root>
      )

      // Assert
      const card = screen.getByTestId('card')
      expect(card).not.toHaveClass('cursor-pointer')
    })

    it('should handle click when interactive', async () => {
      // Arrange
      const user = userEvent.setup()
      const handleClick = vi.fn()

      // Act
      render(
        <Card.Root interactive onClick={handleClick} data-testid="card">
          <Card.Body>Click me</Card.Body>
        </Card.Root>
      )
      await user.click(screen.getByTestId('card'))

      // Assert
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Card.Header', () => {
    it('should render header with divider', () => {
      // Arrange & Act
      render(
        <Card.Root>
          <Card.Header withDivider data-testid="header">
            <Card.Title>Title</Card.Title>
          </Card.Header>
          <Card.Body>Body</Card.Body>
        </Card.Root>
      )

      // Assert
      const header = screen.getByTestId('header')
      expect(header).toHaveClass('pb-4', 'mb-4', 'border-b', 'border-divider')
    })

    it('should render header without divider by default', () => {
      // Arrange & Act
      render(
        <Card.Root>
          <Card.Header data-testid="header">
            <Card.Title>Title</Card.Title>
          </Card.Header>
        </Card.Root>
      )

      // Assert
      const header = screen.getByTestId('header')
      expect(header).toHaveClass('mb-4')
      expect(header).not.toHaveClass('border-b', 'border-divider', 'pb-4')
    })
  })

  describe('Card.Title', () => {
    it('should render as h3 by default', () => {
      // Arrange & Act
      render(
        <Card.Root>
          <Card.Title data-testid="title">Card Title</Card.Title>
        </Card.Root>
      )

      // Assert
      const title = screen.getByTestId('title')
      expect(title.tagName).toBe('H3')
      expect(title).toHaveClass('text-xl', 'font-semibold', 'text-headline')
    })

    it('should render as different heading level', () => {
      // Arrange & Act
      render(
        <Card.Root>
          <Card.Title as="h1" data-testid="title">
            Main Title
          </Card.Title>
        </Card.Root>
      )

      // Assert
      const title = screen.getByTestId('title')
      expect(title.tagName).toBe('H1')
    })
  })

  describe('Card.Description', () => {
    it('should render description text', () => {
      // Arrange & Act
      render(
        <Card.Root>
          <Card.Description data-testid="description">
            This is a description
          </Card.Description>
        </Card.Root>
      )

      // Assert
      const description = screen.getByTestId('description')
      expect(description).toHaveClass('text-sm', 'text-muted')
      expect(description.tagName).toBe('P')
    })
  })

  describe('Card.Body', () => {
    it('should render body content', () => {
      // Arrange & Act
      render(
        <Card.Root>
          <Card.Body data-testid="body">
            <p>Body content</p>
            <button>Action</button>
          </Card.Body>
        </Card.Root>
      )

      // Assert
      const body = screen.getByTestId('body')
      expect(body).toHaveClass('text-text', 'leading-relaxed')
    })
  })

  describe('Card.Footer', () => {
    it('should render footer with divider', () => {
      // Arrange & Act
      render(
        <Card.Root>
          <Card.Body>Content</Card.Body>
          <Card.Footer withDivider data-testid="footer">
            <button>Action</button>
          </Card.Footer>
        </Card.Root>
      )

      // Assert
      const footer = screen.getByTestId('footer')
      expect(footer).toHaveClass('pt-4', 'mt-4', 'border-t', 'border-divider')
    })

    it('should render footer without divider by default', () => {
      // Arrange & Act
      render(
        <Card.Root>
          <Card.Footer data-testid="footer">
            <button>Action</button>
          </Card.Footer>
        </Card.Root>
      )

      // Assert
      const footer = screen.getByTestId('footer')
      expect(footer).toHaveClass('mt-4')
      expect(footer).not.toHaveClass('border-t', 'border-divider', 'pt-4')
    })

    it('should align items correctly', () => {
      // Arrange & Act
      const { rerender } = render(
        <Card.Root>
          <Card.Footer align="left" data-testid="footer">
            Left
          </Card.Footer>
        </Card.Root>
      )

      // Assert left
      let footer = screen.getByTestId('footer')
      expect(footer).toHaveClass('justify-start')

      // Act - rerender with center
      rerender(
        <Card.Root>
          <Card.Footer align="center" data-testid="footer">
            Center
          </Card.Footer>
        </Card.Root>
      )

      // Assert center
      footer = screen.getByTestId('footer')
      expect(footer).toHaveClass('justify-center')

      // Act - rerender with between
      rerender(
        <Card.Root>
          <Card.Footer align="between" data-testid="footer">
            Between
          </Card.Footer>
        </Card.Root>
      )

      // Assert between
      footer = screen.getByTestId('footer')
      expect(footer).toHaveClass('justify-between')
    })

    it('should default to right alignment', () => {
      // Arrange & Act
      render(
        <Card.Root>
          <Card.Footer data-testid="footer">
            <button>Action</button>
          </Card.Footer>
        </Card.Root>
      )

      // Assert
      const footer = screen.getByTestId('footer')
      expect(footer).toHaveClass('justify-end')
    })
  })

  describe('Card compound usage', () => {
    it('should render complete card structure', () => {
      // Arrange & Act
      render(
        <Card.Root variant="elevated" padding="md">
          <Card.Header withDivider>
            <div>
              <Card.Title>Complete Card</Card.Title>
              <Card.Description>This is a complete example</Card.Description>
            </div>
          </Card.Header>
          <Card.Body>
            <p>Main content goes here</p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </Card.Body>
          <Card.Footer withDivider align="between">
            <button>Cancel</button>
            <button>Submit</button>
          </Card.Footer>
        </Card.Root>
      )

      // Assert
      expect(screen.getByText('Complete Card')).toBeInTheDocument()
      expect(screen.getByText('This is a complete example')).toBeInTheDocument()
      expect(screen.getByText('Main content goes here')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Submit')).toBeInTheDocument()
    })
  })
})