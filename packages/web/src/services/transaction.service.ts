/**
 * Transaction Service
 *
 * Exports the appropriate transaction service based on environment.
 * - API mode: Uses HTTP client for backend communication
 * - Demo mode: Uses localStorage for offline demo
 *
 * @module services/transaction.service
 */

import { getDataSource } from '@/lib/data-source'
import apiClient from '@/lib/api-client'
import {
  localTransactionService,
  type LocalTransaction,
  type LocalTransactionStats,
  type LocalDailySales,
  type LocalDailySalesResponse,
  type GetLocalTransactionsParams,
} from '@/lib/local-storage'

// ============================================================================
// TYPE DEFINITIONS (Re-export for consumers)
// ============================================================================

/**
 * Transaction interface matching server response
 */
export type Transaction = LocalTransaction

/**
 * Transaction statistics
 */
export type TransactionStats = LocalTransactionStats

/**
 * Daily sales data
 */
export type DailySales = LocalDailySales

/**
 * Daily sales response from API
 */
export type DailySalesResponse = LocalDailySalesResponse

/**
 * Query parameters for fetching transactions
 */
export type GetTransactionsParams = GetLocalTransactionsParams & {
  [key: string]: string | undefined
}

// ============================================================================
// API SERVICE CLASS
// ============================================================================

/**
 * API Transaction Service - HTTP client for transaction operations
 */
class ApiTransactionService {
  private readonly baseUrl = '/api/v1/admin/transactions'

  /**
   * Get all transactions with optional filters
   */
  async getTransactions(
    params?: GetTransactionsParams,
    signal?: AbortSignal,
  ): Promise<Transaction[]> {
    try {
      const response = await apiClient.get<{ transactions: Transaction[] }>(
        this.baseUrl,
        { params, signal },
      )
      return response.data.transactions
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      throw error
    }
  }

  /**
   * Get single transaction by ID
   */
  async getTransactionById(
    id: string,
    signal?: AbortSignal,
  ): Promise<Transaction> {
    try {
      const response = await apiClient.get<Transaction>(
        `${this.baseUrl}/${id}`,
        { signal },
      )
      return response.data
    } catch (error) {
      console.error('Failed to fetch transaction:', error)
      throw error
    }
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(
    params?: { period?: string; startDate?: string; endDate?: string },
    signal?: AbortSignal,
  ): Promise<TransactionStats> {
    try {
      const response = await apiClient.get<TransactionStats>(
        `${this.baseUrl}/stats`,
        { params, signal },
      )
      return response.data
    } catch (error) {
      console.error('Failed to fetch transaction stats:', error)
      throw error
    }
  }

  /**
   * Get daily sales data for reporting
   */
  async getDailySales(
    params?: { period?: string; startDate?: string; endDate?: string },
    signal?: AbortSignal,
  ): Promise<DailySalesResponse> {
    try {
      const response = await apiClient.get<DailySalesResponse>(
        `${this.baseUrl}/daily-sales`,
        { params, signal },
      )
      return response.data
    } catch (error) {
      console.error('Failed to fetch daily sales:', error)
      throw error
    }
  }

  /**
   * Get recent transactions
   */
  async getRecentTransactions(
    limit?: number,
    signal?: AbortSignal,
  ): Promise<Transaction[]> {
    try {
      const params = limit ? { limit: String(limit) } : undefined
      const response = await apiClient.get<{ transactions: Transaction[] }>(
        `${this.baseUrl}/recent`,
        { params, signal },
      )
      return response.data.transactions
    } catch (error) {
      console.error('Failed to fetch recent transactions:', error)
      throw error
    }
  }
}

// ============================================================================
// SERVICE EXPORT
// ============================================================================

/** API service instance */
const apiTransactionService = new ApiTransactionService()

/**
 * Transaction service - automatically uses correct implementation based on environment.
 *
 * In demo mode (VITE_DATA_SOURCE=local), uses localStorage.
 * In API mode (VITE_DATA_SOURCE=api), uses HTTP backend.
 */
export const transactionService = getDataSource() === 'local'
  ? localTransactionService
  : apiTransactionService