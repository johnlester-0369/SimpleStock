import React from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

export type AlertVariant = 'success' | 'error' | 'warning' | 'info'

export interface AlertProps {
  variant?: AlertVariant
  title: string
  message?: string
  onClose?: () => void
  className?: string
}

const variantStyles: Record<
  AlertVariant,
  {
    container: string
    icon: React.ReactNode
  }
> = {
  success: {
    container: 'bg-success/10 border-success/20 text-success',
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
  error: {
    container: 'bg-error/10 border-error/20 text-error',
    icon: <AlertCircle className="h-5 w-5" />,
  },
  warning: {
    container: 'bg-warning/10 border-warning/20 text-warning',
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  info: {
    container: 'bg-info/10 border-info/20 text-info',
    icon: <Info className="h-5 w-5" />,
  },
}

/**
 * Alert component for displaying feedback messages
 *
 * @example
 * ```tsx
 * <Alert variant="success" title="Success!" />
 * <Alert variant="success" title="User created" message="The user has been successfully added to the system." />
 * <Alert variant="error" title="Failed to save" message="Please check your input and try again." onClose={() => setError(null)} />
 * ```
 */
const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message,
  onClose,
  className = '',
}) => {
  const styles = variantStyles[variant]

  return (
    <div
      className={`p-4 border rounded-lg animate-in fade-in duration-200 flex items-start gap-3 ${styles.container} ${className}`}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{title}</p>
        {message && <p className="text-sm mt-1 opacity-90">{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Close alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export default Alert
