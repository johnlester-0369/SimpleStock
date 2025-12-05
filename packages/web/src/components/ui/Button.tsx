import React from 'react'
import { cn } from '@/utils/cn.util'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'unstyled'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const base =
  'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-2 disabled:opacity-60 disabled:pointer-events-none active:scale-[0.98]'

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

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-base gap-2',
  lg: 'px-5 py-3 text-lg gap-2.5',
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

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      className,
      disabled,
      type,
      ...props
    },
    ref,
  ) => {
    const computedClass = cn(
      base,
      variantClasses[variant],
      variant !== 'unstyled' && sizeClasses[size],
      fullWidth && 'w-full',
      className,
    )

    const isDisabled = Boolean(disabled || isLoading)

    return (
      <button
        ref={ref}
        type={type ?? 'button'}
        className={computedClass}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        aria-disabled={isDisabled || undefined}
        {...props}
      >
        {isLoading ? (
          <Spinner size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
        ) : (
          leftIcon && <span className="flex items-center">{leftIcon}</span>
        )}
        <span className={cn(isLoading ? 'sr-only' : undefined)}>
          {children}
        </span>
        {!isLoading && rightIcon && (
          <span className="flex items-center">{rightIcon}</span>
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'

export default Button
