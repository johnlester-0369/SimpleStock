/**
 * Transaction Service
 *
 * API client for transaction operations.
 * Communicates with the backend transaction endpoints.
 *
 * @module services/transaction.service
 */

import apiClient from '@/lib/api-client'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Transaction interface matching server response
 */
export interface Transaction {
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
export interface TransactionStats {
  totalRevenue: number
  totalTransactions: number
  totalItemsSold: number
  averageOrderValue: number
}

/**
 * Daily sales data
 */
export interface DailySales {
  date: string
  totalAmount: number
  transactionCount: number
  itemsSold: number
}

/**
 * Daily sales response from API
 */
export interface DailySalesResponse {
  dailySales: DailySales[]
  period: {
    startDate: string
    endDate: string
  }
}

/**
 * Query parameters for fetching transactions
 */
export interface GetTransactionsParams {
  search?: string
  period?: 'today' | 'week' | 'month'
  startDate?: string
  endDate?: string
  [key: string]: string | undefined
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

/**
 * Transaction Service - API client for transaction operations
 */
class TransactionService {
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

// Export singleton instance
export const transactionService = new TransactionService()