/**
 * useProducts Hook
 *
 * Custom hook for fetching and managing products with filters.
 * Uses derived loading state pattern for React best practices.
 *
 * Note: This hook no longer fetches suppliers. Use useSuppliers hook
 * separately for supplier data (for dropdowns, etc.).
 *
 * @module hooks/useProducts
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  productService,
  type Product,
  type ProductStats,
  type GetProductsParams,
} from '@/services/product.service'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Filter options for fetching products.
 * Uses supplierId for filtering by supplier.
 */
interface UseProductsOptions {
  search?: string
  stockStatus?: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock'
  supplierId?: string
}

/**
 * Hook return type
 */
interface UseProductsReturn {
  products: Product[]
  stats: ProductStats
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Fetch result type for internal use
 */
type FetchResult =
  | { success: true; products: Product[]; stats: ProductStats }
  | { success: false; error?: string }

/**
 * Default stats value
 */
const DEFAULT_STATS: ProductStats = {
  totalProducts: 0,
  totalUnits: 0,
  totalValue: 0,
  lowStockCount: 0,
  outOfStockCount: 0,
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Custom hook to fetch and manage products with filters and stats.
 *
 * Note: Suppliers are no longer fetched by this hook. Use the useSuppliers
 * hook separately for supplier data (for filter dropdowns, create/edit forms).
 *
 * @example
 * ```tsx
 * const { products, stats, loading, error, refetch } = useProducts({
 *   search: 'mouse',
 *   stockStatus: 'low-stock',
 *   supplierId: '507f1f77bcf86cd799439011'
 * })
 * ```
 */
export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const { search = '', stockStatus = 'all', supplierId = '' } = options

  // ============================================================================
  // State Management
  // ============================================================================

  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<ProductStats>(DEFAULT_STATS)
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
    () => `${search}|${stockStatus}|${supplierId}|${refetchCounter}`,
    [search, stockStatus, supplierId, refetchCounter],
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
        const params: GetProductsParams = {}
        if (search.trim()) {
          params.search = search.trim()
        }
        if (stockStatus !== 'all') {
          params.stockStatus = stockStatus
        }
        if (supplierId) {
          params.supplierId = supplierId
        }

        // Fetch products and stats in parallel (suppliers removed)
        const [fetchedProducts, fetchedStats] = await Promise.all([
          productService.getProducts(params, signal),
          productService.getProductStats(signal),
        ])

        if (signal.aborted) {
          return { success: false }
        }

        return {
          success: true,
          products: fetchedProducts,
          stats: fetchedStats,
        }
      } catch (err: unknown) {
        if (
          (err as { isAborted?: boolean }).isAborted ||
          (err as Error).name === 'AbortError'
        ) {
          return { success: false }
        }

        console.error('Failed to fetch products:', err)
        return {
          success: false,
          error: 'Failed to load products. Please try again.',
        }
      }
    },
    [search, stockStatus, supplierId],
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
        setProducts(result.products)
        setStats(result.stats)
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
    products,
    stats,
    loading,
    error,
    refetch,
  }
}