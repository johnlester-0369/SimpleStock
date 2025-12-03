import React from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/utils/cn.util'

type InputVariant = 'default' | 'error' | 'success'
type InputSize = 'sm' | 'md' | 'lg'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
  variant?: InputVariant
  inputSize?: InputSize
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const base =
  'w-full rounded-lg border-2 bg-surface-1 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-muted'

const variantClasses: Record<InputVariant, string> = {
  default: 'border-border text-text focus:border-primary',
  error:
    'border-error text-text focus:border-error focus:ring-error/30 bg-error/5',
  success:
    'border-success text-text focus:border-success focus:ring-success/30 bg-success/5',
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-5 py-3 text-lg',
}

const iconSizeClasses: Record<InputSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      variant = 'default',
      inputSize = 'md',
      leftIcon,
      rightIcon,
      fullWidth = true,
      className,
      disabled,
      type = 'text',
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId()
    const inputId = id || `input-${generatedId}`

    const actualVariant = error ? 'error' : variant

    const showValidationIcon =
      actualVariant === 'error' || actualVariant === 'success'
    const ValidationIcon = actualVariant === 'error' ? AlertCircle : CheckCircle
    const validationIconColor =
      actualVariant === 'error' ? 'text-error' : 'text-success'

    const computedClass = cn(
      base,
      variantClasses[actualVariant],
      sizeClasses[inputSize],
      leftIcon ? 'pl-10' : false,
      rightIcon || showValidationIcon ? 'pr-10' : false,
      className,
    )

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-headline mb-2"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 flex items-center text-muted cursor-pointer z-10',
                iconSizeClasses[inputSize],
              )}
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={type}
            id={inputId}
            className={computedClass}
            disabled={disabled}
            aria-invalid={actualVariant === 'error' || undefined}
            aria-describedby={
              error || helperText ? `${inputId}-description` : undefined
            }
            {...props}
          />

          {(rightIcon || showValidationIcon) && (
            <div
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 flex items-center z-10',
                iconSizeClasses[inputSize],
                showValidationIcon ? validationIconColor : 'text-muted',
                showValidationIcon ? 'pointer-events-none' : 'cursor-pointer',
              )}
            >
              {showValidationIcon ? (
                <ValidationIcon className={iconSizeClasses[inputSize]} />
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p
            id={`${inputId}-description`}
            className={cn(
              'mt-1.5 text-sm',
              error ? 'text-error' : 'text-muted',
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export default Input
