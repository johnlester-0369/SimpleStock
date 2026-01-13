/**
 * useSuppliers Hook
 *
 * Custom hook for fetching and managing suppliers with filters.
 * Uses derived loading state pattern for React best practices.
 *
 * @module hooks/useSuppliers
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  supplierService,
  type Supplier,
} from '@/services/supplier.service'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Filter options for fetching suppliers
 */
interface UseSuppliersOptions {
  search?: string
}

/**
 * Hook return type
 */
interface UseSuppliersReturn {
  suppliers: Supplier[]
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Fetch result type for internal use
 */
type FetchResult =
  | { success: true; suppliers: Supplier[] }
  | { success: false; error?: string }

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Custom hook to fetch and manage suppliers with filters
 *
 * @example
 * ```tsx
 * const { suppliers, loading, error, refetch } = useSuppliers({
 *   search: 'tech'
 * })
 * ```
 */
export function useSuppliers(options: UseSuppliersOptions = {}): UseSuppliersReturn {
  const { search = '' } = options

  // ============================================================================
  // State Management
  // ============================================================================

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
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
    () => `${search}|${refetchCounter}`,
    [search, refetchCounter],
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
        const params = search.trim() ? { search: search.trim() } : undefined
        const fetchedSuppliers = await supplierService.getSuppliers(
          params,
          signal,
        )

        if (signal.aborted) {
          return { success: false }
        }

        return {
          success: true,
          suppliers: fetchedSuppliers,
        }
      } catch (err: unknown) {
        if (
          (err as { isAborted?: boolean }).isAborted ||
          (err as Error).name === 'AbortError'
        ) {
          return { success: false }
        }

        console.error('Failed to fetch suppliers:', err)
        return {
          success: false,
          error: 'Failed to load suppliers. Please try again.',
        }
      }
    },
    [search],
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
        setSuppliers(result.suppliers)
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
    suppliers,
    loading,
    error,
    refetch,
  }
}