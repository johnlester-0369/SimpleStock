import React from 'react'
import Button from './Button'
import { cn } from '@/utils/cn.util'

type EmptyStateSize = 'sm' | 'md'

export interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  size?: EmptyStateSize
  className?: string
}

/**
 * Size configuration for EmptyState variants
 * - sm: Compact size for use in dropdowns, comboboxes, small containers
 * - md: Default size for page-level or card-level empty states
 */
const sizeConfig: Record<
  EmptyStateSize,
  {
    wrapper: string
    iconWrapper: string
    icon: string
    title: string
    description: string
    buttonSize: 'sm' | 'md'
  }
> = {
  sm: {
    wrapper: 'p-6',
    iconWrapper: 'h-10 w-10 mb-3',
    icon: 'h-5 w-5',
    title: 'text-sm font-medium mb-1',
    description: 'text-xs mb-3',
    buttonSize: 'sm',
  },
  md: {
    wrapper: 'p-12',
    iconWrapper: 'h-16 w-16 mb-4',
    icon: 'h-8 w-8',
    title: 'text-lg font-semibold mb-2',
    description: 'text-base mb-4',
    buttonSize: 'md',
  },
}

/**
 * EmptyState component for displaying empty list states
 *
 * @example
 * ```tsx
 * // Default size for pages/cards
 * <EmptyState
 *   icon={Search}
 *   title="No results found"
 *   description="Try adjusting your filters"
 * />
 *
 * // Compact size for dropdowns/comboboxes
 * <EmptyState
 *   icon={Search}
 *   title="No options found"
 *   size="sm"
 * />
 *
 * // With action button
 * <EmptyState
 *   icon={Plus}
 *   title="No tasks yet"
 *   description="Create your first task to get started"
 *   action={{
 *     label: "Add Task",
 *     onClick: () => setModalOpen(true),
 *     icon: <Plus className="h-4 w-4" />
 *   }}
 * />
 * ```
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  size = 'md',
  className,
}) => {
  const config = sizeConfig[size]

  return (
    <div
      className={cn(
        'bg-surface-2 rounded-md text-center',
        config.wrapper,
        className,
      )}
      data-testid="empty-state-wrapper"
    >
      <div className="max-w-sm mx-auto">
        {Icon && (
          <div
            data-testid="empty-state-icon-wrapper"
            className={cn(
              'rounded-full bg-muted/10 flex items-center justify-center mx-auto',
              config.iconWrapper,
            )}
          >
            <Icon className={cn('text-muted', config.icon)} />
          </div>
        )}
        <h3 className={cn('text-headline', config.title)}>{title}</h3>
        {description && (
          <p className={cn('text-muted', config.description)} data-testid="empty-state-description">
            {description}
          </p>
        )}
        {action && (
          <Button
            variant="primary"
            size={config.buttonSize}
            leftIcon={action.icon}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}

export default EmptyState