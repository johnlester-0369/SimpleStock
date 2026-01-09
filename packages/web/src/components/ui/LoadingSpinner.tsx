import React from 'react'
import { cn } from '@/utils/cn.util'

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl'

export interface LoadingSpinnerProps {
  /**
   * Size of the spinner
   * @default 'lg'
   */
  size?: SpinnerSize
  /**
   * Optional loading message to display below spinner
   * @default 'Loading...'
   */
  message?: string
  /**
   * Whether to render as full-screen centered spinner
   * @default true
   */
  fullScreen?: boolean
  /**
   * Additional CSS classes for the container
   */
  className?: string
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-6 w-6 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-b-2',
  xl: 'h-16 w-16 border-b-2',
}

/**
 * LoadingSpinner component
 *
 * Displays an animated loading spinner with optional message.
 * Can be used as full-screen loader or inline spinner.
 *
 * @example
 * ```tsx
 * // Full-screen loader (default)
 * <LoadingSpinner />
 *
 * // Custom message
 * <LoadingSpinner message="Authenticating..." />
 *
 * // Inline spinner
 * <LoadingSpinner fullScreen={false} size="sm" />
 * ```
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'lg',
  message = 'Loading...',
  fullScreen = true,
  className,
}) => {
  const spinner = (
    <div className={cn('text-center', !fullScreen && className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-primary mx-auto',
          sizeClasses[size],
        )}
        role="status"
        aria-live="polite"
        aria-label={message}
      />
      {message && (
        <p className="mt-4 text-text transition-colors duration-300">
          {message}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div
        className={cn(
          'min-h-screen flex items-center justify-center bg-bg transition-colors duration-300',
          className,
        )}
      >
        {spinner}
      </div>
    )
  }

  return spinner
}

export default LoadingSpinner