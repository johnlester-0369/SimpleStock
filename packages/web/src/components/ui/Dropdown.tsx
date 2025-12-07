import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn.util'

type DropdownSize = 'sm' | 'md' | 'lg'
type DropdownVariant = 'default' | 'primary' | 'ghost'
type MenuPosition = 'left' | 'right'

export interface DropdownOption {
  value: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
  divider?: boolean
}

export interface DropdownProps {
  options: DropdownOption[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  size?: DropdownSize
  variant?: DropdownVariant
  menuPosition?: MenuPosition
  fullWidth?: boolean
  error?: string
  showCheck?: boolean
  className?: string
}

const buttonBase =
  'inline-flex items-center justify-between rounded-lg font-medium focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed'

const variantClasses: Record<DropdownVariant, string> = {
  default:
    'bg-surface-2 text-text border-2 border-border hover:bg-surface-hover-2 focus:border-primary',
  primary:
    'bg-primary text-on-primary hover:bg-primary/90 focus:ring-primary/50 shadow-soft hover:shadow-soft-md',
  ghost:
    'bg-transparent text-text border-2 border-transparent hover:bg-surface-hover-2 hover:border-border focus:ring-primary/50',
}

const sizeClasses: Record<DropdownSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-2',
  md: 'px-4 py-2.5 text-base gap-2',
  lg: 'px-5 py-3 text-lg gap-3',
}

const menuSizeClasses: Record<DropdownSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder = 'Select an option',
  label,
  disabled = false,
  size = 'md',
  variant = 'default',
  menuPosition = 'left',
  fullWidth = true,
  error,
  showCheck = true,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [internalValue, setInternalValue] = useState(defaultValue || '')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [menuRect, setMenuRect] = useState<{
    top: number
    left: number
    width: number
  } | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)

  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const selectedOption = options.find((opt) => opt.value === value)

  // Calculate menu position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        if (!buttonRef.current) return

        const rect = buttonRef.current.getBoundingClientRect()
        const scrollY = window.scrollY || window.pageYOffset
        const scrollX = window.scrollX || window.pageXOffset

        setMenuRect({
          top: rect.bottom + scrollY + 8, // 8px gap (mt-2)
          left:
            menuPosition === 'left'
              ? rect.left + scrollX
              : rect.right + scrollX - rect.width,
          width: rect.width,
        })
      }

      updatePosition()

      // Update position on resize
      window.addEventListener('resize', updatePosition)

      return () => {
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen, menuPosition])

  // Close dropdown when scrolling outside of dropdown container
  useEffect(() => {
    const handleScroll = (event: Event) => {
      if (!isOpen) return

      const target = event.target as Node | null

      // Don't close if scrolling inside the dropdown menu
      if (target && menuRef.current && menuRef.current.contains(target)) {
        return
      }

      // Don't close if scrolling inside the dropdown container
      if (target && dropdownRef.current && dropdownRef.current.contains(target)) {
        return
      }

      // Close dropdown for any external scroll
      setIsOpen(false)
      setFocusedIndex(-1)
    }

    if (isOpen) {
      window.addEventListener('scroll', handleScroll, true)
      return () => {
        window.removeEventListener('scroll', handleScroll, true)
      }
    }
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setFocusedIndex(-1)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    const enabledOptions = options.filter(
      (opt) => !opt.disabled && !opt.divider,
    )

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          setFocusedIndex(0)
        } else if (focusedIndex >= 0 && enabledOptions[focusedIndex]) {
          handleSelect(enabledOptions[focusedIndex].value)
        }
        break

      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setFocusedIndex(-1)
        buttonRef.current?.focus()
        break

      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          setFocusedIndex(0)
        } else {
          setFocusedIndex((prev) =>
            prev < enabledOptions.length - 1 ? prev + 1 : prev,
          )
        }
        break

      case 'ArrowUp':
        e.preventDefault()
        if (isOpen) {
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0))
        }
        break

      case 'Home':
        if (isOpen) {
          e.preventDefault()
          setFocusedIndex(0)
        }
        break

      case 'End':
        if (isOpen) {
          e.preventDefault()
          setFocusedIndex(enabledOptions.length - 1)
        }
        break

      case 'Tab':
        if (isOpen) {
          setIsOpen(false)
          setFocusedIndex(-1)
        }
        break
    }
  }

  // Scroll focused item into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && menuRef.current) {
      const focusedElement = menuRef.current.children[
        focusedIndex
      ] as HTMLElement
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [focusedIndex, isOpen])

  const handleSelect = (optionValue: string) => {
    if (!isControlled) {
      setInternalValue(optionValue)
    }
    onChange?.(optionValue)
    setIsOpen(false)
    setFocusedIndex(-1)
    buttonRef.current?.focus()
  }

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev)
      if (!isOpen) {
        setFocusedIndex(0)
      }
    }
  }

  const enabledOptions = options.filter((opt) => !opt.disabled && !opt.divider)

  const generatedId = React.useId()
  const labelId = `dropdown-label-${generatedId}`
  const menuId = `dropdown-menu-${generatedId}`

  // Determine placeholder text color based on variant
  const getPlaceholderClass = () => {
    if (selectedOption) return ''

    // For primary variant, use lighter on-primary color for better readability
    if (variant === 'primary') {
      return 'text-on-primary/70'
    }

    // For other variants, use standard muted color
    return 'text-muted'
  }

  // Render dropdown menu via portal
  const dropdownMenu = isOpen && menuRect && (
    <ul
      ref={menuRef}
      id={menuId}
      role="listbox"
      aria-labelledby={label ? labelId : undefined}
      style={{
        position: 'absolute',
        top: `${menuRect.top}px`,
        left: `${menuRect.left}px`,
        minWidth: `${menuRect.width}px`,
        zIndex: 9999,
      }}
      className={cn(
        'max-h-60 overflow-auto rounded-lg border-2 border-border bg-surface-2 shadow-soft-lg scrollbar',
        menuSizeClasses[size],
      )}
    >
      {options.map((option, index) => {
        if (option.divider) {
          return (
            <li
              key={`divider-${index}`}
              role="separator"
              className="my-1 border-t border-divider"
            />
          )
        }

        const enabledIndex = enabledOptions.findIndex(
          (opt) => opt.value === option.value,
        )
        const isFocused = enabledIndex === focusedIndex
        const isSelected = option.value === value

        return (
          <li
            key={option.value}
            role="option"
            aria-selected={isSelected}
            aria-disabled={option.disabled || undefined}
            className={cn(
              'flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors',
              option.disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-surface-hover-2',
              isFocused && !option.disabled && 'bg-surface-hover-2',
              isSelected && 'text-primary font-medium',
            )}
            onClick={() => {
              if (!option.disabled) {
                handleSelect(option.value)
              }
            }}
            onMouseEnter={() => {
              if (!option.disabled) {
                setFocusedIndex(enabledIndex)
              }
            }}
          >
            {showCheck && (
              <span className="flex items-center shrink-0 w-4 h-4">
                {isSelected && <Check className="w-4 h-4" />}
              </span>
            )}

            {option.icon && (
              <span className="flex items-center shrink-0">{option.icon}</span>
            )}

            <span className="flex-1 truncate">{option.label}</span>
          </li>
        )
      })}
    </ul>
  )

  return (
    <div
      ref={dropdownRef}
      className={cn('relative', fullWidth && 'w-full', className)}
    >
      {label && (
        <label
          id={labelId}
          className="block text-sm font-medium text-headline mb-2"
        >
          {label}
        </label>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          buttonBase,
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          error && 'border-error focus:ring-error/30',
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? labelId : undefined}
        aria-controls={isOpen ? menuId : undefined}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <span className="flex items-center shrink-0">
              {selectedOption.icon}
            </span>
          )}
          <span className={getPlaceholderClass()}>
            {selectedOption?.label || placeholder}
          </span>
        </span>

        <ChevronDown
          className={cn(
            'transition-transform duration-200 shrink-0',
            isOpen && 'rotate-180',
            size === 'sm' && 'h-4 w-4',
            size === 'md' && 'h-5 w-5',
            size === 'lg' && 'h-6 w-6',
          )}
        />
      </button>

      {error && <p className="mt-1.5 text-sm text-error">{error}</p>}

      {/* Render menu via portal */}
      {isOpen && createPortal(dropdownMenu, document.body)}
    </div>
  )
}

Dropdown.displayName = 'Dropdown'

export default Dropdown