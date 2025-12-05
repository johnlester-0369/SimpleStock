import React from 'react'
import { cn } from '@/utils/cn.util'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'unstyled'
type Size = 'sm' | 'md' | 'lg'

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
  icon: React.ReactNode
}

const base =
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-2 disabled:opacity-60 disabled:pointer-events-none active:scale-[0.98]'

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-on-primary hover:bg-primary/90 active:bg-primary/80 focus-visible:ring-primary/50 shadow-soft hover:shadow-soft-md',
  secondary:
    'bg-transparent text-primary border-2 border-primary hover:bg-primary/10 active:bg-primary/20 hover:border-primary active:border-primary focus-visible:ring-primary/50',
  ghost:
    'bg-transparent text-text hover:bg-surface-hover-2 active:bg-surface-hover-1 hover:text-headline active:text-headline focus-visible:ring-primary/50',
  danger:
    'bg-error text-white hover:bg-error/90 active:bg-error/80 focus-visible:ring-error/50 shadow-soft hover:shadow-soft-md',
  unstyled:
    'bg-transparent border-0 p-0 shadow-none hover:shadow-none focus-visible:ring-primary/50',
}

const sizeClasses: Record<Size, { container: string; icon: string }> = {
  sm: { container: 'h-8 w-8 p-1.5', icon: 'h-4 w-4' },
  md: { container: 'h-10 w-10 p-2', icon: 'h-5 w-5' },
  lg: { container: 'h-12 w-12 p-2.5', icon: 'h-6 w-6' },
}

const Spinner: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    className="animate-spin"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      strokeOpacity="0.25"
    />
    <path
      d="M22 12a10 10 0 00-10-10"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
)

/**
 * IconButton component for icon-only buttons
 *
 * @example
 * ```tsx
 * <IconButton icon={<Settings />} variant="ghost" aria-label="Settings" />
 * <IconButton icon={<Trash />} variant="danger" size="sm" aria-label="Delete" />
 * ```
 */
const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant = 'ghost',
      size = 'md',
      isLoading = false,
      icon,
      className,
      disabled,
      type,
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) => {
    const config = sizeClasses[size]
    const computedClass = cn(
      base,
      variantClasses[variant],
      variant !== 'unstyled' && config.container,
      className,
    )

    const isDisabled = Boolean(disabled || isLoading)

    // Require aria-label for accessibility
    if (!ariaLabel && !props['aria-labelledby']) {
      console.warn(
        'IconButton: Missing aria-label or aria-labelledby. Icon buttons must have accessible labels.',
      )
    }

    return (
      <button
        ref={ref}
        type={type ?? 'button'}
        className={computedClass}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        aria-disabled={isDisabled || undefined}
        aria-label={ariaLabel}
        {...props}
      >
        {isLoading ? (
          <Spinner size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
        ) : (
          <span className={cn('flex items-center justify-center', config.icon)}>
            {icon}
          </span>
        )}
      </button>
    )
  },
)

IconButton.displayName = 'IconButton'

export default IconButton
