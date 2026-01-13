/**
 * useTransactions Hook
 *
 * Custom hook for fetching and managing transactions with filters.
 * Uses derived loading state pattern for React best practices.
 *
 * @module hooks/useTransactions
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  transactionService,
  type Transaction,
  type TransactionStats,
  type DailySales,
} from '@/services/transaction.service'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Filter options for fetching transactions
 */
export interface UseTransactionsOptions {
  search?: string
  period?: 'today' | 'week' | 'month'
  startDate?: string
  endDate?: string
}

/**
 * Hook return type
 */
interface UseTransactionsReturn {
  transactions: Transaction[]
  stats: TransactionStats
  dailySales: DailySales[]
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Fetch result type for internal use
 */
type FetchResult =
  | {
      success: true
      transactions: Transaction[]
      stats: TransactionStats
      dailySales: DailySales[]
    }
  | { success: false; error?: string }

/**
 * Default stats value
 */
const DEFAULT_STATS: TransactionStats = {
  totalRevenue: 0,
  totalTransactions: 0,
  totalItemsSold: 0,
  averageOrderValue: 0,
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Custom hook to fetch and manage transactions with filters and stats
 *
 * @example
 * ```tsx
 * const { transactions, stats, dailySales, loading, error, refetch } = useTransactions({
 *   search: 'mouse',
 *   period: 'week'
 * })
 * ```
 */
export function useTransactions(
  options: UseTransactionsOptions = {},
): UseTransactionsReturn {
  const { search = '', period, startDate, endDate } = options

  // ============================================================================
  // State Management
  // ============================================================================

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<TransactionStats>(DEFAULT_STATS)
  const [dailySales, setDailySales] = useState<DailySales[]>([])
  const [error, setError] = useState<string | null>(null)

  // Counter to force refetches with the same params
  const [refetchCounter, setRefetchCounter] = useState(0)

  // Track which fetch params we've completed
  const [completedFetchKey, setCompletedFetchKey] = useState<string | null>(null)

  // ============================================================================
  // Derived State
  // ============================================================================

  // Create a stable key for current fetch params
  const fetchKey = useMemo(
    () =>
      `${search}|${period ?? ''}|${startDate ?? ''}|${endDate ?? ''}|${refetchCounter}`,
    [search, period, startDate, endDate, refetchCounter],
  )

  // Derive loading state
  const loading = completedFetchKey !== fetchKey

  // ============================================================================
  // Refs
  // ============================================================================

  const abortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)

  // ============================================================================
  // Fetch Logic
  // ============================================================================

  const performFetch = useCallback(
    async (signal: AbortSignal): Promise<FetchResult> => {
      try {
        // Build params for request
        const params: Record<string, string | undefined> = {}
        if (search.trim()) {
          params.search = search.trim()
        }
        if (period) {
          params.period = period
        }
        if (startDate) {
          params.startDate = startDate
        }
        if (endDate) {
          params.endDate = endDate
        }

        // Fetch transactions, stats, and daily sales in parallel
        const [fetchedTransactions, fetchedStats, dailySalesResponse] =
          await Promise.all([
            transactionService.getTransactions(params, signal),
            transactionService.getTransactionStats(params, signal),
            transactionService.getDailySales(params, signal),
          ])

        if (signal.aborted) {
          return { success: false }
        }

        return {
          success: true,
          transactions: fetchedTransactions,
          stats: fetchedStats,
          dailySales: dailySalesResponse.dailySales,
        }
      } catch (err: unknown) {
        if (
          (err as { isAborted?: boolean }).isAborted ||
          (err as Error).name === 'AbortError'
        ) {
          return { success: false }
        }

        console.error('Failed to fetch transactions:', err)
        return {
          success: false,
          error: 'Failed to load transactions. Please try again.',
        }
      }
    },
    [search, period, startDate, endDate],
  )

  // ============================================================================
  // Effect: Fetch data when params change
  // ============================================================================

  useEffect(() => {
    abortControllerRef.current?.abort()

    const controller = new AbortController()
    abortControllerRef.current = controller

    const currentFetchKey = fetchKey

    performFetch(controller.signal).then((result) => {
      if (!isMountedRef.current || controller.signal.aborted) {
        return
      }

      if (result.success) {
        setTransactions(result.transactions)
        setStats(result.stats)
        setDailySales(result.dailySales)
        setError(null)
        setCompletedFetchKey(currentFetchKey)
      } else if (result.error) {
        setError(result.error)
        setCompletedFetchKey(currentFetchKey)
      }
    })

    return () => {
      controller.abort()
    }
  }, [performFetch, fetchKey])

  // ============================================================================
  // Effect: Track component mount status
  // ============================================================================

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // ============================================================================
  // Actions
  // ============================================================================

  const refetch = useCallback(() => {
    setRefetchCounter((c) => c + 1)
  }, [])

  // ============================================================================
  // Return
  // ============================================================================

  return {
    transactions,
    stats,
    dailySales,
    loading,
    error,
    refetch,
  }
}