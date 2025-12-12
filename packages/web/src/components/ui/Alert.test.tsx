/**
 * @fileoverview Unit tests for Alert component
 * @module components/ui/Alert.test
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Alert from '@/components/ui/Alert'

describe('Alert component', () => {
  describe('rendering', () => {
    it('should render title', () => {
      // Arrange & Act
      render(<Alert title="Test Alert Title" />)

      // Assert
      expect(screen.getByText('Test Alert Title')).toBeInTheDocument()
    })

    it('should render message when provided', () => {
      // Arrange & Act
      render(<Alert title="Title" message="This is a detailed message" />)

      // Assert
      expect(screen.getByText('This is a detailed message')).toBeInTheDocument()
    })

    it('should not render message element when not provided', () => {
      // Arrange & Act
      render(<Alert title="Title Only" />)

      // Assert
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      // Only title paragraph should exist
      const paragraphs = alert.querySelectorAll('p')
      expect(paragraphs).toHaveLength(1)
    })

    it('should apply custom className', () => {
      // Arrange & Act
      render(<Alert title="Test" className="custom-alert-class" />)

      // Assert
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('custom-alert-class')
    })
  })

  describe('variants', () => {
    it('should render success variant with correct styling', () => {
      // Arrange & Act
      render(<Alert variant="success" title="Success!" />)

      // Assert
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('bg-success/10')
      expect(alert).toHaveClass('border-success/20')
      expect(alert).toHaveClass('text-success')
    })

    it('should render error variant with correct styling', () => {
      // Arrange & Act
      render(<Alert variant="error" title="Error!" />)

      // Assert
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('bg-error/10')
      expect(alert).toHaveClass('border-error/20')
      expect(alert).toHaveClass('text-error')
    })

    it('should render warning variant with correct styling', () => {
      // Arrange & Act
      render(<Alert variant="warning" title="Warning!" />)

      // Assert
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('bg-warning/10')
      expect(alert).toHaveClass('border-warning/20')
      expect(alert).toHaveClass('text-warning')
    })

    it('should render info variant by default', () => {
      // Arrange & Act
      render(<Alert title="Info" />)

      // Assert
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('bg-info/10')
      expect(alert).toHaveClass('border-info/20')
      expect(alert).toHaveClass('text-info')
    })

    it('should render info variant when explicitly specified', () => {
      // Arrange & Act
      render(<Alert variant="info" title="Information" />)

      // Assert
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('text-info')
    })
  })

  describe('close button', () => {
    it('should show close button when onClose is provided', () => {
      // Arrange
      const handleClose = vi.fn()

      // Act
      render(<Alert title="Closable" onClose={handleClose} />)

      // Assert
      const closeButton = screen.getByRole('button', { name: /close alert/i })
      expect(closeButton).toBeInTheDocument()
    })

    it('should not show close button when onClose is not provided', () => {
      // Arrange & Act
      render(<Alert title="Not Closable" />)

      // Assert
      const closeButton = screen.queryByRole('button', { name: /close alert/i })
      expect(closeButton).not.toBeInTheDocument()
    })

    it('should call onClose when close button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      const handleClose = vi.fn()
      render(<Alert title="Click to close" onClose={handleClose} />)

      // Act
      const closeButton = screen.getByRole('button', { name: /close alert/i })
      await user.click(closeButton)

      // Assert
      expect(handleClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('accessibility', () => {
    it('should have role="alert"', () => {
      // Arrange & Act
      render(<Alert title="Accessible Alert" />)

      // Assert
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('should have accessible close button label', () => {
      // Arrange
      const handleClose = vi.fn()

      // Act
      render(<Alert title="Test" onClose={handleClose} />)

      // Assert
      const closeButton = screen.getByRole('button', { name: /close alert/i })
      expect(closeButton).toHaveAttribute('aria-label', 'Close alert')
    })
  })

  describe('icons', () => {
    it('should render CheckCircle2 icon for success variant', () => {
      // Arrange & Act
      render(<Alert variant="success" title="Success" />)

      // Assert
      const alert = screen.getByRole('alert')
      const svg = alert.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('h-5', 'w-5')
    })

    it('should render AlertCircle icon for error variant', () => {
      // Arrange & Act
      render(<Alert variant="error" title="Error" />)

      // Assert
      const alert = screen.getByRole('alert')
      const svg = alert.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should render AlertTriangle icon for warning variant', () => {
      // Arrange & Act
      render(<Alert variant="warning" title="Warning" />)

      // Assert
      const alert = screen.getByRole('alert')
      const svg = alert.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should render Info icon for info variant', () => {
      // Arrange & Act
      render(<Alert variant="info" title="Info" />)

      // Assert
      const alert = screen.getByRole('alert')
      const svg = alert.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })
})