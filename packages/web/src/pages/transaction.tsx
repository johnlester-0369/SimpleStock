import React, { useState, useMemo, useRef } from 'react'
import {
  ArrowLeftRight,
  Search,
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
} from 'lucide-react'
import PageHead from '@/components/common/PageHead'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Table from '@/components/ui/Table'
import Dropdown from '@/components/ui/Dropdown'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Alert from '@/components/ui/Alert'
import Pagination from '@/components/ui/Pagination'
import { cn } from '@/utils/cn.util'

// Import hooks
import { useTransactions } from '@/hooks/useTransactions'

// ============================================================================
// CONSTANTS
// ============================================================================

const ITEMS_PER_PAGE = 10

/** Date filter options */
const DATE_FILTER_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
]

// ============================================================================
// TYPES
// ============================================================================

type DateFilterValue = 'today' | 'week' | 'month'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format price as USD currency
 */
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

/**
 * Format date and time for display
 */
const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * TransactionPage Component
 *
 * Transaction history page featuring:
 * - Transaction listing with search and date filters
 * - Summary statistics
 * - Pagination
 */
const TransactionPage: React.FC = () => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<DateFilterValue>('week')
  const [currentPage, setCurrentPage] = useState(1)

  // Track previous filter values for page reset
  const prevFiltersRef = useRef({
    searchQuery,
    dateFilter,
  })

  // ============================================================================
  // HOOKS
  // ============================================================================

  // Fetch transactions with filters
  const {
    transactions,
    stats,
    loading,
    error: fetchError,
    refetch,
  } = useTransactions({
    search: searchQuery,
    period: dateFilter,
  })

  // ============================================================================
  // FILTER CHANGE DETECTION (Reset page when filters change)
  // ============================================================================

  // Check if filters changed and reset page accordingly
  // This avoids the setState-in-useEffect anti-pattern
  const filtersChanged =
    prevFiltersRef.current.searchQuery !== searchQuery ||
    prevFiltersRef.current.dateFilter !== dateFilter

  if (filtersChanged) {
    prevFiltersRef.current = { searchQuery, dateFilter }
    // Schedule page reset for next tick to avoid setState during render
    if (currentPage !== 1) {
      setTimeout(() => setCurrentPage(1), 0)
    }
  }

  // ============================================================================
  // DERIVED STATE
  // ============================================================================

  // Pagination
  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE)
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return transactions.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [transactions, currentPage])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle search input change
   */
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1) // Reset page when search changes
  }

  /**
   * Handle date filter change
   */
  const handleDateFilterChange = (value: string) => {
    setDateFilter(value as DateFilterValue)
    setCurrentPage(1) // Reset page when filter changes
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  // Show loading state during initial load
  if (loading && transactions.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <>
      <PageHead
        title="Transactions"
        description="View your sales transaction history and analytics."
      />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-headline">Transactions</h1>
            <p className="mt-1 text-muted">
              View your sales transaction history and analytics.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {fetchError && (
          <Alert
            variant="error"
            title={fetchError}
            onClose={() => refetch()}
          />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card.Root padding="md">
            <Card.Body>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted">Total Revenue</p>
                  <p className="text-xl font-bold text-headline">
                    {formatPrice(stats.totalRevenue)}
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card.Root>

          <Card.Root padding="md">
            <Card.Body>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted">Transactions</p>
                  <p className="text-xl font-bold text-headline">
                    {stats.totalTransactions}
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card.Root>

          <Card.Root padding="md">
            <Card.Body>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted">Items Sold</p>
                  <p className="text-xl font-bold text-headline">
                    {stats.totalItemsSold}
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card.Root>

          <Card.Root padding="md">
            <Card.Body>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                  <ArrowLeftRight className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted">Avg. Order</p>
                  <p className="text-xl font-bold text-headline">
                    {formatPrice(stats.averageOrderValue)}
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card.Root>
        </div>

        {/* Filters */}
        <Card.Root padding="md">
          <Card.Body>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by product name..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Period:
                </span>
                <Dropdown
                  options={DATE_FILTER_OPTIONS}
                  value={dateFilter}
                  onChange={handleDateFilterChange}
                  placeholder="Select period"
                  size="md"
                />
              </div>
            </div>
          </Card.Body>
        </Card.Root>

        {/* Transactions Table */}
        <Card.Root padding="md">
          <Card.Body className="p-0">
            {paginatedTransactions.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={ArrowLeftRight}
                  title="No transactions found"
                  description={
                    searchQuery
                      ? 'Try adjusting your search query.'
                      : 'No transactions recorded for this period.'
                  }
                />
              </div>
            ) : (
              <>
                <Table.ScrollArea>
                  <Table.Root variant="default" size="md" hoverable stickyHeader>
                    <Table.Header>
                      <Table.Row disableHover>
                        <Table.Head>Date & Time</Table.Head>
                        <Table.Head>Product</Table.Head>
                        <Table.Head align="center">Quantity</Table.Head>
                        <Table.Head align="right">Unit Price</Table.Head>
                        <Table.Head align="right">Total</Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {paginatedTransactions.map((transaction) => (
                        <Table.Row key={transaction.id}>
                          <Table.Cell>
                            <span className="text-text whitespace-nowrap">
                              {formatDateTime(transaction.createdAt)}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="font-medium text-headline">
                              {transaction.productName}
                            </span>
                          </Table.Cell>
                          <Table.Cell align="center">
                            <span className="text-text">
                              {transaction.quantity}
                            </span>
                          </Table.Cell>
                          <Table.Cell align="right">
                            <span className="text-text">
                              {formatPrice(transaction.unitPrice)}
                            </span>
                          </Table.Cell>
                          <Table.Cell align="right">
                            <span
                              className={cn(
                                'font-semibold',
                                transaction.totalAmount >= 100
                                  ? 'text-success'
                                  : 'text-headline',
                              )}
                            >
                              {formatPrice(transaction.totalAmount)}
                            </span>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Table.ScrollArea>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-4 border-t border-border">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </Card.Body>
        </Card.Root>
      </div>
    </>
  )
}

export default TransactionPage