import React, { createContext, useContext } from 'react'
import { cn } from '@/utils/cn.util'
import Pagination, { type PaginationProps } from './Pagination'

// ============================================================================
// Types
// ============================================================================

type TableVariant = 'default' | 'bordered' | 'striped'
type TableSize = 'sm' | 'md' | 'lg'
type TableAlign = 'left' | 'center' | 'right'

interface TableContextValue {
  variant: TableVariant
  size: TableSize
  hoverable: boolean
}

// ============================================================================
// Context
// ============================================================================

const TableContext = createContext<TableContextValue | undefined>(undefined)

const useTableContext = () => {
  const context = useContext(TableContext)
  if (!context) {
    throw new Error('Table compound components must be used within Table.Root')
  }
  return context
}

// ============================================================================
// Style Configurations
// ============================================================================

const sizeClasses: Record<TableSize, { cell: string; head: string }> = {
  sm: {
    cell: 'px-3 py-2 text-sm',
    head: 'px-3 py-2 text-xs',
  },
  md: {
    cell: 'px-4 py-3 text-sm',
    head: 'px-4 py-3 text-xs',
  },
  lg: {
    cell: 'px-6 py-4 text-base',
    head: 'px-6 py-4 text-sm',
  },
}

const alignClasses: Record<TableAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

// ============================================================================
// ScrollArea Component
// ============================================================================

export interface TableScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum height before vertical scrolling */
  maxHeight?: string
  /** Maximum width before horizontal scrolling */
  maxWidth?: string
  /** Control horizontal overflow behavior */
  overflowX?: 'auto' | 'scroll' | 'hidden'
  /** Control vertical overflow behavior */
  overflowY?: 'auto' | 'scroll' | 'hidden'
}

const TableScrollArea = React.forwardRef<HTMLDivElement, TableScrollAreaProps>(
  (
    {
      maxHeight,
      maxWidth,
      overflowX = 'auto',
      overflowY = 'auto',
      className,
      children,
      style,
      ...props
    },
    ref,
  ) => {
    const scrollStyles: React.CSSProperties = {
      maxHeight,
      maxWidth,
      overflowX,
      overflowY,
      ...style,
    }

    return (
      <div
        ref={ref}
        className={cn(
          'w-full rounded-lg border border-border scrollbar',
          className,
        )}
        style={scrollStyles}
        {...props}
      >
        {children}
      </div>
    )
  },
)
TableScrollArea.displayName = 'Table.ScrollArea'

// ============================================================================
// Root Component
// ============================================================================

export interface TableRootProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** Visual style variant */
  variant?: TableVariant
  /** Size affecting padding and font size */
  size?: TableSize
  /** Enable row hover effect */
  hoverable?: boolean
  /** Make header sticky when scrolling */
  stickyHeader?: boolean
  /** Table takes full width of container */
  fullWidth?: boolean
}

const TableRoot = React.forwardRef<HTMLTableElement, TableRootProps>(
  (
    {
      variant = 'default',
      size = 'md',
      hoverable = true,
      stickyHeader = false,
      fullWidth = true,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const contextValue: TableContextValue = {
      variant,
      size,
      hoverable,
    }

    return (
      <TableContext.Provider value={contextValue}>
        <table
          ref={ref}
          className={cn(
            'border-collapse bg-surface-2',
            fullWidth && 'w-full',
            variant === 'bordered' && 'border border-border',
            stickyHeader && '[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10',
            className,
          )}
          {...props}
        >
          {children}
        </table>
      </TableContext.Provider>
    )
  },
)
TableRoot.displayName = 'Table.Root'

// ============================================================================
// Header Component
// ============================================================================

export type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement>

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <thead ref={ref} className={cn('bg-surface-1', className)} {...props}>
        {children}
      </thead>
    )
  },
)
TableHeader.displayName = 'Table.Header'

// ============================================================================
// Body Component
// ============================================================================

export type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, children, ...props }, ref) => {
    const { variant } = useTableContext()
    return (
      <tbody
        ref={ref}
        className={cn(
          '[&_tr:last-child]:border-0',
          variant === 'striped' && '[&_tr:nth-child(even)]:bg-surface-1',
          className,
        )}
        {...props}
      >
        {children}
      </tbody>
    )
  },
)
TableBody.displayName = 'Table.Body'

// ============================================================================
// Footer Component
// ============================================================================

export type TableFooterProps = React.HTMLAttributes<HTMLTableSectionElement>

const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <tfoot
        ref={ref}
        className={cn(
          'bg-surface-1 border-t border-border font-medium',
          className,
        )}
        {...props}
      >
        {children}
      </tfoot>
    )
  },
)
TableFooter.displayName = 'Table.Footer'

// ============================================================================
// Row Component
// ============================================================================

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Mark row as selected */
  selected?: boolean
  /** Disable hover effect for this row */
  disableHover?: boolean
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  (
    { selected = false, disableHover = false, className, children, ...props },
    ref,
  ) => {
    const { hoverable, variant } = useTableContext()
    return (
      <tr
        ref={ref}
        className={cn(
          'border-b border-divider transition-colors',
          hoverable && !disableHover && 'hover:bg-surface-hover-2',
          selected && 'bg-primary/10 hover:bg-primary/15',
          variant === 'bordered' && 'border-border',
          className,
        )}
        data-selected={selected || undefined}
        {...props}
      >
        {children}
      </tr>
    )
  },
)
TableRow.displayName = 'Table.Row'

// ============================================================================
// Head Cell Component
// ============================================================================

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** Text alignment */
  align?: TableAlign
  /** Enable sortable styling */
  sortable?: boolean
  /** Current sort direction */
  sortDirection?: 'asc' | 'desc' | null
  /** Make column sticky horizontally */
  sticky?: boolean
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  (
    {
      align = 'left',
      sortable = false,
      sortDirection = null,
      sticky = false,
      className,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const { size } = useTableContext()
    const config = sizeClasses[size]
    return (
      <th
        ref={ref}
        className={cn(
          config.head,
          alignClasses[align],
          'font-semibold text-headline uppercase tracking-wider whitespace-nowrap',
          'border-b-2 border-border bg-surface-1',
          sortable &&
            'cursor-pointer select-none hover:bg-surface-hover-1 transition-colors',
          sticky && 'sticky left-0 z-20 bg-surface-1',
          className,
        )}
        onClick={sortable ? onClick : undefined}
        aria-sort={
          sortDirection === 'asc'
            ? 'ascending'
            : sortDirection === 'desc'
              ? 'descending'
              : undefined
        }
        {...props}
      >
        <div
          className={cn(
            'flex items-center gap-2',
            align === 'right' && 'justify-end',
            align === 'center' && 'justify-center',
          )}
        >
          {children}
          {sortable && (
            <span className="inline-flex flex-col">
              <svg
                className={cn(
                  'h-2 w-2 -mb-0.5',
                  sortDirection === 'asc' ? 'text-primary' : 'text-muted/40',
                )}
                viewBox="0 0 8 4"
                fill="currentColor"
              >
                <path d="M4 0L8 4H0L4 0Z" />
              </svg>
              <svg
                className={cn(
                  'h-2 w-2',
                  sortDirection === 'desc' ? 'text-primary' : 'text-muted/40',
                )}
                viewBox="0 0 8 4"
                fill="currentColor"
              >
                <path d="M4 4L0 0H8L4 4Z" />
              </svg>
            </span>
          )}
        </div>
      </th>
    )
  },
)
TableHead.displayName = 'Table.Head'

// ============================================================================
// Cell Component
// ============================================================================

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /** Text alignment */
  align?: TableAlign
  /** Make cell sticky horizontally */
  sticky?: boolean
  /** Truncate text with ellipsis */
  truncate?: boolean
  /** Maximum width for truncation */
  maxWidth?: string
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  (
    {
      align = 'left',
      sticky = false,
      truncate = false,
      maxWidth,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const { size, variant } = useTableContext()
    const config = sizeClasses[size]
    return (
      <td
        ref={ref}
        className={cn(
          config.cell,
          alignClasses[align],
          'text-text',
          variant === 'bordered' && 'border border-border',
          sticky && 'sticky left-0 z-10 bg-inherit',
          truncate && 'truncate',
          className,
        )}
        style={{ maxWidth, ...style }}
        {...props}
      >
        {children}
      </td>
    )
  },
)
TableCell.displayName = 'Table.Cell'

// ============================================================================
// Caption Component
// ============================================================================

export interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {
  /** Position of caption */
  position?: 'top' | 'bottom'
}

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  TableCaptionProps
>(({ position = 'bottom', className, children, ...props }, ref) => {
  return (
    <caption
      ref={ref}
      className={cn(
        'px-4 py-3 text-sm text-muted',
        position === 'top' ? 'caption-top' : 'caption-bottom',
        className,
      )}
      {...props}
    >
      {children}
    </caption>
  )
})
TableCaption.displayName = 'Table.Caption'

// ============================================================================
// Empty State Component
// ============================================================================

export interface TableEmptyProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Number of columns to span */
  colSpan: number
  /** Icon to display */
  icon?: React.ReactNode
  /** Main message */
  message?: string
  /** Secondary description */
  description?: string
}

const TableEmpty = React.forwardRef<HTMLTableRowElement, TableEmptyProps>(
  (
    {
      colSpan,
      icon,
      message = 'No data available',
      description,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <tr ref={ref} className={className} {...props}>
        <td colSpan={colSpan} className="py-12 text-center">
          <div className="flex flex-col items-center gap-3">
            {icon && <div className="text-muted/50">{icon}</div>}
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted">{message}</p>
              {description && (
                <p className="text-xs text-muted/70">{description}</p>
              )}
            </div>
            {children}
          </div>
        </td>
      </tr>
    )
  },
)
TableEmpty.displayName = 'Table.Empty'

// ============================================================================
// Loading Component
// ============================================================================

export interface TableLoadingProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Number of columns to span */
  colSpan: number
  /** Number of skeleton rows to show */
  rows?: number
}

const TableLoading = React.forwardRef<HTMLTableRowElement, TableLoadingProps>(
  ({ colSpan, rows = 5, className, ...props }, ref) => {
    const { size } = useTableContext()
    const config = sizeClasses[size]
    return (
      <>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <tr
            key={rowIndex}
            ref={rowIndex === 0 ? ref : undefined}
            className={cn('animate-pulse', className)}
            {...(rowIndex === 0 ? props : {})}
          >
            {Array.from({ length: colSpan }).map((_, cellIndex) => (
              <td key={cellIndex} className={config.cell}>
                <div className="h-4 bg-surface-hover-1 rounded w-full" />
              </td>
            ))}
          </tr>
        ))}
      </>
    )
  },
)
TableLoading.displayName = 'Table.Loading'

// ============================================================================
// Pagination Component (Table-integrated)
// ============================================================================

export interface TablePaginationProps extends PaginationProps {
  /** Add border-top and margin for visual separation from table */
  withBorder?: boolean
}

/**
 * Table.Pagination - Integrated pagination for Table component
 *
 * Wraps the Pagination component with table-specific styling.
 * Automatically inherits size from Table.Root when used inside it.
 * Can be used both inside and outside Table.Root.
 *
 * @example
 * ```tsx
 * // Basic usage (outside Table.Root - common pattern)
 * <Table.ScrollArea>
 *   <Table.Root>
 *     <Table.Header>...</Table.Header>
 *     <Table.Body>...</Table.Body>
 *   </Table.Root>
 * </Table.ScrollArea>
 * <Table.Pagination
 *   currentPage={currentPage}
 *   totalItems={100}
 *   itemsPerPage={10}
 *   onPageChange={setCurrentPage}
 * />
 *
 * // With custom options
 * <Table.Pagination
 *   currentPage={page}
 *   totalItems={products.length}
 *   itemsPerPage={20}
 *   onPageChange={setPage}
 *   showInfo
 *   itemLabel="products"
 *   size="lg"
 *   withBorder={false}
 * />
 *
 * // Minimal without info text
 * <Table.Pagination
 *   currentPage={page}
 *   totalItems={data.length}
 *   itemsPerPage={25}
 *   onPageChange={setPage}
 *   showInfo={false}
 * />
 * ```
 */
const TablePagination: React.FC<TablePaginationProps> = ({
  withBorder = true,
  size,
  className,
  ...paginationProps
}) => {
  // Use React.useContext directly to get optional context
  // Returns undefined when outside Table.Root - that's expected and fine
  const tableContext = useContext(TableContext)

  // Priority: explicit size prop > table context size > default 'md'
  const effectiveSize = size ?? tableContext?.size ?? 'md'

  return (
    <div
      className={cn(
        'pt-4',
        withBorder && 'mt-4 border-t border-divider',
        className,
      )}
    >
      <Pagination size={effectiveSize} {...paginationProps} />
    </div>
  )
}

TablePagination.displayName = 'Table.Pagination'

// ============================================================================
// Compound Component Export
// ============================================================================

const Table = {
  Root: TableRoot,
  ScrollArea: TableScrollArea,
  Header: TableHeader,
  Body: TableBody,
  Footer: TableFooter,
  Row: TableRow,
  Head: TableHead,
  Cell: TableCell,
  Caption: TableCaption,
  Empty: TableEmpty,
  Loading: TableLoading,
  Pagination: TablePagination,
}

export default Table