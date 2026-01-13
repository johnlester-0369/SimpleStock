import React, { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import PageHead from '@/components/common/PageHead'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { cn } from '@/utils/cn.util'
import {
  Package,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  ArrowRight,
  Truck,
  BarChart3,
} from 'lucide-react'
import { Link } from 'react-router-dom'

// Import hooks for dynamic data
import { useProducts } from '@/hooks/useProducts'
import { useTransactions } from '@/hooks/useTransactions'

// Import types
import type { Product } from '@/services/product.service'
import type { Transaction } from '@/services/transaction.service'

// Import route constants
import {
  ROUTE_PRODUCTS,
  ROUTE_TRANSACTION,
  ROUTE_REPORT,
  ROUTE_SETTINGS_SUPPLIER,
  ROUTE_PRODUCTS_LOW_STOCK,
} from '@/constants/routes.constants'

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

/** Stock quantity threshold for low stock warning */
const LOW_STOCK_THRESHOLD = 5

/** Number of recent transactions to display */
const RECENT_TRANSACTIONS_LIMIT = 5

/** Number of low stock items to display */
const LOW_STOCK_DISPLAY_LIMIT = 5

/** Days of week for chart labels */
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * Get the start of the week (Sunday) for a given date
 * @param date - Reference date
 * @returns Date object set to start of week (Sunday 00:00:00)
 */
const getWeekStart = (date: Date): Date => {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * DashboardPage Component
 *
 * A comprehensive dashboard featuring:
 * - Key metric summary cards (Products, Low Stock, Revenue, Transactions)
 * - Weekly sales chart (Chart.js bar chart) with dynamic API data
 * - Low stock alerts table from real inventory
 * - Recent transactions table from API
 * - Quick navigation links
 *
 * Uses useProducts and useTransactions hooks for dynamic data fetching.
 */
const DashboardPage: React.FC = () => {
  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  /**
   * Fetch products and inventory statistics
   */
  const {
    products,
    stats: productApiStats,
    loading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useProducts()

  /**
   * Fetch transactions for this week (for chart and recent transactions)
   */
  const {
    transactions,
    stats: transactionApiStats,
    dailySales,
    loading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useTransactions({ period: 'week' })

  // Combined loading state
  const isLoading = productsLoading || transactionsLoading

  // Combined error state
  const error = productsError || transactionsError

  // ============================================================================
  // DERIVED DATA - PRODUCTS
  // ============================================================================

  /**
   * Calculate low stock products for alert table
   * Filters products below threshold and sorts by stock quantity ascending
   */
  const lowStockProducts = useMemo((): Product[] => {
    return products
      .filter((p) => p.stockQuantity < LOW_STOCK_THRESHOLD)
      .sort((a, b) => a.stockQuantity - b.stockQuantity)
      .slice(0, LOW_STOCK_DISPLAY_LIMIT)
  }, [products])

  /**
   * Product statistics for dashboard cards
   */
  const productStats = useMemo(() => {
    return {
      totalProducts: productApiStats.totalProducts,
      totalUnits: productApiStats.totalUnits,
      totalInventoryValue: productApiStats.totalValue,
      lowStockCount: productApiStats.lowStockCount,
      outOfStockCount: productApiStats.outOfStockCount,
    }
  }, [productApiStats])

  // ============================================================================
  // DERIVED DATA - TRANSACTIONS
  // ============================================================================

  /**
   * Calculate today's statistics by filtering transactions
   */
  const todaysStats = useMemo(() => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    const todaysTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.createdAt).toISOString().split('T')[0]
      return transactionDate === todayStr
    })

    const todaysRevenue = todaysTransactions.reduce(
      (sum, t) => sum + t.totalAmount,
      0,
    )

    return {
      revenue: todaysRevenue,
      transactionCount: todaysTransactions.length,
    }
  }, [transactions])

  /**
   * Weekly sales total from API stats
   */
  const weeklyTotal = transactionApiStats.totalRevenue

  /**
   * Recent transactions for display table
   */
  const recentTransactions = useMemo((): Transaction[] => {
    return transactions.slice(0, RECENT_TRANSACTIONS_LIMIT)
  }, [transactions])

  // ============================================================================
  // CHART DATA
  // ============================================================================

  /**
   * Chart data configuration - builds from dailySales API response
   * Creates a bar for each day of the current week
   */
  const chartData: ChartData<'bar'> = useMemo(() => {
    const now = new Date()
    const weekStart = getWeekStart(now)
    const dailyData: number[] = []
    const labels: string[] = []

    // Build data for each day of the week
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      const dayName = DAYS_OF_WEEK[date.getDay()]

      labels.push(`${dayName} ${date.getDate()}`)

      // Find matching daily sales data or default to 0
      const daySalesData = dailySales.find((d) => d.date === dateStr)
      dailyData.push(daySalesData?.totalAmount ?? 0)
    }

    return {
      labels,
      datasets: [
        {
          label: 'Daily Sales ($)',
          data: dailyData,
          backgroundColor: 'rgba(56, 112, 230, 0.8)',
          borderColor: 'rgb(56, 112, 230)',
          borderWidth: 1,
          borderRadius: 6,
          barThickness: 32,
        },
      ],
    }
  }, [dailySales])

  /**
   * Chart options configuration
   */
  const chartOptions: ChartOptions<'bar'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(10, 10, 10, 0.9)',
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: (context) => {
              const value = context.parsed.y ?? 0
              return `${value.toFixed(2)}`
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#737373',
            font: {
              size: 12,
            },
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(179, 182, 189, 0.3)',
          },
          ticks: {
            color: '#737373',
            font: {
              size: 12,
            },
            callback: (value) => `${value}`,
          },
        },
      },
    }),
    [],
  )

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Format price as USD currency
   * @param price - Number to format
   * @returns Formatted currency string
   */
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  /**
   * Format date for display in transactions table
   * Shows "Today" for current date, otherwise shows formatted date
   * @param dateString - ISO date string
   * @returns Formatted date string
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()

    if (isToday) {
      return `Today, ${date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })}`
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  /**
   * Handle retry action for errors
   */
  const handleRetry = () => {
    refetchProducts()
    refetchTransactions()
  }

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return <LoadingSpinner />
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <PageHead
        title="Dashboard"
        description="Overview of your inventory and business metrics."
      />

      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-headline">Dashboard</h1>
          <p className="mt-1 text-muted">
            Welcome back! Here's an overview of your inventory.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            variant="error"
            title="Failed to load dashboard data"
            message={error}
            onClose={handleRetry}
          />
        )}

        {/* Summary Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Products */}
          <Card.Root padding="md">
            <Card.Body>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted">Total Products</p>
                  <p className="text-2xl font-bold text-headline">
                    {productStats.totalProducts}
                  </p>
                  <p className="text-xs text-muted">
                    {productStats.totalUnits} units in stock
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card.Root>

          {/* Low Stock Alert */}
          <Card.Root padding="md">
            <Card.Body>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted">Low Stock Alert</p>
                  <p className="text-2xl font-bold text-headline">
                    {productStats.lowStockCount}
                  </p>
                  <p className="text-xs text-warning">
                    {productStats.outOfStockCount} out of stock
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card.Root>

          {/* Today's Revenue */}
          <Card.Root padding="md">
            <Card.Body>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted">Today's Revenue</p>
                  <p className="text-2xl font-bold text-headline">
                    {formatPrice(todaysStats.revenue)}
                  </p>
                  <p className="text-xs text-muted">
                    {todaysStats.transactionCount} transactions
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card.Root>

          {/* Weekly Sales */}
          <Card.Root padding="md">
            <Card.Body>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted">Weekly Sales</p>
                  <p className="text-2xl font-bold text-headline">
                    {formatPrice(weeklyTotal)}
                  </p>
                  <p className="text-xs text-muted">Last 7 days</p>
                </div>
              </div>
            </Card.Body>
          </Card.Root>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Chart - Takes 2 columns */}
          <Card.Root padding="md" className="lg:col-span-2">
            <Card.Header>
              <div className="flex items-center justify-between">
                <Card.Title as="h3" className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-muted" />
                  Weekly Sales Overview
                </Card.Title>
                <Link to={ROUTE_REPORT}>
                  <Button
                    variant="ghost"
                    size="sm"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    View Report
                  </Button>
                </Link>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="h-64">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card.Root>

          {/* Inventory Value Card */}
          <Card.Root padding="md">
            <Card.Header>
              <Card.Title as="h3" className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted" />
                Inventory Summary
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                {/* Total Inventory Value */}
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm text-muted">Total Inventory Value</p>
                  <p className="text-3xl font-bold text-primary mt-1">
                    {formatPrice(productStats.totalInventoryValue)}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-divider">
                    <span className="text-sm text-muted">Total Products</span>
                    <span className="font-medium text-headline">
                      {productStats.totalProducts}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-divider">
                    <span className="text-sm text-muted">Total Units</span>
                    <span className="font-medium text-headline">
                      {productStats.totalUnits}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-divider">
                    <span className="text-sm text-muted">Low Stock Items</span>
                    <span className="font-medium text-warning">
                      {productStats.lowStockCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted">Out of Stock</span>
                    <span className="font-medium text-error">
                      {productStats.outOfStockCount}
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-2">
                  <Link to={ROUTE_PRODUCTS}>
                    <Button
                      variant="secondary"
                      size="md"
                      className="w-full"
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Manage Products
                    </Button>
                  </Link>
                </div>
              </div>
            </Card.Body>
          </Card.Root>
        </div>

        {/* Bottom Section - Two Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alerts */}
          <Card.Root padding="md">
            <Card.Header>
              <div className="flex items-center justify-between">
                <Card.Title as="h3" className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Low Stock Alerts
                </Card.Title>
                <Link to={ROUTE_PRODUCTS_LOW_STOCK}>
                  <Button
                    variant="ghost"
                    size="sm"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    View All
                  </Button>
                </Link>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {lowStockProducts.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                    <Package className="h-6 w-6 text-success" />
                  </div>
                  <p className="text-sm text-muted">
                    All products are well stocked!
                  </p>
                </div>
              ) : (
                <Table.ScrollArea>
                  <Table.Root variant="default" size="sm" hoverable>
                    <Table.Header>
                      <Table.Row disableHover>
                        <Table.Head>Product</Table.Head>
                        <Table.Head align="center">Stock</Table.Head>
                        <Table.Head>Supplier</Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {lowStockProducts.map((product) => (
                        <Table.Row
                          key={product.id}
                          className={cn(
                            product.stockQuantity === 0 && 'bg-error/5',
                          )}
                        >
                          <Table.Cell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-headline text-sm whitespace-nowrap">
                                {product.name}
                              </span>
                              {product.stockQuantity === 0 && (
                                <span className="px-1.5 py-0.5 text-xs font-medium bg-error/10 text-error rounded">
                                  Out
                                </span>
                              )}
                            </div>
                          </Table.Cell>
                          <Table.Cell align="center">
                            <span
                              className={cn(
                                'font-medium',
                                product.stockQuantity === 0
                                  ? 'text-error'
                                  : 'text-warning',
                              )}
                            >
                              {product.stockQuantity}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="text-sm text-muted whitespace-nowrap">
                              {product.supplier}
                            </span>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Table.ScrollArea>
              )}
            </Card.Body>
          </Card.Root>

          {/* Recent Transactions */}
          <Card.Root padding="md">
            <Card.Header>
              <div className="flex items-center justify-between">
                <Card.Title as="h3" className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-muted" />
                  Recent Transactions
                </Card.Title>
                <Link to={ROUTE_TRANSACTION}>
                  <Button
                    variant="ghost"
                    size="sm"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    View All
                  </Button>
                </Link>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {recentTransactions.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted/10 flex items-center justify-center mx-auto mb-3">
                    <ShoppingCart className="h-6 w-6 text-muted" />
                  </div>
                  <p className="text-sm text-muted">No recent transactions</p>
                </div>
              ) : (
                <Table.ScrollArea>
                  <Table.Root variant="default" size="sm" hoverable>
                    <Table.Header>
                      <Table.Row disableHover>
                        <Table.Head>Product</Table.Head>
                        <Table.Head align="center">Qty</Table.Head>
                        <Table.Head align="right">Amount</Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {recentTransactions.map((transaction) => (
                        <Table.Row key={transaction.id}>
                          <Table.Cell>
                            <div>
                              <span className="font-medium text-headline text-sm block whitespace-nowrap">
                                {transaction.productName}
                              </span>
                              <span className="text-xs text-muted">
                                {formatDate(transaction.createdAt)}
                              </span>
                            </div>
                          </Table.Cell>
                          <Table.Cell align="center">
                            <span className="text-sm text-text">
                              {transaction.quantity}
                            </span>
                          </Table.Cell>
                          <Table.Cell align="right">
                            <span className="font-medium text-success text-sm whitespace-nowrap">
                              {formatPrice(transaction.totalAmount)}
                            </span>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Table.ScrollArea>
              )}
            </Card.Body>
          </Card.Root>
        </div>

        {/* Quick Actions Row */}
        <Card.Root padding="md">
          <Card.Header>
            <Card.Title as="h3">Quick Actions</Card.Title>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to={ROUTE_PRODUCTS} className="block">
                <div className="p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-headline">Products</p>
                      <p className="text-xs text-muted">Manage inventory</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link to={ROUTE_TRANSACTION} className="block">
                <div className="p-4 rounded-lg border border-border hover:border-success hover:bg-success/5 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
                      <ShoppingCart className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium text-headline">Transactions</p>
                      <p className="text-xs text-muted">View sales history</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link to={ROUTE_REPORT} className="block">
                <div className="p-4 rounded-lg border border-border hover:border-info hover:bg-info/5 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center group-hover:bg-info/20 transition-colors">
                      <BarChart3 className="h-5 w-5 text-info" />
                    </div>
                    <div>
                      <p className="font-medium text-headline">Reports</p>
                      <p className="text-xs text-muted">Sales analytics</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link to={ROUTE_SETTINGS_SUPPLIER} className="block">
                <div className="p-4 rounded-lg border border-border hover:border-warning hover:bg-warning/5 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center group-hover:bg-warning/20 transition-colors">
                      <Truck className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium text-headline">Suppliers</p>
                      <p className="text-xs text-muted">Manage vendors</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </Card.Body>
        </Card.Root>
      </div>
    </>
  )
}

export default DashboardPage