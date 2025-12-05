import React from 'react'
import { cn } from '@/utils/cn.util'

// ============================================================================
// Types
// ============================================================================

type CardVariant = 'default' | 'elevated' | 'bordered' | 'ghost' | 'unstyled'
type CardPadding = 'none' | 'sm' | 'md' | 'lg'

// ============================================================================
// Root Component
// ============================================================================

export interface CardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  padding?: CardPadding
  interactive?: boolean
  asChild?: boolean
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-surface-2 rounded-lg',
  elevated:
    'bg-surface-2 border border-border rounded-lg shadow-soft transition-shadow',
  bordered:
    'bg-surface-1 border-2 border-border rounded-lg shadow-soft transition-colors',
  ghost:
    'bg-transparent border border-transparent rounded-lg transition-colors',
  unstyled: '',
}

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

const CardRoot = React.forwardRef<HTMLDivElement, CardRootProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      interactive = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          variantClasses[variant],
          padding !== 'none' && paddingClasses[padding],
          interactive &&
            'cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-transform',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)

CardRoot.displayName = 'Card.Root'

// ============================================================================
// Header Component
// ============================================================================

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  withDivider?: boolean
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ withDivider = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start justify-between',
          withDivider ? 'pb-4 mb-4 border-b border-divider' : 'mb-4',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)

CardHeader.displayName = 'Card.Header'

// ============================================================================
// Title Component
// ============================================================================

export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ as: Component = 'h3', className, children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          'text-xl font-semibold text-headline leading-tight',
          className,
        )}
        {...props}
      >
        {children}
      </Component>
    )
  },
)

CardTitle.displayName = 'Card.Title'

// ============================================================================
// Description Component
// ============================================================================

export type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-muted mt-1.5 leading-relaxed', className)}
      {...props}
    >
      {children}
    </p>
  )
})

CardDescription.displayName = 'Card.Description'

// ============================================================================
// Body Component
// ============================================================================

export type CardBodyProps = React.HTMLAttributes<HTMLDivElement>

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('text-text leading-relaxed', className)}
        {...props}
      >
        {children}
      </div>
    )
  },
)

CardBody.displayName = 'Card.Body'

// ============================================================================
// Footer Component
// ============================================================================

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  withDivider?: boolean
  align?: 'left' | 'center' | 'right' | 'between'
}

const alignClasses: Record<NonNullable<CardFooterProps['align']>, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
  between: 'justify-between',
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  (
    { withDivider = false, align = 'right', className, children, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-3',
          alignClasses[align],
          withDivider ? 'pt-4 mt-4 border-t border-divider' : 'mt-4',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)

CardFooter.displayName = 'Card.Footer'

// ============================================================================
// Compound Component Export
// ============================================================================

const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Body: CardBody,
  Footer: CardFooter,
}

export default Card
