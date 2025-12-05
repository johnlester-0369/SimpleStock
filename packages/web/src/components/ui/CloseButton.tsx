import React from 'react'
import { X } from 'lucide-react'
import IconButton, { type IconButtonProps } from './IconButton'

export interface CloseButtonProps
  extends Omit<IconButtonProps, 'icon' | 'aria-label'> {
  'aria-label'?: string
}

/**
 * CloseButton component - specialized IconButton for closing UI elements
 *
 * @example
 * ```tsx
 * <CloseButton onClick={handleClose} />
 * <CloseButton size="sm" variant="danger" />
 * <CloseButton aria-label="Close modal" />
 * ```
 */
const CloseButton = React.forwardRef<HTMLButtonElement, CloseButtonProps>(
  ({ 'aria-label': ariaLabel = 'Close', ...props }, ref) => {
    return (
      <IconButton ref={ref} icon={<X />} aria-label={ariaLabel} {...props} />
    )
  },
)

CloseButton.displayName = 'CloseButton'

export default CloseButton
