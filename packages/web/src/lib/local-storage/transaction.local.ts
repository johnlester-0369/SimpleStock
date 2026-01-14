/**
 * Local Transaction Service
 *
 * localStorage-based transaction service for demo mode.
 * Implements the same interface as the API transaction service.
 *
 * @module lib/local-storage/transaction.local
 */

import {
  STORAGE_KEYS,
  getStorageItem,
  setStorageItem,
  generateId,
  getCurrentTimestamp,
} from './storage.util'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Transaction interface
 */
export interface LocalTransaction {
  id: string
  userId: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalAmount: number
  createdAt: string
  updatedAt: string
}

/**
 * Transaction statistics
 */
export interface LocalTransactionStats {
  totalRevenue: number
  totalTransactions: number
  totalItemsSold: number
  averageOrderValue: number
}

/**
 * Daily sales data
 */
export interface LocalDailySales {
  date: string
  totalAmount: number
  transactionCount: number
  itemsSold: number
}

/**
 * Daily sales response
 */
export interface LocalDailySalesResponse {
  dailySales: LocalDailySales[]
  period: {
    startDate: string
    endDate: string
  }
}

/**
 * Query parameters
 */
export interface GetLocalTransactionsParams {
  search?: string
  period?: 'today' | 'week' | 'month'
  startDate?: string
  endDate?: string
}

/**
 * Create transaction input (internal use)
 */
export interface CreateLocalTransactionData {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalAmount: number
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEMO_USER_ID = 'demo-user-001'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get start of day for a date
 */
function getStartOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Get end of day for a date
 */
function getEndOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

/**
 * Get start of week (Sunday)
 */
function getStartOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Get end of week (Saturday)
 */
function getEndOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() + (6 - day))
  d.setHours(23, 59, 59, 999)
  return d
}

/**
 * Get start of month
 */
function getStartOfMonth(date: Date): Date {
  const d = new Date(date)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Get end of month
 */
function getEndOfMonth(date: Date): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + 1)
  d.setDate(0)
  d.setHours(23, 59, 59, 999)
  return d
}

/**
 * Get date range for period filter
 */
function getDateRange(
  period?: 'today' | 'week' | 'month',
): { start: Date; end: Date } {
  const now = new Date()

  switch (period) {
    case 'today':
      return { start: getStartOfDay(now), end: getEndOfDay(now) }
    case 'week':
      return { start: getStartOfWeek(now), end: getEndOfWeek(now) }
    case 'month':
      return { start: getStartOfMonth(now), end: getEndOfMonth(now) }
    default: {
      // Return all time (year range)
      const yearAgo = new Date(now)
      yearAgo.setFullYear(yearAgo.getFullYear() - 1)
      return { start: yearAgo, end: now }
    }
  }
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0]
}

// ============================================================================
// SEED DATA
// ============================================================================

/**
 * Generate sample transactions for demo mode
 */
function getDefaultTransactions(): LocalTransaction[] {
  const transactions: LocalTransaction[] = []
  const now = new Date()

  // Sample products for transactions
  const sampleProducts = [
    { name: 'Wireless Mouse', price: 29.99 },
    { name: 'Mechanical Keyboard', price: 89.99 },
    { name: 'USB-C Hub', price: 49.99 },
    { name: 'Monitor Stand', price: 34.99 },
    { name: 'Laptop Stand', price: 44.99 },
    { name: 'Bluetooth Speaker', price: 59.99 },
  ]

  // Generate transactions for the past 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(now)
    date.setDate(date.getDate() - dayOffset)

    // Random number of transactions per day (1-4)
    const transactionsPerDay = Math.floor(Math.random() * 4) + 1

    for (let i = 0; i < transactionsPerDay; i++) {
      const product =
        sampleProducts[Math.floor(Math.random() * sampleProducts.length)]
      const quantity = Math.floor(Math.random() * 3) + 1

      // Set random time during the day
      date.setHours(
        9 + Math.floor(Math.random() * 9),
        Math.floor(Math.random() * 60),
        Math.floor(Math.random() * 60),
      )

      transactions.push({
        id: generateId(),
        userId: DEMO_USER_ID,
        productId: generateId(),
        productName: product.name,
        quantity,
        unitPrice: product.price,
        totalAmount: product.price * quantity,
        createdAt: date.toISOString(),
        updatedAt: date.toISOString(),
      })
    }
  }

  // Sort by date descending
  transactions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return transactions
}

// ============================================================================
// LOCAL TRANSACTION SERVICE
// ============================================================================

/**
 * Local transaction service using localStorage
 */
class LocalTransactionService {
  /**
   * Initialize storage with seed data if empty
   */
  private initializeIfEmpty(): LocalTransaction[] {
    let transactions = getStorageItem<LocalTransaction[]>(
      STORAGE_KEYS.TRANSACTIONS,
      [],
    )
    if (transactions.length === 0) {
      transactions = getDefaultTransactions()
      setStorageItem(STORAGE_KEYS.TRANSACTIONS, transactions)
    }
    return transactions
  }

  /**
   * Get all transactions with optional filters
   * @param params - Query parameters for filtering
   * @param signal - AbortSignal for request cancellation (unused in local mode)
   */
  async getTransactions(
    params?: GetLocalTransactionsParams,
    signal?: AbortSignal,
  ): Promise<LocalTransaction[]> {
    // Signal parameter kept for API compatibility
    void signal

    await new Promise((resolve) => setTimeout(resolve, 200))

    let transactions = this.initializeIfEmpty()

    // Apply period filter
    if (params?.period) {
      const { start, end } = getDateRange(params.period)
      transactions = transactions.filter((t) => {
        const date = new Date(t.createdAt)
        return date >= start && date <= end
      })
    }

    // Apply custom date range
    if (params?.startDate) {
      const start = new Date(params.startDate)
      transactions = transactions.filter(
        (t) => new Date(t.createdAt) >= start,
      )
    }
    if (params?.endDate) {
      const end = new Date(params.endDate)
      end.setHours(23, 59, 59, 999)
      transactions = transactions.filter((t) => new Date(t.createdAt) <= end)
    }

    // Apply search filter
    if (params?.search) {
      const searchLower = params.search.toLowerCase()
      transactions = transactions.filter((t) =>
        t.productName.toLowerCase().includes(searchLower),
      )
    }

    // Sort by date descending
    transactions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

    return transactions
  }

  /**
   * Get single transaction by ID
   * @param id - Transaction ID
   * @param signal - AbortSignal for request cancellation (unused in local mode)
   */
  async getTransactionById(
    id: string,
    signal?: AbortSignal,
  ): Promise<LocalTransaction> {
    // Signal parameter kept for API compatibility
    void signal

    await new Promise((resolve) => setTimeout(resolve, 100))

    const transactions = this.initializeIfEmpty()
    const transaction = transactions.find((t) => t.id === id)

    if (!transaction) {
      throw new Error('Transaction not found')
    }

    return transaction
  }

  /**
   * Get transaction statistics
   * @param params - Query parameters for filtering
   * @param signal - AbortSignal for request cancellation (unused in local mode)
   */
  async getTransactionStats(
    params?: { period?: string; startDate?: string; endDate?: string },
    signal?: AbortSignal,
  ): Promise<LocalTransactionStats> {
    // Signal parameter kept for API compatibility
    void signal

    await new Promise((resolve) => setTimeout(resolve, 100))

    // Get filtered transactions
    const transactions = await this.getTransactions({
      period: params?.period as 'today' | 'week' | 'month' | undefined,
      startDate: params?.startDate,
      endDate: params?.endDate,
    })

    const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0)
    const totalTransactions = transactions.length
    const totalItemsSold = transactions.reduce((sum, t) => sum + t.quantity, 0)
    const averageOrderValue =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    return {
      totalRevenue,
      totalTransactions,
      totalItemsSold,
      averageOrderValue,
    }
  }

  /**
   * Get daily sales data
   * @param params - Query parameters for filtering
   * @param signal - AbortSignal for request cancellation (unused in local mode)
   */
  async getDailySales(
    params?: { period?: string; startDate?: string; endDate?: string },
    signal?: AbortSignal,
  ): Promise<LocalDailySalesResponse> {
    // Signal parameter kept for API compatibility
    void signal

    await new Promise((resolve) => setTimeout(resolve, 100))

    // Get filtered transactions
    const transactions = await this.getTransactions({
      period: params?.period as 'today' | 'week' | 'month' | undefined,
      startDate: params?.startDate,
      endDate: params?.endDate,
    })

    // Group by date
    const dailyMap = new Map<
      string,
      { totalAmount: number; transactionCount: number; itemsSold: number }
    >()

    transactions.forEach((t) => {
      const dateKey = formatDateKey(new Date(t.createdAt))
      const existing = dailyMap.get(dateKey) ?? {
        totalAmount: 0,
        transactionCount: 0,
        itemsSold: 0,
      }
      dailyMap.set(dateKey, {
        totalAmount: existing.totalAmount + t.totalAmount,
        transactionCount: existing.transactionCount + 1,
        itemsSold: existing.itemsSold + t.quantity,
      })
    })

    // Convert to array and sort by date
    const dailySales: LocalDailySales[] = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => b.date.localeCompare(a.date))

    // Calculate period range
    const { start, end } = getDateRange(
      params?.period as 'today' | 'week' | 'month' | undefined,
    )

    return {
      dailySales,
      period: {
        startDate: formatDateKey(start),
        endDate: formatDateKey(end),
      },
    }
  }

  /**
   * Get recent transactions
   * @param limit - Maximum number of transactions to return
   * @param signal - AbortSignal for request cancellation (unused in local mode)
   */
  async getRecentTransactions(
    limit?: number,
    signal?: AbortSignal,
  ): Promise<LocalTransaction[]> {
    // Signal parameter kept for API compatibility
    void signal

    await new Promise((resolve) => setTimeout(resolve, 100))

    let transactions = this.initializeIfEmpty()

    // Sort by date descending
    transactions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

    if (limit) {
      transactions = transactions.slice(0, limit)
    }

    return transactions
  }

  /**
   * Create a new transaction (internal use by product sell)
   */
  async createTransaction(
    data: CreateLocalTransactionData,
  ): Promise<LocalTransaction> {
    const transactions = this.initializeIfEmpty()
    const now = getCurrentTimestamp()

    const newTransaction: LocalTransaction = {
      id: generateId(),
      userId: DEMO_USER_ID,
      productId: data.productId,
      productName: data.productName,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      totalAmount: data.totalAmount,
      createdAt: now,
      updatedAt: now,
    }

    transactions.unshift(newTransaction)
    setStorageItem(STORAGE_KEYS.TRANSACTIONS, transactions)

    return newTransaction
  }
}

/** Singleton instance */
export const localTransactionService = new LocalTransactionService()