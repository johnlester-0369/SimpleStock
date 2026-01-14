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
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Alert from '@/components/ui/Alert'
import {
  BarChart3,
  TrendingUp,
  Calendar,
  DollarSign,
  Package,
} from 'lucide-react'
import { cn } from '@/utils/cn.util'

// Import hooks
import { useTransactions } from '@/hooks/useTransactions'

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

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
 * ReportPage Component
 *
 * A sales report page featuring:
 * - Weekly Sales Chart (Chart.js bar chart)
 * - Table of Sales per Day
 * - Filter by Week / Month
 * - Summary statistics
 * - Dynamic data from API via hooks
 */
const ReportPage: React.FC = () => {
  const [periodFilter, setPeriodFilter] = useState<string>('week')

  // Fetch transactions with period filter
  const {
    transactions,
    stats,
    dailySales,
    loading,
    error: fetchError,
    refetch,
  } = useTransactions({
    period: periodFilter as 'week' | 'month',
  })

  /**
   * Chart data for sales visualization
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

      // Aggregate transactions by day of week
      transactions.forEach((transaction) => {
        const transactionDate = new Date(transaction.createdAt)
        const dayIndex = transactionDate.getDay()
        dailyData[dayIndex] += transaction.totalAmount
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
      // For month view, show weekly breakdown using dailySales data
      // Group dailySales by week
      const weeklyData: Map<string, number> = new Map()
      const now = new Date()
      
      // Initialize last 4 weeks
      for (let i = 0; i < 4; i++) {
        const weekDate = new Date(now)
        weekDate.setDate(weekDate.getDate() - i * 7)
        const weekStartDate = getWeekStart(weekDate)
        const weekEndDate = getWeekEnd(weekDate)
        const weekLabel = `${weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        weeklyData.set(weekLabel, 0)
      }

      // Aggregate daily sales into weeks
      dailySales.forEach((day) => {
        const dayDate = new Date(day.date)
        const weekStartDate = getWeekStart(dayDate)
        const weekEndDate = getWeekEnd(dayDate)
        const weekLabel = `${weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        
        const existing = weeklyData.get(weekLabel) ?? 0
        weeklyData.set(weekLabel, existing + day.totalAmount)
      })

      const sortedWeeks = Array.from(weeklyData.entries()).reverse()

      return {
        labels: sortedWeeks.map(([label]) => label),
        datasets: [
          {
            label: 'Weekly Sales ($)',
            data: sortedWeeks.map(([, amount]) => amount),
            backgroundColor: 'rgba(56, 112, 230, 0.8)',
            borderColor: 'rgb(56, 112, 230)',
            borderWidth: 1,
            borderRadius: 6,
            barThickness: 60,
          },
        ],
      }
    }
  }, [transactions, dailySales, periodFilter])

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
    [periodFilter],
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
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
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
      const weekStartDate = getWeekStart(now)
      const weekEndDate = getWeekEnd(now)
      return `${weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    } else {
      const now = new Date()
      return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }
  }

  // Show loading state during initial load
  if (loading && transactions.length === 0) {
    return <LoadingSpinner />
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
            <span className="text-xs text-muted">{getPeriodLabel()}</span>
          </div>
        </div>

        {/* Fetch Error */}
        {fetchError && (
          <Alert
            variant="error"
            title={fetchError}
            onClose={() => refetch()}
          />
        )}

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
                  <BarChart3 className="h-5 w-5 text-warning" />
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
                      <Table.Row key={day.date}>
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
                          {stats.totalTransactions}
                        </span>
                      </Table.Cell>
                      <Table.Cell align="center">
                        <span className="text-headline">
                          {stats.totalItemsSold}
                        </span>
                      </Table.Cell>
                      <Table.Cell align="right">
                        <span className="text-primary text-lg">
                          {formatPrice(stats.totalRevenue)}
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