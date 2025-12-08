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

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

/**
 * Product interface for inventory data
 */
interface Product {
  id: string
  name: string
  price: number
  stockQuantity: number
  supplier: string
}

/**
 * Sale interface for transaction data
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
 * Generate a date relative to today
 * @param daysAgo - Number of days before today (0 = today)
 * @param hour - Hour of the day (0-23)
 * @param minute - Minute (0-59)
 * @returns Date object set to the specified relative time
 */
const getRelativeDate = (
  daysAgo: number,
  hour: number,
  minute: number,
): Date => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hour, minute, 0, 0)
  return date
}

/**
 * Mock product inventory data
 * Matches products from products.tsx for consistency
 */
const PRODUCTS_DATA: Product[] = [
  {
    id: '1',
    name: 'Wireless Mouse',
    price: 29.99,
    stockQuantity: 45,
    supplier: 'TechCorp',
  },
  {
    id: '2',
    name: 'USB-C Cable',
    price: 12.99,
    stockQuantity: 3,
    supplier: 'CableMax',
  },
  {
    id: '3',
    name: 'Mechanical Keyboard',
    price: 89.99,
    stockQuantity: 12,
    supplier: 'TechCorp',
  },
  {
    id: '4',
    name: 'Monitor Stand',
    price: 49.99,
    stockQuantity: 2,
    supplier: 'OfficeGear',
  },
  {
    id: '5',
    name: 'Webcam HD',
    price: 59.99,
    stockQuantity: 28,
    supplier: 'TechCorp',
  },
  {
    id: '6',
    name: 'USB Hub 7-Port',
    price: 24.99,
    stockQuantity: 4,
    supplier: 'CableMax',
  },
  {
    id: '7',
    name: 'Laptop Stand Aluminum',
    price: 39.99,
    stockQuantity: 15,
    supplier: 'OfficeGear',
  },
  {
    id: '8',
    name: 'LED Desk Lamp',
    price: 34.99,
    stockQuantity: 8,
    supplier: 'LightWorks',
  },
  {
    id: '9',
    name: 'Mousepad XL Gaming',
    price: 19.99,
    stockQuantity: 52,
    supplier: 'GamerZone',
  },
  {
    id: '10',
    name: 'Headphone Stand Wood',
    price: 22.99,
    stockQuantity: 1,
    supplier: 'OfficeGear',
  },
  {
    id: '11',
    name: 'Wireless Charger Pad',
    price: 35.99,
    stockQuantity: 33,
    supplier: 'TechCorp',
  },
  {
    id: '12',
    name: 'Cable Management Kit',
    price: 15.99,
    stockQuantity: 0,
    supplier: 'CableMax',
  },
  {
    id: '13',
    name: 'Ergonomic Chair Mat',
    price: 45.99,
    stockQuantity: 7,
    supplier: 'OfficeGear',
  },
  {
    id: '14',
    name: 'Bluetooth Speaker Mini',
    price: 55.99,
    stockQuantity: 19,
    supplier: 'SoundMax',
  },
  {
    id: '15',
    name: 'Screen Cleaner Kit',
    price: 8.99,
    stockQuantity: 64,
    supplier: 'CleanTech',
  },
]

/**
 * Mock recent sales data with relative dates
 */
const RECENT_SALES: Sale[] = [
  {
    id: 'sale-001',
    productName: 'Wireless Mouse',
    quantity: 2,
    unitPrice: 29.99,
    totalAmount: 59.98,
    date: getRelativeDate(0, 10, 30),
  },
  {
    id: 'sale-002',
    productName: 'USB-C Cable',
    quantity: 5,
    unitPrice: 12.99,
    totalAmount: 64.95,
    date: getRelativeDate(0, 14, 45),
  },
  {
    id: 'sale-003',
    productName: 'Mechanical Keyboard',
    quantity: 1,
    unitPrice: 89.99,
    totalAmount: 89.99,
    date: getRelativeDate(1, 9, 20),
  },
  {
    id: 'sale-004',
    productName: 'Monitor Stand',
    quantity: 3,
    unitPrice: 49.99,
    totalAmount: 149.97,
    date: getRelativeDate(1, 15, 15),
  },
  {
    id: 'sale-005',
    productName: 'Webcam HD',
    quantity: 2,
    unitPrice: 59.99,
    totalAmount: 119.98,
    date: getRelativeDate(2, 11, 30),
  },
]

/**
 * Weekly sales data for chart (last 7 days)
 */
const WEEKLY_SALES_DATA = [
  { day: 'Mon', amount: 342.5 },
  { day: 'Tue', amount: 489.25 },
  { day: 'Wed', amount: 275.8 },
  { day: 'Thu', amount: 612.0 },
  { day: 'Fri', amount: 528.45 },
  { day: 'Sat', amount: 395.6 },
  { day: 'Sun', amount: 184.87 },
]

/** Stock quantity threshold for low stock warning */
const LOW_STOCK_THRESHOLD = 5

/** Number of recent transactions to display */
const RECENT_TRANSACTIONS_LIMIT = 5

/** Number of low stock items to display */
const LOW_STOCK_DISPLAY_LIMIT = 5

/**
 * DashboardPage Component
 *
 * A comprehensive dashboard featuring:
 * - Key metric summary cards (Products, Low Stock, Revenue, Transactions)
 * - Weekly sales chart (Chart.js bar chart)
 * - Low stock alerts table
 * - Recent transactions table
 * - Quick navigation links
 */
const DashboardPage: React.FC = () => {
  /**
   * Calculate summary statistics from product data
   */
  const productStats = useMemo(() => {
    const totalProducts = PRODUCTS_DATA.length
    const totalInventoryValue = PRODUCTS_DATA.reduce(
      (sum, product) => sum + product.price * product.stockQuantity,
      0,
    )
    const lowStockProducts = PRODUCTS_DATA.filter(
      (p) => p.stockQuantity < LOW_STOCK_THRESHOLD,
    )
    const outOfStockCount = PRODUCTS_DATA.filter(
      (p) => p.stockQuantity === 0,
    ).length
    const totalUnits = PRODUCTS_DATA.reduce(
      (sum, product) => sum + product.stockQuantity,
      0,
    )

    return {
      totalProducts,
      totalInventoryValue,
      lowStockCount: lowStockProducts.length,
      outOfStockCount,
      totalUnits,
      lowStockProducts: lowStockProducts
        .sort((a, b) => a.stockQuantity - b.stockQuantity)
        .slice(0, LOW_STOCK_DISPLAY_LIMIT),
    }
  }, [])

  /**
   * Calculate sales statistics
   */
  const salesStats = useMemo(() => {
    const weeklyTotal = WEEKLY_SALES_DATA.reduce(
      (sum, day) => sum + day.amount,
      0,
    )
    const todaysSales = RECENT_SALES.filter((sale) => {
      const today = new Date()
      return (
        sale.date.getDate() === today.getDate() &&
        sale.date.getMonth() === today.getMonth() &&
        sale.date.getFullYear() === today.getFullYear()
      )
    })
    const todaysRevenue = todaysSales.reduce(
      (sum, sale) => sum + sale.totalAmount,
      0,
    )
    const todaysTransactions = todaysSales.length

    return {
      weeklyTotal,
      todaysRevenue,
      todaysTransactions,
      recentTransactions: RECENT_SALES.slice(0, RECENT_TRANSACTIONS_LIMIT),
    }
  }, [])

  /**
   * Chart data configuration
   */
  const chartData: ChartData<'bar'> = useMemo(
    () => ({
      labels: WEEKLY_SALES_DATA.map((d) => d.day),
      datasets: [
        {
          label: 'Daily Sales ($)',
          data: WEEKLY_SALES_DATA.map((d) => d.amount),
          backgroundColor: 'rgba(56, 112, 230, 0.8)',
          borderColor: 'rgb(56, 112, 230)',
          borderWidth: 1,
          borderRadius: 6,
          barThickness: 32,
        },
      ],
    }),
    [],
  )

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
              return `$${value.toFixed(2)}`
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
            callback: (value) => `$${value}`,
          },
        },
      },
    }),
    [],
  )

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
                    {formatPrice(salesStats.todaysRevenue)}
                  </p>
                  <p className="text-xs text-muted">
                    {salesStats.todaysTransactions} transactions
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
                    {formatPrice(salesStats.weeklyTotal)}
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
                <Link to="/report">
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
                  <Link to="/products">
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
                <Link to="/products?filter=low-stock">
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
              {productStats.lowStockProducts.length === 0 ? (
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
                      {productStats.lowStockProducts.map((product) => (
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
                <Link to="/transaction">
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
              {salesStats.recentTransactions.length === 0 ? (
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
                      {salesStats.recentTransactions.map((sale) => (
                        <Table.Row key={sale.id}>
                          <Table.Cell>
                            <div>
                              <span className="font-medium text-headline text-sm block whitespace-nowrap">
                                {sale.productName}
                              </span>
                              <span className="text-xs text-muted">
                                {formatDate(sale.date)}
                              </span>
                            </div>
                          </Table.Cell>
                          <Table.Cell align="center">
                            <span className="text-sm text-text">
                              {sale.quantity}
                            </span>
                          </Table.Cell>
                          <Table.Cell align="right">
                            <span className="font-medium text-success text-sm whitespace-nowrap">
                              {formatPrice(sale.totalAmount)}
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
              <Link to="/products" className="block">
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

              <Link to="/transaction" className="block">
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

              <Link to="/report" className="block">
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

              <Link to="/settings/supplier" className="block">
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
