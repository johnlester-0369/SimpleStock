import React, { useState, useMemo } from 'react'
import PageHead from '@/components/common/PageHead'
import Table from '@/components/ui/Table'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Dropdown from '@/components/ui/Dropdown'
import EmptyState from '@/components/ui/EmptyState'
import { Search, ArrowLeftRight, Filter, TrendingUp } from 'lucide-react'
import { cn } from '@/utils/cn.util'
import Button from '@/components/ui/Button'

/**
 * Sale interface defining the structure of a sale transaction
 */
interface Sale {
  id: string
  productName: string
  quantity: number
  unitPrice: number
  totalAmount: number
  date: Date
}

/**
 * Initial mock data for sales history
 * Represents recent sale transactions with various products
 */
const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-001',
    productName: 'Wireless Mouse',
    quantity: 2,
    unitPrice: 29.99,
    totalAmount: 59.98,
    date: new Date('2025-01-15T10:30:00'),
  },
  {
    id: 'sale-002',
    productName: 'USB-C Cable',
    quantity: 5,
    unitPrice: 12.99,
    totalAmount: 64.95,
    date: new Date('2025-01-15T11:45:00'),
  },
  {
    id: 'sale-003',
    productName: 'Mechanical Keyboard',
    quantity: 1,
    unitPrice: 89.99,
    totalAmount: 89.99,
    date: new Date('2025-01-14T14:20:00'),
  },
  {
    id: 'sale-004',
    productName: 'Monitor Stand',
    quantity: 3,
    unitPrice: 49.99,
    totalAmount: 149.97,
    date: new Date('2025-01-14T09:15:00'),
  },
  {
    id: 'sale-005',
    productName: 'Webcam HD',
    quantity: 2,
    unitPrice: 59.99,
    totalAmount: 119.98,
    date: new Date('2025-01-13T16:30:00'),
  },
  {
    id: 'sale-006',
    productName: 'USB Hub 7-Port',
    quantity: 4,
    unitPrice: 24.99,
    totalAmount: 99.96,
    date: new Date('2025-01-13T13:00:00'),
  },
  {
    id: 'sale-007',
    productName: 'Laptop Stand Aluminum',
    quantity: 1,
    unitPrice: 39.99,
    totalAmount: 39.99,
    date: new Date('2025-01-12T11:20:00'),
  },
  {
    id: 'sale-008',
    productName: 'LED Desk Lamp',
    quantity: 2,
    unitPrice: 34.99,
    totalAmount: 69.98,
    date: new Date('2025-01-12T10:00:00'),
  },
  {
    id: 'sale-009',
    productName: 'Mousepad XL Gaming',
    quantity: 3,
    unitPrice: 19.99,
    totalAmount: 59.97,
    date: new Date('2025-01-11T15:45:00'),
  },
  {
    id: 'sale-010',
    productName: 'Wireless Charger Pad',
    quantity: 2,
    unitPrice: 35.99,
    totalAmount: 71.98,
    date: new Date('2025-01-11T12:30:00'),
  },
  {
    id: 'sale-011',
    productName: 'Bluetooth Speaker Mini',
    quantity: 1,
    unitPrice: 55.99,
    totalAmount: 55.99,
    date: new Date('2025-01-10T14:15:00'),
  },
  {
    id: 'sale-012',
    productName: 'Screen Cleaner Kit',
    quantity: 6,
    unitPrice: 8.99,
    totalAmount: 53.94,
    date: new Date('2025-01-10T09:45:00'),
  },
  {
    id: 'sale-013',
    productName: 'Headphone Stand Wood',
    quantity: 1,
    unitPrice: 22.99,
    totalAmount: 22.99,
    date: new Date('2025-01-09T16:00:00'),
  },
  {
    id: 'sale-014',
    productName: 'Ergonomic Chair Mat',
    quantity: 2,
    unitPrice: 45.99,
    totalAmount: 91.98,
    date: new Date('2025-01-09T11:30:00'),
  },
  {
    id: 'sale-015',
    productName: 'Wireless Mouse',
    quantity: 4,
    unitPrice: 29.99,
    totalAmount: 119.96,
    date: new Date('2025-01-08T13:20:00'),
  },
]

/** Number of items to display per page */
const ITEMS_PER_PAGE = 8

/** Date range filter options */
const DATE_FILTER_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
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
 */
const TransactionPage: React.FC = () => {
  // Sales state
  const [sales] = useState<Sale[]>(INITIAL_SALES)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  /**
   * Filter sales based on search query and date range
   */
  const filteredSales = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    return sales.filter((sale) => {
      // Search filter (by product name)
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query || sale.productName.toLowerCase().includes(query)

      // Date range filter
      let matchesDateFilter = true
      if (dateFilter === 'today') {
        const saleDate = new Date(
          sale.date.getFullYear(),
          sale.date.getMonth(),
          sale.date.getDate(),
        )
        matchesDateFilter = saleDate.getTime() === today.getTime()
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        matchesDateFilter = sale.date >= weekAgo
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(today)
        monthAgo.setDate(monthAgo.getDate() - 30)
        matchesDateFilter = sale.date >= monthAgo
      }

      return matchesSearch && matchesDateFilter
    })
  }, [sales, searchQuery, dateFilter])

  /**
   * Sort sales by date (most recent first)
   */
  const sortedSales = useMemo(() => {
    return [...filteredSales].sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    )
  }, [filteredSales])

  /**
   * Paginated sales for display
   */
  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedSales.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [sortedSales, currentPage])

  /**
   * Calculate summary statistics
   */
  const summaryStats = useMemo(() => {
    const totalRevenue = filteredSales.reduce(
      (sum, sale) => sum + sale.totalAmount,
      0,
    )
    const totalItems = filteredSales.reduce(
      (sum, sale) => sum + sale.quantity,
      0,
    )
    const averageOrder =
      filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0

    return {
      totalRevenue,
      totalItems,
      totalTransactions: filteredSales.length,
      averageOrder,
    }
  }, [filteredSales])

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
  React.useEffect(() => {
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
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  /**
   * Format time for display
   */
  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
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
                    {formatPrice(summaryStats.totalRevenue)}
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
                    {summaryStats.totalTransactions}
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
                    {summaryStats.totalItems}
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
                    {formatPrice(summaryStats.averageOrder)}
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
                {filteredSales.length}{' '}
                {filteredSales.length === 1 ? 'transaction' : 'transactions'}
                {hasActiveFilters && ' (filtered)'}
              </span>
            </div>
          </div>
        </Card.Root>

        {/* Sales History Table or EmptyState */}
        {filteredSales.length === 0 ? (
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
                  {paginatedSales.map((sale) => (
                    <Table.Row key={sale.id}>
                      <Table.Cell className="whitespace-nowrap">
                        <span className="text-text">
                          {formatDate(sale.date)}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap">
                        <span className="text-muted">
                          {formatTime(sale.date)}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="font-medium text-headline whitespace-nowrap">
                          {sale.productName}
                        </span>
                      </Table.Cell>
                      <Table.Cell align="right">
                        <span className="text-text">{sale.quantity}</span>
                      </Table.Cell>
                      <Table.Cell align="right" className="whitespace-nowrap">
                        <span className="text-muted">
                          {formatPrice(sale.unitPrice)}
                        </span>
                      </Table.Cell>
                      <Table.Cell align="right" className="whitespace-nowrap">
                        <span
                          className={cn(
                            'font-medium',
                            sale.totalAmount >= 100
                              ? 'text-success'
                              : 'text-headline',
                          )}
                        >
                          {formatPrice(sale.totalAmount)}
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
              totalItems={filteredSales.length}
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
