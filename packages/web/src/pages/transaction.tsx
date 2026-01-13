import React, { useState, useMemo, useEffect } from 'react'
import PageHead from '@/components/common/PageHead'
import Table from '@/components/ui/Table'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Dropdown from '@/components/ui/Dropdown'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Alert from '@/components/ui/Alert'
import { Search, ArrowLeftRight, Filter, TrendingUp } from 'lucide-react'
import { cn } from '@/utils/cn.util'
import Button from '@/components/ui/Button'

// Import hooks
import { useTransactions } from '@/hooks/useTransactions'

/** Number of items to display per page */
const ITEMS_PER_PAGE = 8

/** Date range filter options */
const DATE_FILTER_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
]

/**
 * TransactionPage Component
 *
 * A transaction management page featuring:
 * - Sale history table with product, quantity, price, and date columns
 * - Search by product name
 * - Date range filtering
 * - Pagination
 * - Summary statistics
 * - EmptyState for no results
 * - Dynamic data from API via hooks
 */
const TransactionPage: React.FC = () => {
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Convert dateFilter to period parameter
  const period = dateFilter === 'all' ? undefined : (dateFilter as 'today' | 'week' | 'month')

  // Fetch transactions with filters
  const {
    transactions,
    stats,
    loading,
    error: fetchError,
    refetch,
  } = useTransactions({
    search: searchQuery,
    period,
  })

  /**
   * Paginated transactions for display
   */
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return transactions.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [transactions, currentPage])

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = searchQuery.trim() !== '' || dateFilter !== 'all'

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSearchQuery('')
    setDateFilter('all')
  }

  /**
   * Reset to first page when search or filters change
   */
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, dateFilter])

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
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  /**
   * Format time for display
   */
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  // Show loading state during initial load
  if (loading && transactions.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <>
      <PageHead
        title="Transactions"
        description="View your sale history and transaction records."
      />

      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-headline flex items-center gap-2">
            Transactions
          </h1>
          <p className="mt-1 text-muted">
            View your sale history and transaction records.
          </p>
        </div>

        {/* Fetch Error */}
        {fetchError && (
          <Alert
            variant="error"
            title={fetchError}
            onClose={() => refetch()}
          />
        )}

        {/* Summary Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card.Root padding="md">
            <Card.Body>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
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
                  <ArrowLeftRight className="h-5 w-5 text-success" />
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
                  <Search className="h-5 w-5 text-info" />
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
                  <TrendingUp className="h-5 w-5 text-warning" />
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

        {/* Search and Filter Bar */}
        <Card.Root padding="md">
          <div className="space-y-4">
            {/* Search Input */}
            <div className="flex-1">
              <Input
                placeholder="Search by product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-5 w-5" />}
              />
            </div>

            {/* Filter Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2 text-sm text-muted shrink-0">
                <Filter className="h-4 w-4" />
                <span>Filters:</span>
              </div>

              <div className="flex-1 max-w-xs">
                <Dropdown
                  options={DATE_FILTER_OPTIONS}
                  value={dateFilter}
                  onChange={setDateFilter}
                  placeholder="Filter by date"
                  size="md"
                  fullWidth
                />
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="md"
                  onClick={clearFilters}
                  className="shrink-0"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Results Count */}
            <div className="flex items-center gap-4 text-sm text-muted pt-2 border-t border-divider">
              <span>
                {transactions.length}{' '}
                {transactions.length === 1 ? 'transaction' : 'transactions'}
                {hasActiveFilters && ' (filtered)'}
              </span>
            </div>
          </div>
        </Card.Root>

        {/* Sales History Table or EmptyState */}
        {transactions.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title={
              hasActiveFilters ? 'No transactions found' : 'No transactions yet'
            }
            description={
              hasActiveFilters
                ? 'Try adjusting your search or filter criteria.'
                : 'Transactions will appear here when sales are made from the Products page.'
            }
            action={
              hasActiveFilters
                ? {
                    label: 'Clear Filters',
                    onClick: clearFilters,
                    icon: <Filter className="h-4 w-4" />,
                  }
                : undefined
            }
          />
        ) : (
          <>
            {/* Sales Table with Horizontal Scroll */}
            <Table.ScrollArea>
              <Table.Root variant="default" size="md" hoverable stickyHeader>
                <Table.Header>
                  <Table.Row disableHover>
                    <Table.Head>Date</Table.Head>
                    <Table.Head>Time</Table.Head>
                    <Table.Head>Product</Table.Head>
                    <Table.Head align="right">Qty</Table.Head>
                    <Table.Head align="right">Unit Price</Table.Head>
                    <Table.Head align="right">Total</Table.Head>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {paginatedTransactions.map((transaction) => (
                    <Table.Row key={transaction.id}>
                      <Table.Cell className="whitespace-nowrap">
                        <span className="text-text">
                          {formatDate(transaction.createdAt)}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap">
                        <span className="text-muted">
                          {formatTime(transaction.createdAt)}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="font-medium text-headline whitespace-nowrap">
                          {transaction.productName}
                        </span>
                      </Table.Cell>
                      <Table.Cell align="right">
                        <span className="text-text">{transaction.quantity}</span>
                      </Table.Cell>
                      <Table.Cell align="right" className="whitespace-nowrap">
                        <span className="text-muted">
                          {formatPrice(transaction.unitPrice)}
                        </span>
                      </Table.Cell>
                      <Table.Cell align="right" className="whitespace-nowrap">
                        <span
                          className={cn(
                            'font-medium',
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
            <Table.Pagination
              currentPage={currentPage}
              totalItems={transactions.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
              showInfo
              itemLabel="transactions"
            />
          </>
        )}
      </div>
    </>
  )
}

export default TransactionPage