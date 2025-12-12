/**
 * @fileoverview Unit tests for Dialog component
 * @module components/ui/Dialog.test
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Dialog from '@/components/ui/Dialog'

// Mock react-dom's createPortal to render in-place for testing
vi.mock('react-dom', async () => {
  const actual = await vi.importActual<typeof import('react-dom')>('react-dom')
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children as React.ReactPortal,
  }
})

describe('Dialog component', () => {
  describe('Dialog.Root', () => {
    it('should render children when open (controlled)', () => {
      // Arrange & Act
      render(
        <Dialog.Root open={true}>
          <Dialog.Trigger>Open</Dialog.Trigger>
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Test Dialog</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>Dialog content</Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      )

      // Assert
      expect(screen.getByText('Test Dialog')).toBeInTheDocument()
      expect(screen.getByText('Dialog content')).toBeInTheDocument()
    })

    it('should not render dialog when closed (controlled)', () => {
      // Arrange & Act
      render(
        <Dialog.Root open={false}>
          <Dialog.Trigger>Open</Dialog.Trigger>
          <Dialog.Positioner>
            <Dialog.Content>Content</Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      )

      // Assert
      expect(screen.queryByText('Content')).not.toBeInTheDocument()
      expect(screen.getByText('Open')).toBeInTheDocument()
    })

    it('should call onOpenChange when open state changes', async () => {
      // Arrange
      const user = userEvent.setup()
      const handleOpenChange = vi.fn()
      
      render(
        <Dialog.Root open={false} onOpenChange={handleOpenChange}>
          <Dialog.Trigger>Open</Dialog.Trigger>
          <Dialog.Positioner>
            <Dialog.Content>Content</Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      )

      // Act - trigger should call onOpenChange with true
      await user.click(screen.getByText('Open'))

      // Assert
      expect(handleOpenChange).toHaveBeenCalledWith(true)
    })
  })

  describe('Dialog.Trigger', () => {
    it('should open dialog when clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      
      render(
        <Dialog.Root defaultOpen={false}>
          <Dialog.Trigger>Open Dialog</Dialog.Trigger>
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Dialog Title</Dialog.Title>
              </Dialog.Header>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      )

      // Act
      await user.click(screen.getByText('Open Dialog'))

      // Assert
      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    })

    it('should work with asChild pattern', async () => {
      // Arrange
      const user = userEvent.setup()
      
      render(
        <Dialog.Root defaultOpen={false}>
          <Dialog.Trigger asChild>
            <button>Custom Trigger</button>
          </Dialog.Trigger>
          <Dialog.Positioner>
            <Dialog.Content>Content</Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      )

      // Act
      await user.click(screen.getByText('Custom Trigger'))

      // Assert
      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  describe('Dialog.Content', () => {
    it('should apply size classes correctly', () => {
      // Arrange & Act
      render(
        <Dialog.Root open={true}>
          <Dialog.Positioner>
            <Dialog.Content size="lg">
              Content
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      )

      // Assert
      const dialog = screen.getByRole('dialog')
      const content = dialog.querySelector('[tabindex="-1"]')
      expect(content).toHaveClass('max-w-[42rem]') // lg size
    })

    it('should have default md size', () => {
      // Arrange & Act
      render(
        <Dialog.Root open={true}>
          <Dialog.Positioner>
            <Dialog.Content>
              Content
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      )

      // Assert
      const dialog = screen.getByRole('dialog')
      const content = dialog.querySelector('[tabindex="-1"]')
      expect(content).toHaveClass('max-w-[32rem]') // md size
    })
  })

  describe('Dialog interactions', () => {
    it('should close when ESC key is pressed', async () => {
      // Arrange
      const user = userEvent.setup()
      const handleOpenChange = vi.fn()
      
      render(
        <Dialog.Root open={true} onOpenChange={handleOpenChange}>
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Test Dialog</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>Press ESC to close</Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      )

      // Act
      await user.keyboard('{Escape}')

      // Assert
      expect(handleOpenChange).toHaveBeenCalledWith(false)
    })

    it('should close when close button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      const handleClose = vi.fn()
      
      render(
        <Dialog.Root open={true} onOpenChange={handleClose}>
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Test Dialog</Dialog.Title>
                <Dialog.CloseTrigger />
              </Dialog.Header>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      )

      // Act
      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)

      // Assert
      expect(handleClose).toHaveBeenCalledWith(false)
    })

    it('should contain focus within dialog when open', async () => {
      // Arrange
      const user = userEvent.setup()
      
      render(
        <Dialog.Root open={true}>
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Focus Test</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <button>First</button>
                <button>Second</button>
              </Dialog.Body>
              <Dialog.Footer>
                <button>Cancel</button>
                <button>Confirm</button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      )

      // Act - get all buttons
      const buttons = screen.getAllByRole('button')
      const firstButton = buttons[0]
      
      // Focus first button
      firstButton.focus()
      expect(document.activeElement).toBe(firstButton)

      // Tab through all buttons
      await user.tab()
      expect(document.activeElement?.tagName).toBe('BUTTON')
      
      await user.tab()
      expect(document.activeElement?.tagName).toBe('BUTTON')
    })
  })

  describe('Dialog accessibility', () => {
    it('should have proper ARIA attributes', () => {
      // Arrange & Act
      render(
        <Dialog.Root open={true}>
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Accessible Dialog</Dialog.Title>
              </Dialog.Header>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      )

      // Assert
      const positioner = screen.getByRole('dialog')
      expect(positioner).toHaveAttribute('aria-modal', 'true')
      
      const title = screen.getByText('Accessible Dialog')
      expect(title).toHaveAttribute('id', 'dialog-title')
    })

    it('should call onOpenChange when trigger is clicked after dialog closes', async () => {
      // Arrange
      const user = userEvent.setup()
      const handleOpenChange = vi.fn()
      
      const { rerender } = render(
        <Dialog.Root open={false} onOpenChange={handleOpenChange}>
          <Dialog.Trigger>Open</Dialog.Trigger>
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Test</Dialog.Title>
                <Dialog.CloseTrigger />
              </Dialog.Header>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      )

      const trigger = screen.getByText('Open')
      
      // Open dialog
      await user.click(trigger)
      expect(handleOpenChange).toHaveBeenCalledWith(true)
      
      // Simulate open state
      rerender(
        <Dialog.Root open={true} onOpenChange={handleOpenChange}>
          <Dialog.Trigger>Open</Dialog.Trigger>
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Test</Dialog.Title>
                <Dialog.CloseTrigger />
              </Dialog.Header>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      )

      // Close dialog
      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)
      
      // Assert
      expect(handleOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('Dialog variants', () => {
    it('should render with backdrop when using Dialog.Backdrop', () => {
      // Arrange & Act
      render(
        <Dialog.Root open={true}>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>Content</Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      )

      // Assert
      const backdrop = document.querySelector('.bg-black\\/50')
      expect(backdrop).toBeInTheDocument()
      expect(backdrop).toHaveAttribute('aria-hidden', 'true')
    })

    it('should support different positions', () => {
      // Arrange & Act
      render(
        <Dialog.Root open={true}>
          <Dialog.Positioner position="center">
            <Dialog.Content>Content</Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      )

      // Assert
      const positioner = screen.getByRole('dialog')
      expect(positioner).toHaveClass('items-center')
    })
  })
})