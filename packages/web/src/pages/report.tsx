import React, { useState, useMemo } from 'react'
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
import Dropdown from '@/components/ui/Dropdown'
import EmptyState from '@/components/ui/EmptyState'
import {
  BarChart3,
  TrendingUp,
  Calendar,
  DollarSign,
  Package,
} from 'lucide-react'
import { cn } from '@/utils/cn.util'

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

/**
 * Sale interface for individual transactions
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
 * Daily sales aggregation interface
 */
interface DailySales {
  date: Date
  dateKey: string
  totalAmount: number
  transactionCount: number
  itemsSold: number
}

/**
 * Weekly sales aggregation interface
 */
interface WeeklySales {
  weekLabel: string
  weekStart: Date
  weekEnd: Date
  totalAmount: number
  transactionCount: number
  itemsSold: number
}

/**
 * Generate a date relative to today
 * @param daysAgo - Number of days before today (0 = today)
 * @param hour - Hour of the day (0-23)
 * @param minute - Minute (0-59)
 * @returns Date object set to the specified relative time
 */
const getRelativeDate = (daysAgo: number, hour: number, minute: number): Date => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hour, minute, 0, 0)
  return date
}

/**
 * Mock sales data with dates relative to today
 * This ensures data always displays regardless of when the app is accessed
 * 
 * Data distribution:
 * - Days 0-6: Current week (for "This Week" filter)
 * - Days 7-13: Previous week
 * - Days 14-29: Earlier this month (for "This Month" filter)
 * - Days 30+: Previous month (for chart trends)
 */
const SALES_DATA: Sale[] = [
  // Today (Day 0)
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
  // Yesterday (Day 1)
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
  // Day 2
  {
    id: 'sale-005',
    productName: 'Webcam HD',
    quantity: 2,
    unitPrice: 59.99,
    totalAmount: 119.98,
    date: getRelativeDate(2, 11, 30),
  },
  {
    id: 'sale-006',
    productName: 'USB Hub 7-Port',
    quantity: 4,
    unitPrice: 24.99,
    totalAmount: 99.96,
    date: getRelativeDate(2, 16, 0),
  },
  // Day 3
  {
    id: 'sale-007',
    productName: 'Laptop Stand Aluminum',
    quantity: 1,
    unitPrice: 39.99,
    totalAmount: 39.99,
    date: getRelativeDate(3, 10, 20),
  },
  {
    id: 'sale-008',
    productName: 'LED Desk Lamp',
    quantity: 2,
    unitPrice: 34.99,
    totalAmount: 69.98,
    date: getRelativeDate(3, 13, 0),
  },
  // Day 4
  {
    id: 'sale-009',
    productName: 'Mousepad XL Gaming',
    quantity: 3,
    unitPrice: 19.99,
    totalAmount: 59.97,
    date: getRelativeDate(4, 9, 45),
  },
  {
    id: 'sale-010',
    productName: 'Wireless Charger Pad',
    quantity: 2,
    unitPrice: 35.99,
    totalAmount: 71.98,
    date: getRelativeDate(4, 14, 30),
  },
  // Day 5
  {
    id: 'sale-011',
    productName: 'Bluetooth Speaker Mini',
    quantity: 1,
    unitPrice: 55.99,
    totalAmount: 55.99,
    date: getRelativeDate(5, 10, 15),
  },
  {
    id: 'sale-012',
    productName: 'Screen Cleaner Kit',
    quantity: 6,
    unitPrice: 8.99,
    totalAmount: 53.94,
    date: getRelativeDate(5, 15, 45),
  },
  // Day 6
  {
    id: 'sale-013',
    productName: 'Headphone Stand Wood',
    quantity: 1,
    unitPrice: 22.99,
    totalAmount: 22.99,
    date: getRelativeDate(6, 11, 0),
  },
  // Day 7 (Start of previous week)
  {
    id: 'sale-014',
    productName: 'Ergonomic Chair Mat',
    quantity: 2,
    unitPrice: 45.99,
    totalAmount: 91.98,
    date: getRelativeDate(7, 14, 30),
  },
  {
    id: 'sale-015',
    productName: 'Wireless Mouse',
    quantity: 4,
    unitPrice: 29.99,
    totalAmount: 119.96,
    date: getRelativeDate(7, 9, 20),
  },
  // Day 8
  {
    id: 'sale-016',
    productName: 'USB-C Cable',
    quantity: 8,
    unitPrice: 12.99,
    totalAmount: 103.92,
    date: getRelativeDate(8, 11, 45),
  },
  {
    id: 'sale-017',
    productName: 'Mechanical Keyboard',
    quantity: 2,
    unitPrice: 89.99,
    totalAmount: 179.98,
    date: getRelativeDate(8, 16, 20),
  },
  // Day 9
  {
    id: 'sale-018',
    productName: 'Monitor Stand',
    quantity: 1,
    unitPrice: 49.99,
    totalAmount: 49.99,
    date: getRelativeDate(9, 10, 0),
  },
  {
    id: 'sale-019',
    productName: 'Webcam HD',
    quantity: 3,
    unitPrice: 59.99,
    totalAmount: 179.97,
    date: getRelativeDate(9, 14, 15),
  },
  // Day 10
  {
    id: 'sale-020',
    productName: 'USB Hub 7-Port',
    quantity: 2,
    unitPrice: 24.99,
    totalAmount: 49.98,
    date: getRelativeDate(10, 9, 30),
  },
  {
    id: 'sale-021',
    productName: 'Laptop Stand Aluminum',
    quantity: 2,
    unitPrice: 39.99,
    totalAmount: 79.98,
    date: getRelativeDate(10, 13, 45),
  },
  // Day 11
  {
    id: 'sale-022',
    productName: 'LED Desk Lamp',
    quantity: 1,
    unitPrice: 34.99,
    totalAmount: 34.99,
    date: getRelativeDate(11, 11, 20),
  },
  {
    id: 'sale-023',
    productName: 'Mousepad XL Gaming',
    quantity: 5,
    unitPrice: 19.99,
    totalAmount: 99.95,
    date: getRelativeDate(11, 15, 0),
  },
  // Day 12
  {
    id: 'sale-024',
    productName: 'Wireless Charger Pad',
    quantity: 1,
    unitPrice: 35.99,
    totalAmount: 35.99,
    date: getRelativeDate(12, 10, 30),
  },
  {
    id: 'sale-025',
    productName: 'Bluetooth Speaker Mini',
    quantity: 2,
    unitPrice: 55.99,
    totalAmount: 111.98,
    date: getRelativeDate(12, 14, 45),
  },
  // Day 13
  {
    id: 'sale-026',
    productName: 'Screen Cleaner Kit',
    quantity: 4,
    unitPrice: 8.99,
    totalAmount: 35.96,
    date: getRelativeDate(13, 9, 15),
  },
  // Day 14 (Two weeks ago)
  {
    id: 'sale-027',
    productName: 'Headphone Stand Wood',
    quantity: 3,
    unitPrice: 22.99,
    totalAmount: 68.97,
    date: getRelativeDate(14, 11, 30),
  },
  {
    id: 'sale-028',
    productName: 'Ergonomic Chair Mat',
    quantity: 1,
    unitPrice: 45.99,
    totalAmount: 45.99,
    date: getRelativeDate(14, 15, 20),
  },
  // Day 15
  {
    id: 'sale-029',
    productName: 'Wireless Mouse',
    quantity: 3,
    unitPrice: 29.99,
    totalAmount: 89.97,
    date: getRelativeDate(15, 10, 0),
  },
  {
    id: 'sale-030',
    productName: 'USB-C Cable',
    quantity: 6,
    unitPrice: 12.99,
    totalAmount: 77.94,
    date: getRelativeDate(15, 14, 30),
  },
  // Day 18
  {
    id: 'sale-031',
    productName: 'Mechanical Keyboard',
    quantity: 1,
    unitPrice: 89.99,
    totalAmount: 89.99,
    date: getRelativeDate(18, 9, 45),
  },
  {
    id: 'sale-032',
    productName: 'Monitor Stand',
    quantity: 2,
    unitPrice: 49.99,
    totalAmount: 99.98,
    date: getRelativeDate(18, 13, 15),
  },
  // Day 21 (Three weeks ago)
  {
    id: 'sale-033',
    productName: 'Webcam HD',
    quantity: 1,
    unitPrice: 59.99,
    totalAmount: 59.99,
    date: getRelativeDate(21, 10, 20),
  },
  {
    id: 'sale-034',
    productName: 'USB Hub 7-Port',
    quantity: 3,
    unitPrice: 24.99,
    totalAmount: 74.97,
    date: getRelativeDate(21, 14, 50),
  },
  // Day 24
  {
    id: 'sale-035',
    productName: 'Laptop Stand Aluminum',
    quantity: 1,
    unitPrice: 39.99,
    totalAmount: 39.99,
    date: getRelativeDate(24, 11, 0),
  },
  {
    id: 'sale-036',
    productName: 'LED Desk Lamp',
    quantity: 3,
    unitPrice: 34.99,
    totalAmount: 104.97,
    date: getRelativeDate(24, 15, 30),
  },
  // Day 27
  {
    id: 'sale-037',
    productName: 'Mousepad XL Gaming',
    quantity: 2,
    unitPrice: 19.99,
    totalAmount: 39.98,
    date: getRelativeDate(27, 10, 15),
  },
  {
    id: 'sale-038',
    productName: 'Wireless Charger Pad',
    quantity: 4,
    unitPrice: 35.99,
    totalAmount: 143.96,
    date: getRelativeDate(27, 14, 45),
  },
  // Day 30 (Previous month data for trends)
  {
    id: 'sale-039',
    productName: 'Bluetooth Speaker Mini',
    quantity: 3,
    unitPrice: 55.99,
    totalAmount: 167.97,
    date: getRelativeDate(30, 9, 30),
  },
  {
    id: 'sale-040',
    productName: 'Screen Cleaner Kit',
    quantity: 10,
    unitPrice: 8.99,
    totalAmount: 89.9,
    date: getRelativeDate(30, 13, 20),
  },
  // Day 32
  {
    id: 'sale-041',
    productName: 'Headphone Stand Wood',
    quantity: 2,
    unitPrice: 22.99,
    totalAmount: 45.98,
    date: getRelativeDate(32, 10, 45),
  },
  {
    id: 'sale-042',
    productName: 'Ergonomic Chair Mat',
    quantity: 3,
    unitPrice: 45.99,
    totalAmount: 137.97,
    date: getRelativeDate(32, 15, 0),
  },
  // Day 35
  {
    id: 'sale-043',
    productName: 'Wireless Mouse',
    quantity: 5,
    unitPrice: 29.99,
    totalAmount: 149.95,
    date: getRelativeDate(35, 11, 15),
  },
  {
    id: 'sale-044',
    productName: 'USB-C Cable',
    quantity: 7,
    unitPrice: 12.99,
    totalAmount: 90.93,
    date: getRelativeDate(35, 14, 30),
  },
  // Day 38
  {
    id: 'sale-045',
    productName: 'Mechanical Keyboard',
    quantity: 2,
    unitPrice: 89.99,
    totalAmount: 179.98,
    date: getRelativeDate(38, 9, 0),
  },
  {
    id: 'sale-046',
    productName: 'Monitor Stand',
    quantity: 1,
    unitPrice: 49.99,
    totalAmount: 49.99,
    date: getRelativeDate(38, 12, 45),
  },
  // Day 40
  {
    id: 'sale-047',
    productName: 'Webcam HD',
    quantity: 4,
    unitPrice: 59.99,
    totalAmount: 239.96,
    date: getRelativeDate(40, 10, 30),
  },
  {
    id: 'sale-048',
    productName: 'USB Hub 7-Port',
    quantity: 5,
    unitPrice: 24.99,
    totalAmount: 124.95,
    date: getRelativeDate(40, 14, 15),
  },
]

/** Period filter options */
const PERIOD_FILTER_OPTIONS = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
]

/** Days of week for chart labels */
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * Get the start of the week (Sunday) for a given date
 */
const getWeekStart = (date: Date): Date => {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Get the end of the week (Saturday) for a given date
 */
const getWeekEnd = (date: Date): Date => {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() + (6 - day))
  d.setHours(23, 59, 59, 999)
  return d
}

/**
 * Get the start of the month for a given date
 */
const getMonthStart = (date: Date): Date => {
  const d = new Date(date)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Get the end of the month for a given date
 */
const getMonthEnd = (date: Date): Date => {
  const d = new Date(date)
  d.setMonth(d.getMonth() + 1)
  d.setDate(0)
  d.setHours(23, 59, 59, 999)
  return d
}

/**
 * Format date as a consistent key for grouping
 */
const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

/**
 * ReportPage Component
 *
 * A sales report page featuring:
 * - Weekly Sales Chart (Chart.js bar chart)
 * - Table of Sales per Day
 * - Filter by Week / Month
 * - Summary statistics
 */
const ReportPage: React.FC = () => {
  const [periodFilter, setPeriodFilter] = useState<string>('week')

  /**
   * Filter sales based on selected period
   */
  const filteredSales = useMemo(() => {
    const now = new Date()
    let startDate: Date
    let endDate: Date

    if (periodFilter === 'week') {
      startDate = getWeekStart(now)
      endDate = getWeekEnd(now)
    } else {
      startDate = getMonthStart(now)
      endDate = getMonthEnd(now)
    }

    return SALES_DATA.filter(
      (sale) => sale.date >= startDate && sale.date <= endDate,
    ).sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [periodFilter])

  /**
   * Aggregate sales by day
   */
  const dailySales = useMemo((): DailySales[] => {
    const salesByDay = new Map<string, DailySales>()

    filteredSales.forEach((sale) => {
      const dateKey = formatDateKey(sale.date)

      if (salesByDay.has(dateKey)) {
        const existing = salesByDay.get(dateKey)!
        existing.totalAmount += sale.totalAmount
        existing.transactionCount += 1
        existing.itemsSold += sale.quantity
      } else {
        salesByDay.set(dateKey, {
          date: new Date(dateKey),
          dateKey,
          totalAmount: sale.totalAmount,
          transactionCount: 1,
          itemsSold: sale.quantity,
        })
      }
    })

    return Array.from(salesByDay.values()).sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    )
  }, [filteredSales])

  /**
   * Aggregate sales by week for chart
   */
  const weeklySales = useMemo((): WeeklySales[] => {
    const salesByWeek = new Map<string, WeeklySales>()
    const now = new Date()

    // Get last 4 weeks for chart display
    for (let i = 0; i < 4; i++) {
      const weekDate = new Date(now)
      weekDate.setDate(weekDate.getDate() - i * 7)
      const weekStart = getWeekStart(weekDate)
      const weekEnd = getWeekEnd(weekDate)
      const weekKey = formatDateKey(weekStart)

      if (!salesByWeek.has(weekKey)) {
        const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

        salesByWeek.set(weekKey, {
          weekLabel,
          weekStart,
          weekEnd,
          totalAmount: 0,
          transactionCount: 0,
          itemsSold: 0,
        })
      }
    }

    // Aggregate sales into weeks
    SALES_DATA.forEach((sale) => {
      const saleWeekStart = getWeekStart(sale.date)
      const weekKey = formatDateKey(saleWeekStart)

      if (salesByWeek.has(weekKey)) {
        const week = salesByWeek.get(weekKey)!
        week.totalAmount += sale.totalAmount
        week.transactionCount += 1
        week.itemsSold += sale.quantity
      }
    })

    return Array.from(salesByWeek.values()).sort(
      (a, b) => a.weekStart.getTime() - b.weekStart.getTime(),
    )
  }, [])

  /**
   * Chart data for weekly sales visualization
   */
  const chartData = useMemo((): ChartData<'bar'> => {
    if (periodFilter === 'week') {
      // For week view, show daily breakdown
      const now = new Date()
      const weekStart = getWeekStart(now)
      const dailyData: number[] = new Array(7).fill(0)
      const labels = DAYS_OF_WEEK.map((day, index) => {
        const date = new Date(weekStart)
        date.setDate(date.getDate() + index)
        return `${day} ${date.getDate()}`
      })

      filteredSales.forEach((sale) => {
        const dayIndex = sale.date.getDay()
        dailyData[dayIndex] += sale.totalAmount
      })

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
            barThickness: 40,
          },
        ],
      }
    } else {
      // For month view, show weekly breakdown
      return {
        labels: weeklySales.map((week) => week.weekLabel),
        datasets: [
          {
            label: 'Weekly Sales ($)',
            data: weeklySales.map((week) => week.totalAmount),
            backgroundColor: 'rgba(56, 112, 230, 0.8)',
            borderColor: 'rgb(56, 112, 230)',
            borderWidth: 1,
            borderRadius: 6,
            barThickness: 60,
          },
        ],
      }
    }
  }, [filteredSales, weeklySales, periodFilter])

  /**
   * Chart options configuration
   */
  const chartOptions = useMemo(
    (): ChartOptions<'bar'> => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text:
            periodFilter === 'week'
              ? 'Daily Sales This Week'
              : 'Weekly Sales This Month',
          font: {
            size: 16,
            weight: 'bold',
          },
          color: '#0a0a0a',
          padding: {
            bottom: 20,
          },
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
    [periodFilter],
  )

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
      daysWithSales: dailySales.length,
    }
  }, [filteredSales, dailySales])

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
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  /**
   * Get period label for display (used inline with filter)
   */
  const getPeriodLabel = (): string => {
    if (periodFilter === 'week') {
      const now = new Date()
      const weekStart = getWeekStart(now)
      const weekEnd = getWeekEnd(now)
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    } else {
      const now = new Date()
      return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }
  }

  return (
    <>
      <PageHead
        title="Sales Report"
        description="View sales analytics, charts, and daily performance metrics."
      />

      <div className="space-y-6">
        {/* Page Header - Period info now integrated here */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-headline flex items-center gap-2">
              Sales Report
            </h1>
            <p className="mt-1 text-muted">
              View sales analytics, charts, and daily performance metrics.
            </p>
          </div>

          {/* Period Filter with inline date range */}
          <div className="flex flex-col items-start sm:items-end gap-2">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Period:
              </span>
              <Dropdown
                options={PERIOD_FILTER_OPTIONS}
                value={periodFilter}
                onChange={setPeriodFilter}
                placeholder="Select period"
                size="md"
              />
            </div>
            {/* Date range shown as subtle text below dropdown */}
            <span className="text-xs text-muted">
              {getPeriodLabel()}
            </span>
          </div>
        </div>

        {/* Summary Statistics Cards - Now directly after header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card.Root padding="md">
            <Card.Body>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
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
                  <TrendingUp className="h-5 w-5 text-success" />
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
                  <Package className="h-5 w-5 text-info" />
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
                  <BarChart3 className="h-5 w-5 text-warning" />
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

        {/* Sales Chart */}
        <Card.Root padding="lg">
          <Card.Header>
            <Card.Title as="h3">
              {periodFilter === 'week'
                ? 'Weekly Sales Chart'
                : 'Monthly Sales Chart'}
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <div className="h-80">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </Card.Body>
        </Card.Root>

        {/* Daily Sales Table */}
        <Card.Root padding="md">
          <Card.Header>
            <Card.Title as="h3">Sales Per Day</Card.Title>
          </Card.Header>
          <Card.Body className="p-0">
            {dailySales.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={BarChart3}
                  title="No sales data"
                  description={`No sales recorded for ${periodFilter === 'week' ? 'this week' : 'this month'}.`}
                />
              </div>
            ) : (
              <Table.ScrollArea>
                <Table.Root variant="default" size="md" hoverable stickyHeader>
                  <Table.Header>
                    <Table.Row disableHover>
                      <Table.Head>Date</Table.Head>
                      <Table.Head align="center">Transactions</Table.Head>
                      <Table.Head align="center">Items Sold</Table.Head>
                      <Table.Head align="right">Total Revenue</Table.Head>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {dailySales.map((day) => (
                      <Table.Row key={day.dateKey}>
                        <Table.Cell>
                          <span className="font-medium text-headline whitespace-nowrap">
                            {formatDate(day.date)}
                          </span>
                        </Table.Cell>
                        <Table.Cell align="center">
                          <span className="text-text">
                            {day.transactionCount}
                          </span>
                        </Table.Cell>
                        <Table.Cell align="center">
                          <span className="text-text">{day.itemsSold}</span>
                        </Table.Cell>
                        <Table.Cell align="right">
                          <span
                            className={cn(
                              'font-semibold',
                              day.totalAmount >= 100
                                ? 'text-success'
                                : 'text-headline',
                            )}
                          >
                            {formatPrice(day.totalAmount)}
                          </span>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>

                  {/* Summary Row */}
                  <Table.Footer>
                    <Table.Row
                      disableHover
                      className="bg-surface-1 font-semibold"
                    >
                      <Table.Cell>
                        <span className="text-headline">Total</span>
                      </Table.Cell>
                      <Table.Cell align="center">
                        <span className="text-headline">
                          {summaryStats.totalTransactions}
                        </span>
                      </Table.Cell>
                      <Table.Cell align="center">
                        <span className="text-headline">
                          {summaryStats.totalItems}
                        </span>
                      </Table.Cell>
                      <Table.Cell align="right">
                        <span className="text-primary text-lg">
                          {formatPrice(summaryStats.totalRevenue)}
                        </span>
                      </Table.Cell>
                    </Table.Row>
                  </Table.Footer>
                </Table.Root>
              </Table.ScrollArea>
            )}
          </Card.Body>
        </Card.Root>
      </div>
    </>
  )
}

export default ReportPage